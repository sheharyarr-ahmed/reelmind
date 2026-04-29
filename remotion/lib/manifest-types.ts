// Re-export the same Zod-derived types the agent uses, so the composition
// stays in sync with src/agent/schemas.ts without circular import risk.
export type {
  Scene,
  VideoManifest,
  BrandTemplateSnapshot,
} from "@/src/agent/schemas";
export { ANIMATION_TYPES, EMPHASIS_COLORS } from "@/src/agent/schemas";
