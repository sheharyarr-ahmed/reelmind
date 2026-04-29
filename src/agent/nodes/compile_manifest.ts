import type { DirectorState } from "../schemas";
import { VideoManifest } from "../schemas";

export async function compileManifest(
  state: DirectorState,
): Promise<Partial<DirectorState>> {
  const manifest = VideoManifest.parse({
    scenes: state.scenes,
    totalDuration: state.totalDuration,
    brandTemplateId: state.brandTemplate.id,
  });

  return { manifest };
}
