import Anthropic from "@anthropic-ai/sdk";
import { parseJsonResponse } from "./parse-ai-response";

export async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }
  return textBlock.text;
}

/**
 * Call Claude expecting a JSON response. Parses the result and retries once
 * with an explicit JSON reminder if the first attempt produces invalid JSON.
 */
export async function callClaudeJson<T>(prompt: string): Promise<T> {
  const raw = await callClaude(prompt);
  try {
    return parseJsonResponse<T>(raw);
  } catch {
    // Retry once with an explicit JSON-only reminder
    const retryRaw = await callClaude(
      prompt +
        "\n\nIMPORTANT: Your previous response contained invalid JSON. You MUST respond with valid JSON only — no markdown, no trailing commas, no comments."
    );
    return parseJsonResponse<T>(retryRaw);
  }
}
