---
name: anti-pattern-check
description: Activates on `/anti-pattern-check` or when any agent/skill file is created/modified.
tier: 1
---

# /anti-pattern-check

## Tier 1 — Always Loaded

**Activates when:** User runs `/anti-pattern-check` OR any agent/skill file is created

**Domain:** Quality gate for agent and skill files

## Tier 2 — The 8-Item Checklist

Run through all 8 checks. Report PASS/FAIL for each. If any FAIL, list violations. Do not commit until all PASS.

| # | Anti-Pattern | Question | Fail Condition |
|---|--------------|----------|----------------|
| 1 | EMPTY_DESCRIPTION | Description ≥50 words with concrete triggers? | <50 words OR uses "helps with" without trigger |
| 2 | MISSING_TRIGGER | 3+ `<example>` blocks? | Fewer than 3 examples |
| 3 | OVER_CONSTRAINED | ≤12 combined Hard Rules + Refusals? | >12 combined OR contradictory rules |
| 4 | BLOATED_SKILL | Tier 1 ≤150 tokens, Tier 2 ≤600? | Exceeds ceilings |
| 5 | ORPHAN_REFERENCE | All referenced agents exist? | Cross-ref to nonexistent agent |
| 6 | DEAD_CROSS_REF | All file paths resolve? | `docs/...` or `.claude/...` path missing |
| 7 | NO_SUCCESS_METRIC | Metrics verifiable (not "good"/"correct")? | "high quality" without check |
| 8 | WEAK_ROUTING | Two agents could match same example? | Routing ambiguity exists |

## Tier 3 — Common Fixes

**EMPTY_DESCRIPTION:** Add concrete trigger conditions. Example: "Use when..." then state phases or file paths touched.

**MISSING_TRIGGER:** Add 1-2 more `<example>` blocks with different contexts.

**OVER_CONSTRAINED:** Consolidate weak rules. Drop a redundant refusal. Merge two similar hard rules into one.

**BLOATED_SKILL:** Move Tier 2 content to Tier 3. Tier 1 is only the summary.

**ORPHAN_REFERENCE:** Verify agent is in the 7-agent roster. Verify file path exists.

**DEAD_CROSS_REF:** Update the path or remove the reference.

**NO_SUCCESS_METRIC:** Add a measurable check: command returns zero, row count from query, file exists.

**WEAK_ROUTING:** Ensure examples use phase-specific or role-specific details. Avoid overlap.
