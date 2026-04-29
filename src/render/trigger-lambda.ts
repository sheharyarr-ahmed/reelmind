import type { TriggerLocalArgs, TriggerLocalResult } from "./trigger-local";

/**
 * Track B production path — Remotion Lambda. Stubbed.
 *
 * MVP uses Track A (local child_process via trigger-local.ts) per the locked
 * decision in .claude/CLAUDE.md. Lambda is the documented upgrade path for
 * scaling beyond ~55 projects (Storage quota on Supabase free tier).
 *
 * Implementation guide: docs/SCALING.md (to be written in Phase 7).
 *
 * When implementing:
 * 1. Deploy Remotion Lambda once via `npx remotion lambda sites create`
 * 2. Replace child_process.spawn with renderMediaOnLambda from @remotion/lambda
 * 3. Read S3 output, fall back to direct S3 signed URL or copy to Supabase
 * 4. Cost estimate: ~$0.0033 per 30s 1080p render
 */
export async function triggerLambdaRender(
  _args: TriggerLocalArgs,
): Promise<TriggerLocalResult> {
  throw new Error(
    "trigger-lambda is not implemented in MVP. See docs/SCALING.md for upgrade path.",
  );
}
