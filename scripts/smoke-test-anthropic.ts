#!/usr/bin/env tsx
import { config } from "dotenv";
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 32,
    messages: [{ role: "user", content: "Reply with the single word: pong" }],
  });
  const block = res.content[0];
  const text = block && block.type === "text" ? block.text : "(no text)";
  console.log(`OK — model=${res.model}`);
  console.log(`Response: ${text.trim()}`);
  console.log(
    `Tokens: in=${res.usage?.input_tokens ?? 0} out=${res.usage?.output_tokens ?? 0}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Smoke test failed:", err.message ?? err);
  process.exit(1);
});
