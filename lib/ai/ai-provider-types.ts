import type { DesignSpec, DesignSystemSnapshot } from "@/lib/design-schema";

export const aiProviderIds = ["mock", "deepseek", "minimax"] as const;

export type AiProviderId = (typeof aiProviderIds)[number];

export type AiProviderStatus = {
  id: AiProviderId;
  label: string;
  configured: boolean;
  modelName: string;
  isDefault: boolean;
};

export type GenerateDesignInput = {
  userPrompt: string;
  designSystem: DesignSystemSnapshot;
  pageKind?: string;
  schemaSummary: string;
};

export type GenerateAlternativesInput = GenerateDesignInput & {
  count: 2 | 3;
};

export type RefineSelectedNodeInput = {
  instruction: string;
  selectedNode: unknown;
  compactPageContext: string;
  designSystem: DesignSystemSnapshot;
  schemaSummary: string;
};

export type RefineWholeDesignInput = {
  instruction: string;
  compactDesignSpec: string;
  designSystem: DesignSystemSnapshot;
  schemaSummary: string;
};

export type AiDesignProvider = {
  id: AiProviderId;
  label: string;
  isConfigured: () => boolean;
  getModelName: () => string;
  generateDesign: (input: GenerateDesignInput) => Promise<DesignSpec>;
  generateDesignAlternatives?: (input: GenerateAlternativesInput) => Promise<DesignSpec[]>;
  refineSelectedNode?: (input: RefineSelectedNodeInput) => Promise<unknown>;
  refineWholeDesign?: (input: RefineWholeDesignInput) => Promise<DesignSpec>;
};

export const DESIGN_SPEC_SCHEMA_SUMMARY =
  "DesignSpec { id, title, description, kind, theme, viewport, designSystem, page { id, type:'page', name, style, sections[] } }. Sections use supported types header, hero, features, gallery, stats, cta, footer, custom. Elements use supported types text, button, card, image, stat. Styles use local DesignSpec fields only.";

export function isAiProviderId(value: unknown): value is AiProviderId {
  return typeof value === "string" && aiProviderIds.includes(value as AiProviderId);
}
