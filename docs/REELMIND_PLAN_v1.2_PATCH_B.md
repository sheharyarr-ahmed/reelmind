# REELMIND — PLAN v1.2 PATCH (ADDENDUM B)

**Patches:** `REELMIND_PLAN_v1.2.md` v1.2
**Builds On:** `REELMIND_PLAN_v1.2_PATCH.md`
**Status:** Apply alongside primary patch
**Reason:** Define how Claude Code requests secrets, keys, URLs, and tokens during the build

---

## WHY THIS PATCH EXISTS

During the build, Claude Code will need real values for:

- Supabase Project URL, anon key, service-role key, database URL
- Anthropic API key
- GitHub Personal Access Token
- Inngest event key + signing key (Phase 5)
- Sentry DSN (Phase 7)
- PostHog project key (Phase 7)
- Upstash Redis URL + token (Phase 6)
- Vercel project token (Phase 7)

Without explicit guidance, Claude Code might:

1. **Fabricate placeholder values** — putting `"YOUR_SUPABASE_URL_HERE"` literally into `.env.local` and proceeding as if it works
2. **Stall awkwardly** — stopping mid-task without a clear ask
3. **Skip env var setup entirely** — assuming the user will figure it out later

This patch defines a clear protocol: **Claude Code must ASK for secrets explicitly, in chat, with context, and wait for the user to provide them.**

---

## THE SECRETS HANDLING PROTOCOL

### Rule 1 — Never Fabricate

Claude Code MUST NOT:
- Insert placeholder values like `"YOUR_KEY_HERE"`, `"REPLACE_ME"`, `"sk-xxxxx"` into any committed file
- Use example values from documentation as if they were real
- Generate fake-looking values to "test" file structure
- Proceed past a step that requires a real secret without obtaining one

### Rule 2 — Ask Explicitly In Chat

When Claude Code reaches a step that requires a secret, it MUST stop and request it in chat using this exact format:

```
🔑 SECRET REQUIRED — [step name]

I need the following to continue:

  • [Variable name 1] — [what it is, where to find it]
  • [Variable name 2] — [what it is, where to find it]

Please paste them in your next message in this format:

  KEY_NAME_1=value_here
  KEY_NAME_2=value_here

I will write them to .env.local (which is gitignored) and continue.
```

### Rule 3 — Confirm Before Writing

After the user pastes secrets, Claude Code MUST:

1. Echo back which keys it received (without revealing the values — show just the name and first 4 chars: `SUPABASE_URL=https...`)
2. Confirm the destination file (always `.env.local`, NEVER `.env` or anything committed)
3. Wait for user to say "yes" or "go" before writing
4. After writing, verify the file exists and is gitignored

### Rule 4 — Centralize Asks When Possible

If multiple secrets are needed for the same phase, Claude Code MUST batch them into ONE request rather than asking one-by-one. Example: when setting up Phase 0, ask for all 4 Supabase values + ANTHROPIC_API_KEY in a single chat message.

### Rule 5 — Verify Before Proceeding

After secrets are written to `.env.local`, Claude Code MUST run a smoke test before declaring the step complete:

- For Supabase: a `select 1` query
- For Anthropic API: a tiny test call (1 token, ~$0.0001)
- For GitHub PAT: a `git ls-remote origin` check
- For Inngest: a webhook signature validation test

If the smoke test fails, Claude Code MUST report the failure with the specific error and ask the user to re-check the secret value, NOT silently retry or proceed.

### Rule 6 — Never Echo Full Secrets

In chat output, Claude Code MUST NEVER print the full value of any secret, even when confirming receipt. Show:

- ✅ `SUPABASE_URL=https... (received, 60 chars)`
- ❌ `SUPABASE_URL=https://xqzpwtxtrcqs.supabase.co (received)`

This prevents secret leakage if the chat is shared, screenshotted, or accidentally exported.

### Rule 7 — Never Commit Secrets

`.env.local` is gitignored by Phase 0a's `.gitignore` configuration. Claude Code MUST also:

- Refuse to write secrets to `.env` (without `.local`)
- Refuse to write secrets to `.env.example` (which IS committed)
- Refuse to write secrets to any file inside `.claude/`, `docs/`, or `src/`
- Run `git status` after writing `.env.local` and verify it does NOT appear in the changes list

If `.env.local` shows up in `git status`, Claude Code MUST stop, alert the user, and not proceed.

---

## EXAMPLE INTERACTION (PHASE 0)

**Claude Code** (during Phase 0 setup):

```
Phase 0 needs Supabase credentials and the Anthropic API key to continue.

🔑 SECRET REQUIRED — Phase 0 environment setup

I need the following to continue:

  • SUPABASE_URL — your Supabase Project URL (Settings → API → Project URL)
  • SUPABASE_ANON_KEY — your Supabase anon/public key (Settings → API)
  • SUPABASE_SERVICE_ROLE_KEY — your Supabase service role key (Settings → API, KEEP SECRET)
  • SUPABASE_DB_URL — your Supabase database URL (Settings → Database → Connection string → URI)
  • ANTHROPIC_API_KEY — your Anthropic API key (already in your shell, but I need it in .env.local for the app)

Please paste them in your next message in this format:

  SUPABASE_URL=https://...
  SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  SUPABASE_DB_URL=postgresql://...
  ANTHROPIC_API_KEY=sk-ant-...

I will write them to .env.local (which is gitignored) and run a smoke test.
```

**User pastes the values.**

**Claude Code:**

```
Received:
  ✅ SUPABASE_URL=https... (60 chars)
  ✅ SUPABASE_ANON_KEY=eyJh... (220 chars)
  ✅ SUPABASE_SERVICE_ROLE_KEY=eyJh... (220 chars)
  ✅ SUPABASE_DB_URL=postg... (95 chars)
  ✅ ANTHROPIC_API_KEY=sk-an... (108 chars)

I will write these to /reelmind/.env.local. Confirm with "go".
```

**User:** `go`

**Claude Code:**

```
✅ Wrote .env.local
✅ Verified .env.local is gitignored (not in git status)
✅ Running smoke test: connecting to Supabase...
✅ select 1 returned successfully
✅ Phase 0 environment ready

Continuing with Phase 0 schema setup.
```

---

## SECRETS TIMELINE — WHEN EACH IS NEEDED

This table tells Claude Code when to ask for what:

| Phase | Secrets Needed | When To Ask |
|-------|----------------|-------------|
| 0 | SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL, ANTHROPIC_API_KEY | Beginning of Phase 0, before scaffolding `.env.local` |
| 1 | (none new) | — |
| 2 | (none new) | — |
| 3 | (none new — uses ANTHROPIC_API_KEY) | — |
| 4 | (none new) | — |
| 5 | INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY | Beginning of Phase 5 |
| 6 | UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, NEXT_PUBLIC_POSTHOG_KEY (optional) | Beginning of Phase 6 |
| 7 | SENTRY_DSN, VERCEL_TOKEN, GITHUB_TOKEN (already in shell, may need re-export) | Beginning of Phase 7 |

If a secret is needed earlier than its phase indicates, Claude Code MUST stop and ask. Don't proceed with placeholders.

---

## WHAT GOES INTO `.env.example` (COMMITTED)

A `.env.example` file IS committed to the repo to document required env vars. It contains:

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=

# Anthropic
ANTHROPIC_API_KEY=

# Inngest (Phase 5+)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Upstash (Phase 6+)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# PostHog (Phase 6+, optional)
NEXT_PUBLIC_POSTHOG_KEY=

# Sentry (Phase 7+)
SENTRY_DSN=

# GitHub (already in shell)
# GITHUB_TOKEN — exported in ~/.zshrc, not in .env
```

`.env.example` has the variable NAMES but EMPTY VALUES. Anyone cloning the repo knows what to provide. The real values live only in `.env.local`.

---

## ADDITION TO `.claude/CLAUDE.md`

Add this section to the Project Preamble (Phase 0a deliverable) under "Conventions":

```markdown
## Secrets Handling
- Real values (API keys, URLs, tokens) live ONLY in `.env.local` (gitignored)
- `.env.example` is committed with empty values to document required vars
- Claude Code asks the user explicitly when secrets are needed (see PLAN_v1.2_PATCH.md addendum B)
- Claude Code never fabricates placeholder values like "YOUR_KEY_HERE"
- Claude Code runs a smoke test after secrets are written (e.g., `select 1` for Supabase)
- After writing secrets, Claude Code verifies via `git status` that `.env.local` is NOT staged
```

---

## ADDITION TO EVERY AGENT'S "HARD RULES" SECTION

The following hard rule is added to all 7 agents' Hard Rules sections during Phase 0a:

```
- I NEVER write fabricated or placeholder secrets (like "YOUR_KEY_HERE") to any file. When secrets are needed, I stop, ask the user explicitly via chat, wait for the values, and verify them before proceeding.
```

This is non-negotiable across all agents.

---

## ADDITION TO `ci-doctor`'s "THINGS I REFUSE TO DO" SECTION

```
- Continue past a missing-secret error by inserting a placeholder value
- Suggest hardcoding a secret into source code "temporarily"
- Skip a smoke test failure by retrying without alerting the user
```

---

## ADDITION TO `supabase-engineer`'s "DEFAULT WORKFLOW" SECTION

Insert as the new step 0:

```
0. If `.env.local` does not contain SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL — STOP and request them from the user using the secrets handling protocol from PLAN_v1.2_PATCH.md addendum B. Do not proceed with schema work until these are present and verified by a `select 1` smoke test.
```

---

## HOW TO APPLY

When Claude Code reads the kickoff prompt during Phase 0a, it will read this addendum and:

1. Add the "Secrets Handling" section to `.claude/CLAUDE.md`
2. Add the secrets-related Hard Rule to all 7 agent files
3. Add the additional Refusals to `ci-doctor`
4. Insert the secrets-check step into `supabase-engineer`'s workflow
5. Create `.env.example` with empty placeholders during Phase 0

No further action needed from you. The protocol becomes part of the project preamble and propagates to every agent.

---

**END OF ADDENDUM B**

Save as `docs/PLAN_v1.2_PATCH_B.md` in your reelmind project.
