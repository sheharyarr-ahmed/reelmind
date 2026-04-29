---
name: session-end
description: Activates on `/session-end`. Captures session progress, commits safely, updates scratchpad.
tier: 1
---

# /session-end

## Tier 1 — Always Loaded

**Activates when:** User runs `/session-end` to wrap up a session

**Domain:** Session lifecycle

## Tier 2 — Core Instructions

1. Run `/phase-checkpoint` — if red, report failures and STOP. Do not commit. Ask user to fix before session ends.
2. If green: Run `git status` and stage only changed files (explicitly exclude `.local.*` files, `.env.local`)
3. Draft commit message in format: `feat(phaseN): description` or `fix(phaseN): description`
4. Wait for user to say "commit" before applying `git commit`
5. Update `.claude/CLAUDE.local.md` Active Session section with current phase, work completed, next steps
6. Report: "Session saved. Resume next session with `/phase-start N` or `/phase-end N`"

## Tier 3 — Edge Cases

**If session ends mid-phase with red tests:**
- Do not commit
- Report which test failed, which phase is incomplete
- Ask user to fix before next session or suggest rolling back to the last green commit

**If .env.local accidentally got staged:**
- Refuse the commit
- Alert the user: ".env.local is gitignored but appears staged. Verify git check-ignore works."
- Ask user to unstage it before retry
