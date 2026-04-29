import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { type SceneProps, colorForEmphasis } from "./types";

export function SlideUpText({ scene, brand, fonts }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 20 } });
  const translateY = interpolate(progress, [0, 1], [80, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  const color = colorForEmphasis(brand, scene.emphasisColor);

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
          fontSize: 72,
          fontWeight: 600,
          color,
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {scene.text}
      </p>
    </AbsoluteFill>
  );
}
