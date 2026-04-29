# REELMIND — PATTERNS EXTRACTED FROM 6 REFERENCE REPOS

**Companion To:** `REELMIND_MASTER_PLAN.md` v1.0 + `REELMIND_PLAN_GAP_ANALYSIS.md` + `REELMIND_PLAN_v1.1.md`
**Author:** Senior Business Partner / Lead AI Architect (operating per SheryLabs Master Config)
**Date:** April 29, 2026
**Status:** Final synthesis. All 12 lock decisions confirmed. Feeds directly into Plan v1.2.

---

## 0. PURPOSE

This document is the bridge between Plan v1.1 (theoretical) and Plan v1.2 (production-ready). It distills the wisdom of six reference repositories — each contributing a different dimension of `.claude/` engineering — into:

1. A pattern-by-pattern adopt/adapt/reject decision grid
2. The canonical ReelMind agent template
3. The canonical ReelMind skill template (with progressive disclosure)
4. A merged anti-pattern checklist for pre-commit gating
5. The final `.claude/` folder structure for ReelMind

Plan v1.2 references this document as authoritative for any "why is the agent template structured this way" question.

---

## 1. THE SIX REPOS — ROLE IN OUR SYNTHESIS

| # | Repo | Primary Contribution | Secondary Contribution |
|---|------|---------------------|------------------------|
| 1 | `agency-agents` (msitarzewski) | Personality-driven specialist pattern | Identity & Memory section, Things I Refuse To Do |
| 2 | `claude-code-sub-agents` | Master orchestrator pattern | SDLC stage organization |
| 3 | `voltagent` | (Rejected as framework) | Validates our LangGraph + Anthropic + tool-use stack |
| 4 | `wshobson/agents` | Agent Skills with progressive disclosure | Per-agent model assignment, anti-pattern detection |
| 5 | `contains-studio/agents` | Canonical agent file template | Embedded examples in description, proactive vs invoked distinction |
| 6 | `andrej-karpathy-skills` | Four operating principles (meta-discipline) | Goal-driven execution philosophy |

Each repo gave us something the others didn't. The combined wisdom is sharper than any single source.

---

## 2. THE ADOPT / ADAPT / REJECT GRID

### 2.1 Patterns ADOPTED — direct integration

| Pattern | Source | Our Implementation |
|---------|--------|--------------------|
| YAML frontmatter (`name`, `description`, `tools`) | All repos | Mandatory on every agent and skill file |
| `color` field in frontmatter | R1, R4, R5 | Each agent gets a brand-aligned color |
| `model:` frontmatter per agent | R4 | Maps to Haiku/Sonnet/Opus per role for budget control |
| Embedded `<example>` blocks in description | R5 | 3-4 examples mandatory per agent |
| Identity & Role opening section | R1, R5 | First section of every agent body |
| Hard rules / constraints | All repos | Mandatory section in every agent |
| Things I Refuse To Do | R1, R5 | Mandatory section — anti-drift mechanism |
| Success Metrics | R1, R4, R5 | Mandatory section — defines done |
| 500+ word system prompts | R2, R4, R5 | Quality floor for all agents |
| Master orchestrator pattern | R2, R4 | Implemented as `phase-orchestrator` agent |
| Progressive disclosure for skills | R4 | Three-tier: metadata → instructions → resources |
| Anti-pattern checklist | R4, R5 | Merged into single pre-commit gate |
| Bundle organization | R1, R4, R5 | Light version: 3 logical bundles, not 25+ |
| Proactive vs invocation-only distinction | R4, R5 | Only `ci-doctor` is proactive; rest invocation-only |
| Karpathy four principles preamble | R6 | Top of `.claude/CLAUDE.md` — meta-discipline |
| Goal-driven phase acceptance criteria | R6 | Tighten weak criteria into verifiable form |

### 2.2 Patterns ADAPTED — modified for our scope

| Pattern | Source | Original Form | Our Adaptation |
|---------|--------|---------------|----------------|
| Department organization | R1 | 144 agents across 12 dept folders | 3 bundles for 7 agents |
| Master orchestrator scope | R2 | Auto-executes entire SDLC end-to-end | `phase-orchestrator` proposes only |
| Plugin marketplace | R4 | Public marketplace.json system | Local-only structure, no marketplace |
| Sprint context | R5 | Generic "6-day sprint" | Specific "26-hour weekend sprint" + "$5 budget" |
| Skills as separate concept | R4 | Three-tier knowledge with own evaluation | Replaces `rules/`; same three-tier structure |
| Customization checklist | R5 | 7 testing items | Merged with R4 anti-pattern list into 10-item gate |

### 2.3 Patterns REJECTED — explicit non-adoption

| Pattern | Source | Rejection Rationale |
|---------|--------|---------------------|
| 144-agent maximalism | R1 | Curation over quantity (Master Config §11.1) |
| Multi-tool conversion scripts | R1 | Public OSS concern, not ours |
| Auto-orchestration of full SDLC | R2 | Burns budget; undercuts "I architected this" claim |
| VoltAgent framework | R3 | Master Config §2.4 lists LangGraph; switching breaks brand |
| VoltOps managed observability | R3 | `agent_traces` Postgres table is sufficient |
| Plugin marketplace + manifest.json | R4 | Distribution overhead for zero distribution need |
| Full PluginEval framework | R4 | Statistical rigor for public certification we don't need |
| Conductor plugin | R4 | Our master plan IS our context-driven workflow |
| Agent Teams parallel orchestration | R4 | Parallel autonomous agents undercut budget + claim |
| Pensyve / external memory plugins | R4 | Out of scope for MVP |
| Bonus personality agents (joker, studio-coach) | R5 | No room for vibes in 26h sprint |
| Cursor `.mdc` rule output | R6 | We use Claude Code only |

### 2.4 Patterns CONFIRMED but already in our plan

| Pattern | Already In | Confirming Repos |
|---------|-----------|------------------|
| Two-layer config (`~/.claude/` + `.claude/`) | Plan v1.1 §1 | R1, R2, R4, R5 |
| Modular rule files | Plan v1.1 §3.7 | R4 (as skills) |
| Subagent specialization | Plan v1.1 §6.4 | All repos |
| Slash commands | Plan v1.1 §3.6 | R4 |
| MCP integration | Plan v1.1 §3.8 | R3, R4 |
| Anthropic + tool-use for structured output | Plan v1.1 §6.5 | R3 (validated) |
| Phase-by-phase commits | Plan v1.0 §14.2 | R6 (surgical changes principle) |

---

## 3. THE FINAL `.CLAUDE/` STRUCTURE

After integrating all locked decisions:

```
~/.claude/                                    # PERSONAL LAYER (cross-project)
├── CLAUDE.md                                 # Sheharyar's brand voice + anti-fabrication
├── settings.json                             # Global perms, default model
└── agents/
    └── (deferred — add as future projects need them)

reelmind/.claude/                             # PROJECT LAYER (committed)
├── CLAUDE.md                                 # Karpathy preamble + locked decisions + phase tracker
├── CLAUDE.local.md                           # Personal scratchpad (gitignored)
├── settings.json                             # Project perms + hooks
├── settings.local.json                       # Personal overrides (gitignored)
├── .mcp.json                                 # filesystem + GitHub MCP servers
│
├── agents/                                   # 7 specialists
│   ├── agent-system/
│   │   └── agent-architect.md
│   ├── delivery/
│   │   ├── remotion-builder.md
│   │   ├── supabase-engineer.md
│   │   └── shadcn-ui-builder.md
│   └── meta/
│       ├── phase-orchestrator.md
│       ├── documentation-generator.md
│       └── ci-doctor.md
│
├── skills/                                   # Progressive-disclosure knowledge
│   ├── code-quality/
│   │   └── typescript-strict-patterns.md
│   ├── agent-system/
│   │   ├── langgraph-state-machines.md
│   │   └── anthropic-tool-use.md
│   ├── delivery/
│   │   ├── drizzle-schema-patterns.md
│   │   ├── supabase-rls-policies.md
│   │   ├── remotion-google-fonts.md
│   │   └── shadcn-form-patterns.md
│   └── workflow/
│       ├── phase-checkpoint.md
│       ├── phase-start.md
│       ├── phase-end.md
│       ├── session-end.md
│       └── voice-check.md
│
└── docs/                                     # Plan reference (committed)
    ├── MASTER_PLAN.md
    ├── GAP_ANALYSIS.md
    ├── PLAN_v1.1.md                          # historical
    ├── PLAN_v1.2.md                          # active
    └── PATTERNS_EXTRACTED.md                 # this file
```

**Three bundles, seven agents, eleven skills, one orchestrator, one preamble.** Curation over quantity.

---

## 4. CANONICAL AGENT TEMPLATE

The mandatory structure for every agent in `reelmind/.claude/agents/`. Derived from R5's template, enriched with R1's identity language, R4's model assignment, R6's operating discipline, and R1+R5's refusals.

### 4.1 Required Frontmatter

Every agent file opens with YAML frontmatter containing:

- **name** — kebab-case identifier matching the filename
- **description** — multi-line block containing the trigger conditions plus 3-4 embedded `<example>` blocks. Each example has Context / user / assistant / commentary fields. This drives Claude Code's auto-routing.
- **color** — hex code for visual distinction in multi-agent sessions
- **model** — one of `claude-haiku-4-5-20251001`, `claude-sonnet-4-6`, or `claude-opus-4-7`
- **tools** — comma-separated list of tools the agent needs (Read, Edit, Write, Bash, Grep, Glob, etc.)

### 4.2 Required Body Sections (in order)

1. **Role** — H1 with agent display name
2. **Identity & Memory** — 1-2 sentence self-concept plus a personality quote in italics that anchors behavior
3. **Operating Discipline** — references the four Karpathy principles in `.claude/CLAUDE.md` and applies each to the agent's domain
4. **Required Reading Before Any Work** — numbered list of master plan sections and skill files this agent must consult
5. **Sprint Context** — anchors the agent to the 26-hour weekend sprint and $5 Claude API ceiling, with specific tradeoff guidance for the agent's work
6. **Core Responsibilities** — 5-8 specific duties, neither vague nor exhaustive
7. **Domain Expertise** — the specific knowledge the agent encodes; meets the 500+ word floor; covers technology versions, used patterns, rejected patterns, and common-mistake prevention
8. **Hard Rules** — 5-10 non-negotiable constraints
9. **Things I Refuse To Do** — 3-7 refusals with rationale (anti-drift mechanism)
10. **Integration With Other Agents** — explicit delegation/receipt points and overlap exclusions
11. **Success Metrics** — verifiable criteria (Karpathy: weak criteria require constant clarification)
12. **Trigger Mode** — Invocation-only or Proactive (with condition if proactive)

### 4.3 Word Count Discipline

| Section | Target Words |
|---------|--------------|
| Frontmatter examples (3 total) | 80-150 |
| Identity & Memory | 30-60 |
| Operating Discipline | 60-100 |
| Sprint Context | 30-60 |
| Core Responsibilities | 80-150 |
| Domain Expertise | 200-350 |
| Hard Rules | 80-150 |
| Things I Refuse To Do | 60-120 |
| Integration | 30-60 |
| Success Metrics | 40-80 |
| **Total target** | **~700-1200 words** |

500 words is the floor. 1200 is the ceiling. Below 500, the agent is too vague. Above 1200, the agent is bloated.

### 4.4 Color Assignments

| Agent | Color | Hex | Rationale |
|-------|-------|-----|-----------|
| `phase-orchestrator` | Mint (brand) | `#6EE7B7` | The face of SheryLabs — uses the brand accent |
| `agent-architect` | Indigo | `#6366F1` | Deep reasoning — the crown jewel |
| `remotion-builder` | Amber | `#F59E0B` | Visual/render domain |
| `supabase-engineer` | Emerald | `#10B981` | Data — Supabase brand alignment |
| `shadcn-ui-builder` | Slate | `#64748B` | UI scaffolding — neutral |
| `documentation-generator` | Sky | `#0EA5E9` | Writing/docs |
| `ci-doctor` | Red | `#EF4444` | Triggers on red builds |

---

## 5. CANONICAL SKILL TEMPLATE (PROGRESSIVE DISCLOSURE)

Skills replace what Plan v1.1 called "rules." Per R4, skills use a three-tier structure for token efficiency.

### 5.1 Required Frontmatter

- **name** — kebab-case
- **description** — single sentence stating what activates the skill (must be specific, not generic)
- **trigger_keywords** — array of keywords Claude Code matches against incoming work
- **load_priority** — `high`, `medium`, or `low`

### 5.2 Three-Tier Body Structure

**TIER 1 — METADATA (always loaded, under 100 words):** A single paragraph stating what the skill knows. This sits in context full-time. Should be enough for Claude Code to decide whether to load Tier 2.

**TIER 2 — INSTRUCTIONS (loaded when activated, 200-400 words):** Three subsections — "When to use this skill" with concrete scenarios; "Core patterns" with the actual knowledge content (code patterns, command sequences, decision rules); "Common mistakes this skill prevents" as a mistake-to-correction list.

**TIER 3 — RESOURCES (loaded on demand):** Reference templates with full working code, plus links to official docs and relevant master plan sections.

### 5.3 Why Progressive Disclosure Matters For Our Budget

With our $3-5 Claude API ceiling:

- 11 skill files at ~1200 words each = ~17,000 tokens loaded if all-eager
- Same 11 skills with metadata-only at ~80 words each = ~1,150 tokens loaded baseline

That's roughly **93% token reduction** at baseline. The headroom goes into actual work — agent runs, code generation, test cycles. Plan v1.1's flat rule files would have burned context budget without this discipline.

---

## 6. THE MERGED ANTI-PATTERN CHECKLIST

Combined from R4's PluginEval anti-patterns and R5's customization checklist. Run before committing any agent or skill file.

### 6.1 Structural Anti-Patterns (block the commit)

- **EMPTY_DESCRIPTION** — frontmatter description is generic ("a helpful agent for X") instead of specific trigger conditions
- **MISSING_TRIGGER** — no clear activation conditions stated
- **MISSING_EXAMPLES** — fewer than 3 `<example>` blocks in the description
- **OVER_CONSTRAINED** — more than 12 hard rules; agent becomes paralyzed
- **UNDER_SPECIFIED** — system prompt below 500 words
- **BLOATED** — system prompt above 1200 words
- **ORPHAN_REFERENCE** — references to non-existent agents, skills, or doc paths
- **DEAD_CROSS_REF** — references that pointed at content now removed/renamed
- **MISSING_REFUSALS** — no "Things I Refuse To Do" section
- **MISSING_METRICS** — no verifiable Success Metrics

### 6.2 Quality Checklist (review, don't block)

- **Trigger Testing** — Would Claude Code reliably auto-invoke this agent given the example contexts?
- **Tool Access** — Are all listed tools actually needed?
- **Output Quality** — Is the system prompt distinctive enough to produce non-generic output?
- **Edge Cases** — Are at least 2 of the 3-4 examples non-obvious cases?
- **Integration** — Are integration points with other agents named explicitly?
- **Performance** — Does the assigned model match the agent's actual reasoning load?
- **Documentation** — Does the agent reference master plan sections by number?

### 6.3 Pre-Commit Discipline

Every Claude Code session that creates or edits a file in `.claude/agents/` or `.claude/skills/` ends with running the `/anti-pattern-check` slash command (defined as a skill in v1.2). It walks the checklist and either approves the diff or lists violations.

---

## 7. AGENT-BY-AGENT MODEL ASSIGNMENT

### 7.1 Claude Code Sub-Agents (the meta layer)

| Agent | Assigned Model | Rationale |
|-------|----------------|-----------|
| `phase-orchestrator` | Sonnet 4.6 | Coordination, light reasoning, must understand plan structure |
| `agent-architect` | Opus 4.7 | LangGraph design + Anthropic API integration is hard reasoning |
| `remotion-builder` | Sonnet 4.6 | Pattern-following work; Remotion is well-documented |
| `supabase-engineer` | Sonnet 4.6 | Schema + RLS pattern-following |
| `shadcn-ui-builder` | Haiku 4.5 | UI scaffolding is highly templated |
| `documentation-generator` | Sonnet 4.6 | Quality writing, not pure reasoning |
| `ci-doctor` | Haiku 4.5 | Deterministic error diagnosis |

### 7.2 Runtime LLM (inside the LangGraph director — different layer)

| Director Node | Model | Approx Cost |
|---------------|-------|-------------|
| `parse_script` | (no LLM) | $0 |
| `plan_scenes` | Haiku 4.5 | ~$0.001 |
| `assign_timing` | (no LLM) | $0 |
| `select_animations` | Haiku 4.5 | ~$0.0005 |
| `validate` | (no LLM) | $0 |
| `critique` | Opus 4.7 | ~$0.015 |
| `compile_manifest` | (no LLM) | $0 |
| **Per generation** | | **~$0.017** |

100 demo generations during Phase 3 development ≈ $1.70. Well inside the $5 ceiling.

---

## 8. THE 12 CONFIRMED LOCK DECISIONS — STATUS

| # | Decision | Status |
|---|----------|--------|
| 1 | 7-agent set | Locked |
| 2 | Orchestrator-as-sequencer (no auto-execute) | Locked |
| 3 | `/session-end` as a skill | Locked |
| 4 | Keep LangGraph.js | Locked |
| 5 | Rename `rules/` → `skills/` with progressive disclosure | Locked |
| 6 | `model:` frontmatter per agent | Locked |
| 7 | Bundle organization (3 logical folders) | Locked |
| 8 | Anti-pattern checklist as pre-commit gate | Locked |
| 9 | Embedded examples (3-4 per agent) | Locked |
| 10 | 500+ word system prompts | Locked |
| 11 | Only `ci-doctor` is proactive | Locked |
| 12 | Karpathy four-principles preamble | Locked |

---

## 9. THE PORTFOLIO LOGIC

Every pattern locked in this document serves a portfolio purpose beyond just "good engineering":

| Pattern | Portfolio Signal |
|---------|------------------|
| Karpathy preamble in CLAUDE.md | "I read Karpathy. I apply his observations to my workflow." |
| Anti-pattern checklist | "I have a quality gate for `.claude/` files, not just app code." |
| Embedded examples in agents | "My subagents auto-route correctly; I don't constantly invoke by name." |
| Per-agent model assignment | "I think about Claude API spend at the architectural level." |
| Progressive disclosure skills | "I optimize context budget the same way I optimize bundle size." |
| Refusals in every agent | "My agents have anti-drift mechanisms; I don't trust LLMs blindly." |
| Goal-driven success metrics | "Every checkbox in my plan is verifiable. No 'make it work' anywhere." |
| 500+ word system prompts | "My agents are specialists. Generic agents fail." |
| Only one proactive agent | "I human-gate everything that touches code." |

A prospect inspecting `reelmind/.claude/` sees a portfolio piece in itself — separate from the app code, demonstrating senior `.claude/` engineering.

---

**END OF PATTERNS EXTRACTED — v1.0**
**Status: Final. Plan v1.2 production starts now.**
