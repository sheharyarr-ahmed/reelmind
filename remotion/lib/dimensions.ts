export const ASPECT_RATIOS = ["16x9", "9x16", "1x1"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const ASPECT_DIMENSIONS: Record<
  AspectRatio,
  { width: number; height: number }
> = {
  "16x9": { width: 1920, height: 1080 },
  "9x16": { width: 1080, height: 1920 },
  "1x1": { width: 1080, height: 1080 },
};

export const FPS = 30;

export function secondsToFrames(seconds: number): number {
  return Math.max(1, Math.round(seconds * FPS));
}
