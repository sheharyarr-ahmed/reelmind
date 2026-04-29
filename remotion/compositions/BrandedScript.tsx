import { AbsoluteFill, Sequence } from "remotion";
import type { VideoManifest, BrandTemplateSnapshot, Scene } from "../lib/manifest-types";
import { secondsToFrames } from "../lib/dimensions";
import { loadBrandFonts } from "../lib/load-fonts";
import { FadeInText } from "./scenes/FadeInText";
import { SlideUpText } from "./scenes/SlideUpText";
import { Typewriter } from "./scenes/Typewriter";
import { WordByWordPop } from "./scenes/WordByWordPop";
import { LogoReveal } from "./scenes/LogoReveal";

export type BrandedScriptProps = {
  manifest: VideoManifest;
  brand: BrandTemplateSnapshot;
};

function renderScene(
  scene: Scene,
  brand: BrandTemplateSnapshot,
  fonts: { headingFamily: string; bodyFamily: string },
) {
  const props = { scene, brand, fonts };
  switch (scene.animation) {
    case "fade-in-text":
      return <FadeInText {...props} />;
    case "slide-up-text":
      return <SlideUpText {...props} />;
    case "typewriter":
      return <Typewriter {...props} />;
    case "word-by-word-pop":
      return <WordByWordPop {...props} />;
    case "logo-reveal":
      return <LogoReveal {...props} />;
  }
}

export function BrandedScript({ manifest, brand }: BrandedScriptProps) {
  const fonts = loadBrandFonts(brand.headingFont, brand.bodyFont);

  return (
    <AbsoluteFill style={{ backgroundColor: brand.primaryColor }}>
      {manifest.scenes.map((scene) => {
        const fromFrame = secondsToFrames(scene.startAt);
        const durationInFrames = secondsToFrames(scene.durationSeconds);
        return (
          <Sequence
            key={scene.index}
            from={fromFrame}
            durationInFrames={durationInFrames}
            name={`Scene ${scene.index + 1} — ${scene.animation}`}
          >
            {renderScene(scene, brand, fonts)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
