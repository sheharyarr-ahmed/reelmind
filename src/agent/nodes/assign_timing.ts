import type { DirectorState, Scene } from "../schemas";

const WORDS_PER_MINUTE = 140;
const BUFFER_SECONDS = 0.5;

function durationForText(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const readingSeconds = (wordCount / WORDS_PER_MINUTE) * 60;
  return Math.max(2, readingSeconds + BUFFER_SECONDS);
}

export async function assignTiming(
  state: DirectorState,
): Promise<Partial<DirectorState>> {
  let cursor = 0;
  const scenes: Scene[] = state.scenes.map((s) => {
    const durationSeconds = durationForText(s.text);
    const scene: Scene = {
      ...s,
      durationSeconds,
      startAt: cursor,
    };
    cursor += durationSeconds;
    return scene;
  });

  return {
    scenes,
    totalDuration: cursor,
  };
}
