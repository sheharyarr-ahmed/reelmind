---
name: voice-check
description: Activates on `/voice-check` or when documentation-generator produces copy.
tier: 1
---

# /voice-check

## Tier 1 — Always Loaded

**Activates when:** User runs `/voice-check TEXT` or `documentation-generator` produces documentation

**Domain:** Vocabulary enforcement

**Critical rule:** No AVOID-list words in any public copy.

## Tier 2 — The Lists

### AVOID (banned from all output)

passionate about, expert in, top-rated, unicorn, rockstar, ninja, quick, cheap, fast, revolutionary, transformative, innovative, cutting-edge, state-of-the-art

### USE (preferred alternatives)

architect, engineer, ship, deploy, autonomous, agentic, production-grade, measurable outcome, return, leverage, scale

## Procedure

1. Scan provided text for any AVOID-list word
2. For each hit: report line context and word
3. Propose a USE-list replacement
4. Do not approve publication until all AVOID hits are gone

## Example

**User submission:** "I'm passionate about building cutting-edge video systems fast."

**Voice check report:**
- ❌ "passionate about" → use "built to engineer"
- ❌ "cutting-edge" → use "production-grade"
- ❌ "fast" → use "measurable performance" (with actual numbers)

**Approved version:** "Built to engineer production-grade video systems with measurable performance (30s 1080p render time)."
