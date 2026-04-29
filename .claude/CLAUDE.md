# ReelMind — Project Preamble

## What This Is

ReelMind is an agentic video production system. Script in. Branded multi-format video out. No human editor.

## Operating Principles (Karpathy)

### 1. Think Before Coding

Don't assume. Surface tradeoffs. Ask when uncertain.

**ReelMind:** If a phase's Acceptance Criteria are ambiguous, stop and ask. Do not silently pick a strategy that Phase 6 cannot consume.

### 2. Simplicity First

Minimum code that satisfies Acceptance Criteria.

**ReelMind:** Phase 3's retry is `retryCount < 2`. Hardcoded. No generic retry framework.

### 3. Surgical Changes

Touch only what the current phase requires.

**ReelMind:** When Phase 3 is in progress, do not touch `src/db/schema.ts` even if you spot an improvement.

### 4. Goal-Driven Execution

Verifiable success criteria. Loop until met.

**ReelMind:** Run `/phase-checkpoint` before declaring any phase complete.

## Authoritative References

1. `docs/MASTER_PLAN.md` — full v1.0 build spec
2. `docs/GAP_ANALYSIS.md` — v1.0 audit and accepted fixes
3. `docs/PLAN_v1.2.md` — current operational plan (THIS PROJECT)
4. `docs/PATTERNS_EXTRACTED.md` — rationale for v1.2

## Locked Stack (DO NOT PROPOSE ALTERNATIVES)

- Next.js 15 App Router + React 19 + TypeScript strict
- Tailwind v4 + shadcn/ui
- Drizzle ORM (NOT Prisma)
- Supabase free tier
- LangGraph.js (NOT Python LangChain, NOT VoltAgent)
- Anthropic Claude Haiku 4.5 default; Opus 4.7 for Critic node only
- Remotion 4 + local CLI render via child_process (NOT Lambda in MVP)
- Inngest for background jobs
- Vercel Hobby
- pnpm
- Zod for ALL validation
- Vitest + Playwright

## Locked Out of Scope (DO NOT BUILD)

ElevenLabs voiceover, music, B-roll, subtitles, team workspaces, mobile apps, custom font upload, payment/billing, React Native/Flutter, Remotion Lambda (MVP), AWS account.

## Build Phase Tracker

- [x] Phase 0a — Claude Code Scaffold
- [x] Phase 0  — Foundation
- [x] Phase 1  — Auth Shell
- [x] Phase 2  — Brand Templates
- [x] Phase 3  — AI Director Agent
- [x] Phase 4  — Remotion Composition
- [x] Phase 5  — Render Pipeline + Multi-Aspect
- [x] Phase 6  — Project UI + Agent Trace Viewer
- [x] Phase 7  — Polish, Tests, Deploy

## Decisions Log

| Date       | Decision                              | Reason                          |
|------------|---------------------------------------|---------------------------------|
| 2026-04-29 | OpenAI → Anthropic Claude             | $0 budget; Master Config        |
| 2026-04-29 | Drop Lambda from MVP                  | No AWS account; Track A only    |
| 2026-04-29 | 7 agents, 3 bundles, skills > rules   | Pattern synthesis from 6 repos  |
| 2026-04-29 | Supabase Session pooler URL (5432)    | Direct `db.*` is IPv6-only      |
| 2026-04-29 | drizzle-orm 0.36 + drizzle-kit 0.28   | 0.31 + 0.20 had isPgSequence mismatch |
| 2026-04-29 | DB password as separate env var       | Special chars in URL caused pg parser auth fails |
| 2026-04-29 | Removed tsconfig baseUrl              | Caused `import "remotion"` to resolve our local dir |
| 2026-04-29 | Source Serif Pro → Source Serif 4     | Google rebranded; matches @remotion/google-fonts module |
| 2026-04-29 | Lazy Drizzle db client via Proxy      | tsx scripts load .env after import; eager Pool ignored env |
| 2026-04-29 | Buckets via admin client, not SQL     | Idempotent setup script avoids dashboard SQL editor step |
| 2026-04-30 | Fire-and-forget pipeline in dev       | Vercel kills functions post-response; SCALING.md notes Inngest swap |

## Active TODO (Top 3 Only)

1. v1.0 shipped — see docs/DEPLOY_CHECKLIST.md to push to Vercel
2. _(empty)_
3. _(empty)_

## Conventions

### Commit Format

`feat(phaseN): <description>` for features
`fix(phaseN): <description>` for bug fixes
`chore(phaseN): <description>` for infrastructure

### Phase Checkpoints

- Never commit without running `/phase-checkpoint`
- Phase complete = all acceptance criteria met + `/phase-checkpoint` green

### Code Quality Gates

- Run `/anti-pattern-check` on any new agent or skill file
- All agents must have ≥3 examples, ≥500 words, all 9 sections
- Only `ci-doctor` is proactive; all others invocation-only

### Secrets Handling

- Real values (API keys, URLs, tokens) live ONLY in `.env.local` (gitignored)
- `.env.example` is committed with empty values to document required vars
- Claude Code asks the user explicitly when secrets are needed (see PLAN_v1.2_PATCH_B.md addendum B)
- Claude Code never fabricates placeholder values like "YOUR_KEY_HERE"
- Claude Code runs a smoke test after secrets are written (e.g., `select 1` for Supabase)
- After writing secrets, Claude Code verifies via `git status` that `.env.local` is NOT staged
- No agent ever writes a secret to any committed file

## Agent Roster (7 Total)

| Bundle      | Agent                    | Model      | Trigger     |
|-------------|--------------------------|------------|-------------|
| meta        | phase-orchestrator       | Sonnet 4.6 | invocation  |
| meta        | ci-doctor                | Haiku 4.5  | proactive   |
| build       | agent-architect          | Opus 4.7   | invocation  |
| build       | supabase-engineer        | Sonnet 4.6 | invocation  |
| build       | remotion-builder         | Sonnet 4.6 | invocation  |
| build       | shadcn-ui-builder        | Haiku 4.5  | invocation  |
| docs-deploy | documentation-generator  | Sonnet 4.6 | invocation  |
