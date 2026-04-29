import { Composition } from "remotion";
import { BrandedScript, type BrandedScriptProps } from "./compositions/BrandedScript";
import { ASPECT_DIMENSIONS, FPS, secondsToFrames } from "./lib/dimensions";
import type { AspectRatio } from "./lib/dimensions";

const DEFAULT_ASPECT: AspectRatio = "16x9";

const DEFAULT_BRAND: BrandedScriptProps["brand"] = {
  id: "00000000-0000-0000-0000-000000000000",
  primaryColor: "#0F172A",
  secondaryColor: "#64748B",
  accentColor: "#3B82F6",
  headingFont: "Inter",
  bodyFont: "Inter",
  logoUrl: null,
};

const DEFAULT_MANIFEST: BrandedScriptProps["manifest"] = {
  brandTemplateId: DEFAULT_BRAND.id,
  totalDuration: 12,
  scenes: [
    {
      index: 0,
      text: "ReelMind",
      durationSeconds: 3,
      animation: "fade-in-text",
      emphasisColor: "accent",
      startAt: 0,
    },
    {
      index: 1,
      text: "Script in. Video out.",
      durationSeconds: 3,
      animation: "slide-up-text",
      emphasisColor: "secondary",
      startAt: 3,
    },
    {
      index: 2,
      text: "No editor needed.",
      durationSeconds: 3,
      animation: "typewriter",
      emphasisColor: "primary",
      startAt: 6,
    },
    {
      index: 3,
      text: "Architect once. Render forever.",
      durationSeconds: 3,
      animation: "logo-reveal",
      emphasisColor: "accent",
      startAt: 9,
    },
  ],
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="BrandedScript"
        component={BrandedScript}
        durationInFrames={secondsToFrames(DEFAULT_MANIFEST.totalDuration)}
        fps={FPS}
        width={ASPECT_DIMENSIONS[DEFAULT_ASPECT].width}
        height={ASPECT_DIMENSIONS[DEFAULT_ASPECT].height}
        defaultProps={{
          manifest: DEFAULT_MANIFEST,
          brand: DEFAULT_BRAND,
        }}
        calculateMetadata={({ props }) => {
          // Phase 5 will pass aspectRatio via input props; for now default to 16x9.
          const dims = ASPECT_DIMENSIONS[DEFAULT_ASPECT];
          return {
            durationInFrames: secondsToFrames(props.manifest.totalDuration),
            width: dims.width,
            height: dims.height,
            fps: FPS,
          };
        }}
      />
    </>
  );
};
