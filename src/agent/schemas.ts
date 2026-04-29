import { z } from "zod";

export const ANIMATION_TYPES = [
  "fade-in-text",
  "slide-up-text",
  "typewriter",
  "word-by-word-pop",
  "logo-reveal",
] as const;

export const EMPHASIS_COLORS = ["primary", "secondary", "accent"] as const;

export const Scene = z.object({
  index: z.number().int().nonnegative(),
  text: z.string().min(1).max(200),
  durationSeconds: z.number().positive(),
  animation: z.enum(ANIMATION_TYPES),
  emphasisColor: z.enum(EMPHASIS_COLORS),
  startAt: z.number().nonnegative(),
});
export type Scene = z.infer<typeof Scene>;

export const VideoManifest = z.object({
  scenes: z.array(Scene),
  totalDuration: z.number().positive(),
  brandTemplateId: z.string().uuid(),
});
export type VideoManifest = z.infer<typeof VideoManifest>;

export const BrandTemplateSnapshot = z.object({
  id: z.string().uuid(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  headingFont: z.string(),
  bodyFont: z.string(),
  logoUrl: z.string().nullable(),
});
export type BrandTemplateSnapshot = z.infer<typeof BrandTemplateSnapshot>;

export const DirectorState = z.object({
  script: z.string(),
  brandTemplate: BrandTemplateSnapshot,
  userId: z.string().uuid(),
  projectId: z.string().uuid().nullable().default(null),
  cleanedScript: z.string().default(""),
  scenes: z.array(Scene).default([]),
  totalDuration: z.number().default(0),
  retryCount: z.number().int().nonnegative().default(0),
  errors: z.array(z.string()).default([]),
  critiqueNotes: z.string().nullable().default(null),
  manifest: VideoManifest.nullable().default(null),
});
export type DirectorState = z.infer<typeof DirectorState>;

export const ScenesPlan = z.object({
  scenes: z
    .array(
      z.object({
        text: z.string().min(1).max(200),
        emphasis: z.enum(EMPHASIS_COLORS),
      }),
    )
    .min(3)
    .max(12),
});
export type ScenesPlan = z.infer<typeof ScenesPlan>;

export const CritiqueResult = z.object({
  qualityScore: z.number().min(0).max(10),
  notes: z.string().min(1).max(500),
});
export type CritiqueResult = z.infer<typeof CritiqueResult>;
