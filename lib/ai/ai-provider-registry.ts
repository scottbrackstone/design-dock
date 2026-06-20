import { aiProviderIds, isAiProviderId, type AiProviderId, type AiProviderStatus } from "@/lib/ai/ai-provider-types";
import { deepSeekProvider } from "@/lib/ai/deepseek-provider";
import { miniMaxProvider } from "@/lib/ai/minimax-provider";
import { mockProvider } from "@/lib/ai/mock-provider";

const providers = {
  mock: mockProvider,
  deepseek: deepSeekProvider,
  minimax: miniMaxProvider,
};

export function getDefaultAiProviderId(): AiProviderId {
  const configured = process.env.DEFAULT_AI_PROVIDER?.trim();
  return isAiProviderId(configured) ? configured : "mock";
}

export function getAiProvider(providerId: AiProviderId | undefined) {
  return providers[providerId ?? getDefaultAiProviderId()] ?? mockProvider;
}

export function getAiProviderStatuses(): AiProviderStatus[] {
  const defaultProviderId = getDefaultAiProviderId();
  return aiProviderIds.map((id) => {
    const provider = providers[id];
    return {
      id,
      label: provider.label,
      configured: provider.isConfigured(),
      modelName: provider.getModelName(),
      isDefault: id === defaultProviderId,
    };
  });
}

export function requireConfiguredProvider(providerId: AiProviderId | undefined) {
  const provider = getAiProvider(providerId);
  if (!provider.isConfigured()) {
    throw new Error(`${provider.label} is selected, but its API key is not configured.`);
  }
  return provider;
}
