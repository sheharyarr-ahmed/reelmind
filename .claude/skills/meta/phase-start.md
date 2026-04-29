---
name: phase-start
description: Activates on `/phase-start N`. Loads the phase N spec, assigns primary agent, lists skills to load.
tier: 1
---

# /phase-start

## Tier 1 — Always Loaded

**Activates when:** User runs `/phase-start N` (e.g., `/phase-start 0`, `/phase-start 3`)

**Domain:** Phase initialization

**Critical rule:** Every phase starts with spec reading, criteria restatement, agent assignment.

## Tier 2 — Core Instructions

1. Read Build Phase Tracker in `.claude/CLAUDE.md` to confirm phase N is next
2. Open `docs/MASTER_PLAN.md` to the Phase N section
3. Echo Deliverables and Acceptance Criteria verbatim
4. Name the primary agent per Phase-Agent matrix below
5. List skills to load for this phase
6. Wait for user confirmation before invoking the primary agent

## Tier 3 — Phase-Agent Matrix

| Phase | Primary Agent | Skills to Load |
|-------|---------------|----------------|
| 0 | supabase-engineer | supabase-rls, drizzle-patterns |
| 1 | supabase-engineer, shadcn-ui-builder | nextjs-patterns added |
| 2 | shadcn-ui-builder, supabase-engineer | tailwind-shadcn added |
| 3 | agent-architect | langgraph-state-machine, anthropic-tool-use, prompt-injection-defense |
| 4 | remotion-builder | google-fonts, aspect-ratio-handling |
| 5 | remotion-builder, supabase-engineer | child-process-render |
| 6 | shadcn-ui-builder, agent-architect | (no new skills) |
| 7 | documentation-generator | voice-check |
