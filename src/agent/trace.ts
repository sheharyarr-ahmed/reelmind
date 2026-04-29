import { db } from "@/src/db";
import { agentTraces } from "@/src/db/schema";

export type TraceRow = {
  userId: string;
  projectId: string | null;
  nodeName: string;
  inputState: unknown;
  outputState: unknown;
  llmCall: boolean;
  tokensUsed: number | null;
  durationMs: number;
  error: string | null;
};

export async function writeTrace(row: TraceRow): Promise<void> {
  if (process.env.NODE_ENV === "test" || process.env.AGENT_TRACE_SKIP) {
    return;
  }

  try {
    await db.insert(agentTraces).values({
      userId: row.userId,
      projectId: row.projectId,
      nodeName: row.nodeName,
      inputState: row.inputState as object,
      outputState: row.outputState as object,
      llmCall: row.llmCall,
      tokensUsed: row.tokensUsed,
      durationMs: row.durationMs,
      error: row.error,
    });
  } catch (err) {
    // Never let observability failures break the director.
    console.error("Trace write failed:", err);
  }
}

export type TraceContext = {
  userId: string;
  projectId: string | null;
};

export async function withTrace<T>(
  ctx: TraceContext,
  nodeName: string,
  llmCall: boolean,
  inputState: unknown,
  fn: () => Promise<{ result: T; tokensUsed?: number }>,
): Promise<T> {
  const started = Date.now();
  try {
    const { result, tokensUsed } = await fn();
    await writeTrace({
      ...ctx,
      nodeName,
      inputState,
      outputState: result,
      llmCall,
      tokensUsed: tokensUsed ?? null,
      durationMs: Date.now() - started,
      error: null,
    });
    return result;
  } catch (err) {
    await writeTrace({
      ...ctx,
      nodeName,
      inputState,
      outputState: null,
      llmCall,
      tokensUsed: null,
      durationMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
