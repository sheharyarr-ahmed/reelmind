import type { DirectorState } from "../schemas";

const MIN_DURATION_S = 10;
const MAX_DURATION_S = 90;
const MIN_SCENES = 3;
const MAX_SCENES = 12;
const TIMING_TOLERANCE_S = 0.1;

export async function validate(
  state: DirectorState,
): Promise<Partial<DirectorState>> {
  const errors: string[] = [];

  if (state.totalDuration < MIN_DURATION_S) {
    errors.push(`Total duration ${state.totalDuration.toFixed(2)}s below ${MIN_DURATION_S}s minimum`);
  }
  if (state.totalDuration > MAX_DURATION_S) {
    errors.push(`Total duration ${state.totalDuration.toFixed(2)}s exceeds ${MAX_DURATION_S}s maximum`);
  }
  if (state.scenes.length < MIN_SCENES) {
    errors.push(`Only ${state.scenes.length} scenes (minimum ${MIN_SCENES})`);
  }
  if (state.scenes.length > MAX_SCENES) {
    errors.push(`${state.scenes.length} scenes (maximum ${MAX_SCENES})`);
  }

  for (let i = 0; i < state.scenes.length - 1; i++) {
    const current = state.scenes[i];
    const next = state.scenes[i + 1];
    if (!current || !next) continue;
    const expected = current.startAt + current.durationSeconds;
    if (Math.abs(next.startAt - expected) > TIMING_TOLERANCE_S) {
      errors.push(`Timing gap between scenes ${i} and ${i + 1}`);
    }
  }

  return {
    errors,
    retryCount:
      errors.length > 0 ? state.retryCount + 1 : state.retryCount,
  };
}
