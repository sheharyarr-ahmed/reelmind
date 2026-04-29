---
name: phase-checkpoint
description: Run the full quality gate before any commit. Activates on slash command `/phase-checkpoint` or when an agent declares phase work complete.
tier: 1
---

# /phase-checkpoint

## Tier 1 — Always Loaded

**Activates when:** User runs `/phase-checkpoint` OR an agent says "ready to commit"

**Domain:** Quality gates

**Critical rule:** No commit without a green checkpoint.

## Tier 2 — Core Instructions

Run the following in order. Stop and report on first failure:

1. `pnpm lint` — must return zero
2. `pnpm typecheck` — must return zero
3. `pnpm test` — must return zero
4. If all green: output "✅ Checkpoint passed. Ready to commit."
5. If any fail: output the failure with file:line, invoke `ci-doctor`, suggest fix

Do NOT commit automatically. The user must explicitly say "commit" before any git command runs.

If the failure is a test the user wants to skip — refuse. Invoke `ci-doctor` instead.

## Tier 3 — Resources

### Common failures

- TypeScript "property does not exist" → schema drift; check `src/db/schema.ts`
- ESLint unused-imports → orphan after refactor; safe to delete per Surgical Changes
- Vitest mock missing → `vi.mock()` must precede the import being mocked

### Recovery commands

- `pnpm install` if `node_modules` looks stale
- `pnpm drizzle-kit push` if schema drift suspected
- `rm -rf .next && pnpm dev` if Next.js cache corrupted
