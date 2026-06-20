import type { AiDesignProvider } from "@/lib/ai/ai-provider-types";
import { generateMockDesignSpec } from "@/lib/mock-generator";

export const mockProvider: AiDesignProvider = {
  id: "mock",
  label: "Mock",
  isConfigured: () => true,
  getModelName: () => "local mock generator",
  async generateDesign(input) {
    return generateMockDesignSpec(input.userPrompt, input.designSystem);
  },
};
