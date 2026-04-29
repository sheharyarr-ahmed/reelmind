import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ReelMind — Architect once. Render forever.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0F172A",
          color: "#F8FAFC",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#3B82F6",
              letterSpacing: "0.05em",
            }}
          >
            REELMIND
          </span>
          <span
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: "900px",
            }}
          >
            Architect once. Render forever.
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            color: "#94A3B8",
          }}
        >
          <span>
            Agentic video production · 7-node LangGraph director · Remotion
            render
          </span>
          <span>by Shery Labs</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
