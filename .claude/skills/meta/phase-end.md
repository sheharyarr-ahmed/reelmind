---
name: phase-end
description: Activates on `/phase-end N`. Runs checkpoint, marks phase complete, proposes next phase.
tier: 1
---

# /phase-end

## Tier 1 — Always Loaded

**Activates when:** User runs `/phase-end N` after phase work is done

**Domain:** Phase completion

## Tier 2 — Core Instructions

1. Run `/phase-checkpoint` — if red, stop and report failures. Do not mark phase complete.
2. If green: Open `.claude/CLAUDE.md` and mark `[x] Phase N` in Build Phase Tracker
3. Update Decisions Log with today's date + any stack-affecting decisions made in this phase
4. Invoke `phase-orchestrator` to propose the next phase and primary agent
5. Wait for user confirmation before starting the next phase

## Tier 3 — When Checkpoint Fails

If tests or lint fail mid-phase:
- Do not mark phase complete
- Invoke `ci-doctor` to diagnose the failure
- Fix the failure
- Re-run `/phase-checkpoint`
- Only mark complete after cascade passes
