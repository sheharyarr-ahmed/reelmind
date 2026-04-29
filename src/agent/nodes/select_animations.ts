import type { DirectorState, Scene } from "../schemas";
import { ANIMATION_TYPES } from "../schemas";

// Body animations rotate through these three (excluding fade-in-text reserved
// for the opener and logo-reveal reserved for the closer).
const BODY_ROTATION = [
  "slide-up-text",
  "typewriter",
  "word-by-word-pop",
] as const satisfies readonly (typeof ANIMATION_TYPES)[number][];

export async function selectAnimations(
  state: DirectorState,
): Promise<Partial<DirectorState>> {
  const total = state.scenes.length;

  const scenes: Scene[] = state.scenes.map((s, i) => {
    if (i === 0) return { ...s, animation: "fade-in-text" };
    if (i === total - 1) return { ...s, animation: "logo-reveal" };

    const bodyIndex = (i - 1) % BODY_ROTATION.length;
    const animation = BODY_ROTATION[bodyIndex] ?? "slide-up-text";
    return { ...s, animation };
  });

  return { scenes };
}
