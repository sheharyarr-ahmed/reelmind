# Scaling Path — Track A → Track B (Remotion Lambda)

## Current State (MVP — Track A)

ReelMind renders locally via `child_process.spawn` invoking the Remotion CLI.
Implementation: `src/render/trigger-local.ts`. One server process renders three
aspect ratios sequentially. Wall-clock budget: ~45s for a 12s composition on
M-series Mac silicon (verified Phase 5 integration test).

**Capacity ceiling:** Vercel Hobby has a 1GB Storage quota; ~55 projects (3
MP4s each at ~700KB-1MB per 12s render) before hitting the quota. Beyond that,
Track B is required.

## Track B — Remotion Lambda

**When to build it:** the first paying client whose volume exceeds 50
projects/month, OR when Storage quota is genuinely close.

### Architecture

1. Deploy a Remotion Lambda site once: `npx remotion lambda sites create`
2. Replace `child_process.spawn` in `src/render/trigger-local.ts` with
   `renderMediaOnLambda()` from `@remotion/lambda`
3. Lambda renders to S3, returns S3 URL
4. Either: (a) keep S3 as the source of truth and serve signed S3 URLs, or
   (b) copy the MP4 from S3 to Supabase Storage to consolidate billing

### Cost estimate (April 2026)

- ~$0.0033 per 30-second 1080p render via Lambda (Remotion's published figure)
- Three aspects per project ≈ $0.01 per project
- 1000 projects/month ≈ $10/month in compute alone
- S3 storage: $0.023/GB/month — 1000 projects × 3MB ≈ 3GB ≈ $0.07/month

### Migration path (already stubbed)

`src/render/trigger-lambda.ts` is the placeholder. Same signature as
`triggerLocalRender`, so the call site (Phase 6 server action that submits a
project) only needs an env-flag swap to switch backends.

```ts
const trigger = process.env.RENDER_BACKEND === "lambda"
  ? triggerLambdaRender
  : triggerLocalRender;
```

### Required AWS resources

- One IAM role for Lambda execution
- One S3 bucket (or use existing)
- Region selection (us-east-1 recommended for lowest cold-start latency)

### Decision log entry

When Track B is built, add to `.claude/CLAUDE.md` Decisions Log:
`YYYY-MM-DD | Activated Remotion Lambda (Track B) | Volume X projects/month`

---

## Background Job Orchestration — fire-and-forget vs Inngest

Separate concern from Track A vs Track B. Track A/B is *where* the render
runs; this section is about *how* the orchestration loop survives between
the user submitting and the render finishing.

### Current (v1.0)

`app/(app)/projects/actions.ts` uses `void runPipeline(userId, projectId)`
after the server action returns. This is fire-and-forget. It works in
two specific contexts:

- `pnpm dev` locally — Node process stays alive between requests
- Long-lived Node servers (e.g., a self-hosted box, Render, Fly.io)

It does NOT work reliably on Vercel, where serverless functions are
killed when the response ships. Mid-render kills leave projects stuck
in `rendering` status forever.

### Status

**v1.0 is shipped on Vercel as a portfolio demo URL.** The deployment
target is "stranger reads README and watches the demo MP4," not "stranger
submits a script and gets three rendered videos." The submission flow
works locally; the deployed site uses pre-rendered demo MP4s in
`public/demos/` to make the artifact watchable.

This is an explicit, recorded decision — not an oversight.

| Date | Decision | Reason |
|---|---|---|
| 2026-04-30 | Keep fire-and-forget on Vercel for v1.0 | Portfolio demo URL, not a real-user product; Inngest deferred until first paying contract |

### When to build Inngest

Trigger conditions (any one is enough):

- First paying contract with real user-submitted scripts
- Decision to enable public sign-ups beyond Sheharyar's own account
- Move from "demo URL" to "marketing site" with live submission

### Migration sketch

1. `pnpm add inngest`
2. Create `src/inngest/client.ts` and `src/inngest/functions.ts`
3. Move the `runPipeline` body into an Inngest function event handler
4. Replace `void runPipeline(...)` in the server action with
   `inngest.send({ name: "project.submitted", data: { userId, projectId } })`
5. Wire `app/api/inngest/route.ts` to serve the Inngest webhook
6. Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in Vercel env

The schema, render pipeline, and UI polling already accommodate this
swap. No frontend changes required. Migration estimate: 2-3 hours.
