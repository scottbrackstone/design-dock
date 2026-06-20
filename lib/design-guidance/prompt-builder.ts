import type { DesignSystemSnapshot } from "@/lib/design-schema";
import { buildCompactDesignGuidance } from "@/lib/design-guidance/compact-guidance";
import { buildDesignSystemPromptGuidance } from "@/lib/design-guidance/design-system-prompts";

type BasePromptInput = {
  designSystem: DesignSystemSnapshot;
  pageKind?: string;
  schemaSummary: string;
};

function outputRules(schemaSummary: string) {
  return [
    "Output format:",
    "- Return valid JSON only.",
    "- Return DesignSpec JSON matching the schema summary.",
    "- Do not return React, JavaScript, HTML, markdown, comments, or prose.",
    "- Do not execute or suggest arbitrary generated code.",
    "- DesignSpec is the source of truth.",
    `Schema summary: ${schemaSummary}`,
  ].join("\n");
}

export function buildGenerateDesignPrompt(input: BasePromptInput & { userPrompt: string }): string {
  return [
    "Create a polished editable DesignSpec for the user's brief.",
    buildCompactDesignGuidance({
      prompt: input.userPrompt,
      designSystem: input.designSystem,
      pageKind: input.pageKind,
    }),
    "Generation requirements:",
    "- Reflect the selected design system in page, section, and element styles.",
    "- Use stable string ids for every section and element.",
    "- Use safe hex colours.",
    "- Include responsive behavior through DesignSpec fields where useful.",
    `User brief: ${input.userPrompt}`,
    outputRules(input.schemaSummary),
  ].join("\n\n");
}

export function buildGenerateAlternativesPrompt(
  input: BasePromptInput & {
    userPrompt: string;
    numberOfAlternatives: 2 | 3;
  },
): string {
  return [
    `Create ${input.numberOfAlternatives} meaningfully different DesignSpec alternatives for the user's brief.`,
    buildCompactDesignGuidance({
      prompt: input.userPrompt,
      designSystem: input.designSystem,
      pageKind: input.pageKind,
    }),
    "Alternative requirements:",
    "- Directions must differ in layout strategy, density, and storytelling, not just color.",
    "- Keep every alternative compatible with the selected design system.",
    "- Return a JSON object with an alternatives array of DesignSpec objects.",
    `User brief: ${input.userPrompt}`,
    outputRules(input.schemaSummary),
  ].join("\n\n");
}

export function buildRefineSelectedNodePrompt(input: {
  instruction: string;
  selectedNode: unknown;
  compactPageContext: string;
  designSystem: DesignSystemSnapshot;
  schemaSummary: string;
}): string {
  return [
    "Refine the selected DesignSpec node while preserving the rest of the design unless the instruction requires context changes.",
    "Design system guidance:",
    buildDesignSystemPromptGuidance(input.designSystem),
    "Selected-node context:",
    `Selected node JSON: ${JSON.stringify(input.selectedNode)}`,
    `Compact page context: ${input.compactPageContext}`,
    `Instruction: ${input.instruction}`,
    outputRules(input.schemaSummary),
  ].join("\n\n");
}

export function buildRefineWholeDesignPrompt(input: {
  instruction: string;
  compactDesignSpec: string;
  designSystem: DesignSystemSnapshot;
  schemaSummary: string;
}): string {
  return [
    "Refine the full DesignSpec without replacing the design with generic template output.",
    "Design system guidance:",
    buildDesignSystemPromptGuidance(input.designSystem),
    "Anti-slop priorities: preserve specificity, improve hierarchy, maintain responsive structure, and avoid generic AI copy.",
    `Instruction: ${input.instruction}`,
    `Compact DesignSpec: ${input.compactDesignSpec}`,
    outputRules(input.schemaSummary),
  ].join("\n\n");
}

export function buildAuditPrompt(input: {
  compactDesignSpec: string;
  designSystem: DesignSystemSnapshot;
  pageKind?: string;
}): string {
  return [
    "Audit this DesignSpec summary for design quality. Do not mutate the design.",
    buildCompactDesignGuidance({
      prompt: input.compactDesignSpec,
      designSystem: input.designSystem,
      pageKind: input.pageKind,
    }),
    "Return prioritized issues with severity, affected section/node ids when available, explanation, and suggested fix.",
    "Return JSON only in the audit response schema.",
    `Compact DesignSpec: ${input.compactDesignSpec}`,
  ].join("\n\n");
}
