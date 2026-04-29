import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { type SceneProps, colorForEmphasis } from "./types";

export function WordByWordPop({ scene, brand, fonts }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = scene.text.split(/\s+/).filter(Boolean);
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
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4em",
          justifyContent: "center",
          maxWidth: "80%",
        }}
      >
        {words.map((word, i) => {
          const delayFrames = i * 6;
          const localFrame = Math.max(0, frame - delayFrames);
          const popped = spring({
            frame: localFrame,
            fps,
            config: { damping: 12, stiffness: 200 },
          });
          const scale = interpolate(popped, [0, 1], [0.4, 1]);
          const opacity = interpolate(popped, [0, 1], [0, 1]);

          return (
            <span
              key={`${i}-${word}`}
              style={{
                fontFamily: fonts.headingFamily,
                fontSize: 88,
                fontWeight: 700,
                color,
                transform: `scale(${scale})`,
                opacity,
                display: "inline-block",
                lineHeight: 1.1,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
