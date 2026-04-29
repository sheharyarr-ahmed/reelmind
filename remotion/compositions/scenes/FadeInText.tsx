import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { type SceneProps, colorForEmphasis } from "./types";

export function FadeInText({ scene, brand, fonts }: SceneProps) {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

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
      <h1
        style={{
          fontFamily: fonts.headingFamily,
          fontSize: 96,
          fontWeight: 700,
          color,
          opacity,
          textAlign: "center",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {scene.text}
      </h1>
    </AbsoluteFill>
  );
}
