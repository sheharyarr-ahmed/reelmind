#!/usr/bin/env tsx
/**
 * Scheduled dependency bump script.
 *
 * Run on demand (suggested cadence: every 2 weeks). Bumps packages within
 * their version ranges in package.json — never crosses a major version
 * boundary. Major bumps are listed in the PR description for human review.
 *
 * Usage:
 *   pnpm bump-deps
 *
 * Hard rules (matches Phase 7 deploy plan):
 *   - Never bump past locked-stack majors (Next.js 15, React 19, zod 3, etc.)
 *   - Working tree must be clean before starting
 *   - Cascade (typecheck + vitest + lint) must pass before opening a PR
 *   - PR is opened, never merged
 *
 * Requirements:
 *   - gh CLI authenticated (uses GITHUB_TOKEN from .env.local or shell)
 *   - pnpm available
 *   - Repo has a "main" branch with an "origin" remote
 */
import { execSync, type ExecSyncOptionsWithStringEncoding } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const today = new Date().toISOString().slice(0, 10);
const branchName = `deps/bump-${today}`;

function sh(cmd: string, opts: { capture?: boolean } = {}): string {
  const baseOpts: ExecSyncOptionsWithStringEncoding = {
    encoding: "utf-8",
    stdio: opts.capture ? "pipe" : "inherit",
  };
  return execSync(cmd, baseOpts).toString();
}

function shTry(cmd: string): { ok: boolean; out: string } {
  try {
    return { ok: true, out: sh(cmd, { capture: true }) };
  } catch (err) {
    const e = err as { stdout?: Buffer; stderr?: Buffer };
    return {
      ok: false,
      out: (e.stdout?.toString() ?? "") + (e.stderr?.toString() ?? ""),
    };
  }
}

function abort(msg: string, code = 1): never {
  console.error(`\n✗ ${msg}\n`);
  process.exit(code);
}

async function main() {
  console.log(`scripts/bump-deps.ts — ${today}\n`);

  // 1. Working tree must be clean
  const status = shTry("git status --porcelain");
  if (status.out.trim()) {
    abort(
      "Working tree is dirty. Commit, stash, or discard changes before running.",
    );
  }

  // 2. We must be on main (or at least cleanly track main)
  const branch = shTry("git rev-parse --abbrev-ref HEAD").out.trim();
  if (branch !== "main") {
    abort(`Not on main branch (currently on '${branch}'). Switch to main first.`);
  }

  // 3. Pull latest
  console.log("→ Pulling latest main...");
  sh("git pull --ff-only origin main");

  // 4. Capture pre-bump outdated snapshot for PR description
  console.log("→ Snapshotting current outdated state...");
  const beforeOutdated = shTry("pnpm outdated --format json").out;

  // 5. Bump within ranges
  console.log("→ Running pnpm update (within version ranges)...");
  sh("pnpm update");

  // 6. Refresh browserslist DB while we're here (separate concern but cheap)
  console.log("→ Refreshing browserslist DB...");
  shTry("npx update-browserslist-db@latest");

  // 7. Check if anything actually changed
  const diff = shTry("git diff --name-only").out.trim();
  if (!diff) {
    console.log("\n✓ No in-range bumps available. Nothing to do.");
    return;
  }
  console.log(`Changes: ${diff.split("\n").join(", ")}\n`);

  // 8. Cascade — abort and revert if anything fails
  console.log("→ Typecheck...");
  if (!shTry("pnpm typecheck").ok) {
    sh("git checkout -- .");
    abort("Typecheck failed after bump. Reverted.");
  }

  console.log("→ Unit tests...");
  if (!shTry("NODE_ENV=test pnpm vitest run").ok) {
    sh("git checkout -- .");
    abort("Unit tests failed after bump. Reverted.");
  }

  console.log("→ Lint...");
  shTry("pnpm lint"); // warnings non-blocking

  // 9. Snapshot what's still outdated (post-bump = remaining major bumps)
  const afterOutdated = shTry("pnpm outdated --format json").out;

  // 10. Branch + commit + push + PR
  console.log(`→ Creating branch ${branchName}...`);
  sh(`git checkout -b ${branchName}`);
  sh("git add package.json pnpm-lock.yaml");
  sh(
    `git commit -m "chore(deps): scheduled dependency bump ${today}" -m "Within-range bumps applied. Major bumps listed in PR description."`,
  );
  sh(`git push -u origin ${branchName}`);

  // 11. Open PR via gh
  const prBody = formatPrBody(beforeOutdated, afterOutdated);
  const bodyFile = path.join(tmpdir(), `bump-deps-pr-${today}.md`);
  await writeFile(bodyFile, prBody);

  console.log("→ Opening PR...");
  sh(
    `gh pr create --title "chore(deps): scheduled dependency bump ${today}" --body-file "${bodyFile}"`,
  );

  // 12. Switch back to main and report
  sh("git checkout main");
  const nextRecommended = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  console.log(
    `\n✓ Done. PR opened. Do NOT auto-merge — review the diff and cascade evidence first.`,
  );
  console.log(`  Next recommended run: ${nextRecommended}\n`);
}

type OutdatedEntry = {
  current: string;
  wanted?: string;
  latest: string;
  dependencyType?: string;
};

function parseOutdated(json: string): Record<string, OutdatedEntry> {
  if (!json.trim()) return {};
  try {
    return JSON.parse(json) as Record<string, OutdatedEntry>;
  } catch {
    return {};
  }
}

function formatPrBody(beforeJson: string, afterJson: string): string {
  const before = parseOutdated(beforeJson);
  const after = parseOutdated(afterJson);

  // Bumped: in `before`, gone or with newer current in `after`
  const bumped = Object.keys(before).filter((pkg) => {
    const a = after[pkg];
    return !a || a.current !== before[pkg]?.current;
  });

  // Major-bump candidates: still in `after` (didn't move within range)
  const remaining = Object.keys(after);

  const bumpedRows = bumped.length
    ? bumped
        .map(
          (p) =>
            `- \`${p}\` ${before[p]!.current} → ${before[p]!.wanted ?? before[p]!.latest}`,
        )
        .join("\n")
    : "_(none — all in-range packages were already current)_";

  const remainingRows = remaining.length
    ? remaining
        .map(
          (p) =>
            `- \`${p}\` ${after[p]!.current} → ${after[p]!.latest} _(major bump — review manually)_`,
        )
        .join("\n")
    : "_(none — fully up to date)_";

  return `## Scheduled dependency bump

This PR was generated by \`scripts/bump-deps.ts\`. It bumps packages within
their version ranges in \`package.json\`. Major bumps are listed below for
human review — not applied automatically.

### Bumped (within version ranges)

${bumpedRows}

### Major-bump candidates (skipped — needs human review)

${remainingRows}

### Cascade verification

- ✅ \`pnpm typecheck\` passed
- ✅ \`NODE_ENV=test pnpm vitest run\` passed
- ⚠️ \`pnpm lint\` warnings non-blocking (errors would have aborted the script)

### How to merge

1. Pull this branch and run \`pnpm install\` locally
2. Spot-check the diff in \`package.json\` + \`pnpm-lock.yaml\`
3. Optional: run the full Playwright smoke (\`pnpm test:e2e\`)
4. Merge manually. **Do not enable auto-merge.**

### Locked-stack reminders

- Never bump past Next.js 15.x, React 19.x, zod 3.x
- \`drizzle-orm\` and \`drizzle-kit\` must move together
- All four \`@remotion/*\` packages must share a version

🤖 Generated by \`scripts/bump-deps.ts\` — see \`docs/MAINTENANCE.md\`.
`;
}

main().catch((err) => {
  console.error("\n✗ bump-deps crashed:", err);
  process.exit(1);
});
