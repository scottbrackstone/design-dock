import type { AiDesignProvider, GenerateDesignInput } from "@/lib/ai/ai-provider-types";
import { estimatePromptLength, logAiDiagnostic } from "@/lib/ai/ai-diagnostics";
import { safeParseModelJson } from "@/lib/ai/json-parsing";
import { buildGenerateDesignPrompt } from "@/lib/design-guidance/prompt-builder";
import { designSpecSchema } from "@/lib/design-schema-zod";

type ChatCompletionPayload = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: unknown;
};

function getApiKey() {
  return process.env.DEEPSEEK_API_KEY?.trim();
}

function getBaseUrl() {
  return (process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com").replace(/\/$/, "");
}

function getModelName() {
  return process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash";
}

async function requestDeepSeekJson(input: GenerateDesignInput) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("DeepSeek is selected, but DEEPSEEK_API_KEY is not configured.");
  }

  const model = getModelName();
  const prompt = buildGenerateDesignPrompt(input);
  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are DesignDock's structured JSON design generator. Return json only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 12000,
      temperature: 0.45,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as ChatCompletionPayload;
  const content = payload.choices?.[0]?.message?.content;

  logAiDiagnostic({
    provider: "deepseek",
    model,
    requestType: "generate",
    promptLength: estimatePromptLength(prompt),
    usage: payload.usage,
  });

  if (!content) {
    throw new Error("DeepSeek returned an empty response.");
  }

  return { content, model, prompt };
}

export const deepSeekProvider: AiDesignProvider = {
  id: "deepseek",
  label: "DeepSeek",
  isConfigured: () => Boolean(getApiKey()),
  getModelName,
  async generateDesign(input) {
    const { content, model, prompt } = await requestDeepSeekJson(input);

    let parsed: unknown;
    try {
      parsed = safeParseModelJson(content);
      logAiDiagnostic({
        provider: "deepseek",
        model,
        requestType: "generate",
        promptLength: estimatePromptLength(prompt),
        parseStatus: "success",
      });
    } catch (error) {
      logAiDiagnostic({
        provider: "deepseek",
        model,
        requestType: "generate",
        promptLength: estimatePromptLength(prompt),
        parseStatus: "failure",
        validationErrors: error instanceof Error ? error.message : error,
      });
      throw error;
    }

    const result = designSpecSchema.safeParse(parsed);
    if (!result.success) {
      logAiDiagnostic({
        provider: "deepseek",
        model,
        requestType: "generate",
        validationStatus: "failure",
        validationErrors: result.error.flatten(),
      });
      throw new Error("DeepSeek returned JSON that did not match the DesignSpec schema.");
    }

    logAiDiagnostic({ provider: "deepseek", model, requestType: "generate", validationStatus: "success" });
    return result.data;
  },
};
