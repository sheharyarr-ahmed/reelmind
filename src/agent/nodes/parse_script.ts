import type { DirectorState } from "../schemas";
import { sanitizeUserContent } from "../sanitize";

export async function parseScript(
  state: DirectorState,
): Promise<Partial<DirectorState>> {
  const cleaned = sanitizeUserContent(state.script);
  return { cleanedScript: cleaned };
}
