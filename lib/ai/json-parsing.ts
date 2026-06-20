export class ModelJsonParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelJsonParseError";
  }
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}

export function stripThinkTags(raw: string) {
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/<think>[\s\S]*$/gi, "").trim();
}

export function stripMarkdownJsonFences(raw: string) {
  const trimmed = raw.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  return fenced ? fenced[1].trim() : trimmed;
}

export function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return raw.slice(start, index + 1);
    }
  }

  return null;
}

export function safeParseModelJson(raw: string): unknown {
  try {
    return parseJson(raw);
  } catch (directError) {
    const cleaned = stripMarkdownJsonFences(stripThinkTags(raw));

    try {
      return parseJson(cleaned);
    } catch {
      const extracted = extractJsonObject(cleaned);
      if (extracted) {
        try {
          return parseJson(extracted);
        } catch {
          // Fall through to the useful error below.
        }
      }

      const detail = process.env.NODE_ENV === "development" && directError instanceof Error ? ` ${directError.message}` : "";
      throw new ModelJsonParseError(`Model did not return valid JSON.${detail}`);
    }
  }
}
