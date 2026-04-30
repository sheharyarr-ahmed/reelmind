# Maintenance

Periodic tasks that keep ReelMind healthy. None are urgent — all are low-risk
"hygiene" work. Run when reminded.

---

## Dependency bumps

**Cadence:** every 2 weeks (calendar reminder recommended).

**How:**

```bash
pnpm bump-deps
```

What it does:

1. Verifies the working tree is clean
2. Pulls latest `main`
3. Runs `pnpm update` — bumps every dependency to the latest version that
   matches the range in `package.json` (e.g. `^15.0.0` allows `15.7.x` but
   never `16.x`)
4. Refreshes the browserslist DB (`npx update-browserslist-db@latest`)
5. Runs the full cascade: `pnpm typecheck` → `vitest run` → `pnpm lint`
6. Aborts and reverts if any step fails
7. Creates a branch `deps/bump-YYYY-MM-DD`
8. Opens a PR via `gh` with a body listing every bumped package and every
   major-version candidate that was skipped for human review
9. Switches back to `main` and prints the next recommended run date

**Hard rules baked into the script:**

- Never crosses a major version (Next.js 15 stays on 15, etc.)
- Locked-stack majors are documented in `.claude/CLAUDE.md`
- Cascade must pass before the PR opens
- The PR is **never auto-merged** — you review and merge manually

**Failure modes:**

- Working tree dirty → script aborts with a message; commit or stash first
- Typecheck/test fails after bump → script auto-reverts and aborts
- No in-range bumps available → script exits with "nothing to do"

---

## Calendar reminder

Add a recurring 2-week reminder to your calendar:

> **`pnpm bump-deps` in `/Users/sherysmac/Documents/projects/taskflow-project`**
>
> Reviews and merges the dependency PR after CI passes.

The script prints the next recommended run date at the end of every successful
run, so you can stay on cadence without external scheduling.

---

## Other periodic checks (manual, low priority)

These don't have scripts yet — bake them in when they get repetitive enough.

| Task | Cadence | Command |
|---|---|---|
| Verify Vercel production still serves | weekly | `curl -I https://reelmind-eosin.vercel.app/` |
| Smoke-test agent flow | monthly | sign in, submit a project, confirm trace renders |
| Review `agent_traces` token usage | monthly | Supabase SQL editor — sum `tokens_used` for the month |
| Rotate Anthropic API key | every 6 months | Anthropic console → new key → swap in Vercel env + `.env.local` |
| Rotate Supabase service-role key | every 6 months | Supabase dashboard → API → reset → swap in Vercel env + `.env.local` |
