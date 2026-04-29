import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

export const RENDER_TIMEOUT_MS = 5 * 60 * 1000;

export type SpawnRenderArgs = {
  compositionId: string;
  outputPath: string;
  props: unknown;
  cwd?: string;
};

export type SpawnRenderResult = {
  outputPath: string;
  durationMs: number;
  stderrTail: string;
};

export class RenderTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Render exceeded ${timeoutMs}ms wall-clock timeout`);
    this.name = "RenderTimeoutError";
  }
}

export class RenderFailedError extends Error {
  constructor(
    public readonly code: number | null,
    public readonly stderrTail: string,
  ) {
    super(`Remotion render failed (exit ${code}): ${stderrTail.slice(0, 500)}`);
    this.name = "RenderFailedError";
  }
}

/**
 * Spawn `pnpm remotion render` as a child process with a hard wall-clock
 * timeout enforced via SIGKILL. The remotion-builder agent's Hard Rule:
 * 5-minute SIGKILL on timeout — no exceptions, no parameterization.
 */
export async function spawnRemotionRender(
  args: SpawnRenderArgs,
): Promise<SpawnRenderResult> {
  const { compositionId, outputPath, props, cwd = process.cwd() } = args;

  const propsJson = JSON.stringify(props);
  const absoluteOut = path.resolve(cwd, outputPath);

  const cliArgs = [
    "remotion",
    "render",
    compositionId,
    absoluteOut,
    `--props=${propsJson}`,
    "--log=error",
  ];

  const started = Date.now();
  let timeoutHandle: NodeJS.Timeout | undefined;
  let timedOut = false;
  let stderrBuf = "";

  return await new Promise<SpawnRenderResult>((resolve, reject) => {
    const child: ChildProcess = spawn("pnpm", cliArgs, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderrBuf += chunk.toString();
      // Cap to last 4KB so we never balloon memory on a chatty failure
      if (stderrBuf.length > 4096) {
        stderrBuf = stderrBuf.slice(-4096);
      }
    });

    timeoutHandle = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, RENDER_TIMEOUT_MS);

    child.once("error", (err) => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      reject(err);
    });

    child.once("close", (code) => {
      if (timeoutHandle) clearTimeout(timeoutHandle);

      if (timedOut) {
        reject(new RenderTimeoutError(RENDER_TIMEOUT_MS));
        return;
      }
      if (code !== 0) {
        reject(new RenderFailedError(code, stderrBuf));
        return;
      }
      resolve({
        outputPath: absoluteOut,
        durationMs: Date.now() - started,
        stderrTail: stderrBuf.slice(-512),
      });
    });
  });
}
