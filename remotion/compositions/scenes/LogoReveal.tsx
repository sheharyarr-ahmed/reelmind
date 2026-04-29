import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { type SceneProps, colorForEmphasis } from "./types";

export function LogoReveal({ scene, brand, fonts }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({ frame, fps, config: { damping: 15 } });
  const logoScale = interpolate(logoProgress, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  const textProgress = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 18 },
  });
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textTranslateY = interpolate(textProgress, [0, 1], [30, 0]);

  const color = colorForEmphasis(brand, scene.emphasisColor);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.primaryColor,
        justifyContent: "center",
        alignItems: "center",
        padding: "10%",
        gap: "40px",
        flexDirection: "column",
      }}
    >
      {brand.logoUrl ? (
        <Img
          src={brand.logoUrl}
          style={{
            width: 300,
            height: 300,
            objectFit: "contain",
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        />
      ) : (
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: "50%",
            backgroundColor: brand.accentColor,
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        />
      )}
      <p
        style={{
          fontFamily: fonts.headingFamily,
          fontSize: 72,
          fontWeight: 700,
          color,
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
          textAlign: "center",
          margin: 0,
        }}
      >
        {scene.text}
      </p>
    </AbsoluteFill>
  );
}
