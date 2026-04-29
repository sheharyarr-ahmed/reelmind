import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelMind — Architect once. Render forever.",
  description:
    "Agentic video production system. 7-node LangGraph director plans scenes, Remotion renders three aspect ratios. Script in. Video out.",
  openGraph: {
    title: "ReelMind — Architect once. Render forever.",
    description:
      "Agentic video production system. 7-node LangGraph director plans scenes, Remotion renders three aspect ratios.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReelMind — Architect once. Render forever.",
    description:
      "Agentic video production system. 7-node LangGraph director plans scenes, Remotion renders three aspect ratios.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
