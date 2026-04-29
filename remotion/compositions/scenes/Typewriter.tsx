import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { type SceneProps, colorForEmphasis } from "./types";

export function Typewriter({ scene, brand, fonts }: SceneProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Reveal characters across the first 75% of the scene
  const revealEnd = Math.max(1, Math.floor(durationInFrames * 0.75));
  const progress = Math.min(1, frame / revealEnd);
  const charactersToShow = Math.floor(scene.text.length * progress);
  const visible = scene.text.slice(0, charactersToShow);

  const color = colorForEmphasis(brand, scene.emphasisColor);
  const showCaret = frame % 30 < 15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.primaryColor,
        justifyContent: "center",
        alignItems: "center",
        padding: "10%",
      }}
    >
      <p
        style={{
          fontFamily: fonts.bodyFamily,
          fontSize: 64,
          fontWeight: 500,
          color,
          textAlign: "center",
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {visible}
        <span style={{ opacity: showCaret ? 1 : 0 }}>|</span>
      </p>
    </AbsoluteFill>
  );
}
