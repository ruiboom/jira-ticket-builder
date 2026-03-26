/**
 * Sanitize common JSON issues from LLM output:
 * - Trailing commas before ] or }
 * - Truncated responses (attempt to close open brackets)
 */
function sanitizeJson(str: string): string {
  // Strip trailing commas before closing brackets/braces
  let sanitized = str.replace(/,\s*([}\]])/g, "$1");

  // Attempt to fix truncated JSON by closing open brackets
  const opens = { "{": 0, "[": 0 };
  let inString = false;
  let escape = false;

  for (const ch of sanitized) {
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{") opens["{"]++;
    else if (ch === "}") opens["{"]--;
    else if (ch === "[") opens["["]++;
    else if (ch === "]") opens["["]--;
  }

  // If we're inside a string when it truncated, close the string first
  if (inString) {
    sanitized += '"';
  }

  // Close any unclosed arrays then objects
  for (let i = 0; i < opens["["]; i++) sanitized += "]";
  for (let i = 0; i < opens["{"]; i++) sanitized += "}";

  return sanitized;
}

export function parseJsonResponse<T>(raw: string): T {
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : raw;
  const trimmed = jsonStr.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Try again after sanitizing common LLM JSON issues
    const sanitized = sanitizeJson(trimmed);
    return JSON.parse(sanitized);
  }
}
