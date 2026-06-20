import type { AiProviderId } from "@/lib/ai/ai-provider-types";

export type AiDiagnosticEvent = {
  provider: AiProviderId;
  model: string;
  requestType: "generate" | "refine-selected" | "refine-whole" | "alternatives" | "audit";
  promptLength?: number;
  parseStatus?: "success" | "failure";
  validationStatus?: "success" | "failure";
  validationErrors?: unknown;
  usage?: unknown;
};

export function estimatePromptLength(prompt: string) {
  return Math.ceil(prompt.length / 4);
}

export function logAiDiagnostic(event: AiDiagnosticEvent) {
  if (process.env.NODE_ENV !== "development") return;

  const { provider, model, requestType, promptLength, parseStatus, validationStatus, usage, validationErrors } = event;
  const safeEvent = {
    provider,
    model,
    requestType,
    promptLength,
    parseStatus,
    validationStatus,
    usage,
    validationErrors,
  };

  if (parseStatus === "failure" || validationStatus === "failure") {
    console.warn("[DesignDock AI]", safeEvent);
    return;
  }

  console.info("[DesignDock AI]", safeEvent);
}
