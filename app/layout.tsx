import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ReelMind",
  description: "Agentic video production system",
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
