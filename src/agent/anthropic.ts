import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | undefined;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local before running the director outside tests.",
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const HAIKU_MODEL = "claude-haiku-4-5-20251001";
export const OPUS_MODEL = "claude-opus-4-7";

export type LlmCallStats = {
  inputTokens: number;
  outputTokens: number;
};

export function statsFromUsage(
  usage: Anthropic.Usage | undefined,
): LlmCallStats {
  return {
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
  };
}
