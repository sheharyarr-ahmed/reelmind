import { describe, it, expect } from "vitest";
import { spawnRemotionRender, RenderFailedError } from "../spawn-remotion";

describe("spawnRemotionRender — error paths", () => {
  it("rejects with RenderFailedError when the child exits non-zero", async () => {
    // We call a deliberately-failing command by overriding the cwd to a
    // location where pnpm has no remotion config — this exits non-zero
    // and exercises the error wiring without burning render time.
    await expect(
      spawnRemotionRender({
        compositionId: "DefinitelyDoesNotExist_zzz",
        outputPath: "/tmp/should-never-be-written.mp4",
        props: {},
      }),
    ).rejects.toBeInstanceOf(RenderFailedError);
  }, 60_000);
});
