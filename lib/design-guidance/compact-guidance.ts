import type { DesignSpec, DesignSystemSnapshot } from "@/lib/design-schema";
import { compactAntiSlopGuidance } from "@/lib/design-guidance/anti-slop-rules";
import { inferDesignDials, formatDesignDials } from "@/lib/design-guidance/design-dials";
import { inferDesignRegister } from "@/lib/design-guidance/design-register";
import { buildDesignSystemPromptGuidance } from "@/lib/design-guidance/design-system-prompts";
import { getCopyGuidanceForPrompt } from "@/lib/design-guidance/copy-rules";
import { getPageTypeRules, normalizePageKind } from "@/lib/design-guidance/page-type-rules";

export function inferPageKindFromPrompt(prompt: string, fallback?: string) {
  const lower = prompt.toLowerCase();
  if (/mobile app|app landing|ios|android/.test(lower)) return "mobile-app-landing";
  if (/admin/.test(lower)) return "admin-panel";
  if (/dashboard|analytics|metrics/.test(lower)) return "dashboard";
  if (/settings|preferences|account/.test(lower)) return "settings";
  if (/gallery|photo|media/.test(lower)) return "gallery";
  if (/portfolio|personal site|studio/.test(lower)) return "portfolio-homepage";
  if (/pricing|plans|billing/.test(lower)) return "pricing";
  if (/form|checkout|onboarding|workflow/.test(lower)) return "form-workflow";
  return normalizePageKind(fallback);
}

export function buildDesignRead(input: {
  prompt: string;
  designSystem: DesignSystemSnapshot;
  pageKind?: string;
}) {
  const pageKind = inferPageKindFromPrompt(input.prompt, input.pageKind);
  const register = inferDesignRegister({
    prompt: input.prompt,
    pageKind,
    designSystemName: input.designSystem.name,
  });
  const dials = inferDesignDials({
    prompt: input.prompt,
    register,
    pageKind,
    designSystemName: input.designSystem.name,
  });

  return { register, pageKind, dials };
}

export function buildCompactDesignGuidance(input: {
  prompt: string;
  designSystem: DesignSystemSnapshot;
  pageKind?: string;
}) {
  const designRead = buildDesignRead(input);
  const pageRules = getPageTypeRules(designRead.pageKind);
  const copyGuidance = getCopyGuidanceForPrompt(input.prompt);

  return [
    `Design Read: Reading this as: ${designRead.register} ${designRead.pageKind} for the likely audience, using ${input.designSystem.name}, with dials ${formatDesignDials(designRead.dials)}.`,
    `Primary goal: ${pageRules.primaryGoal}`,
    `Recommended sections: ${pageRules.recommendedSections.join(", ")}.`,
    `Common mistakes to avoid: ${pageRules.commonMistakes.join(", ")}.`,
    "Design system guidance:",
    buildDesignSystemPromptGuidance(input.designSystem),
    "Anti-slop constraints:",
    compactAntiSlopGuidance(designRead.register),
    `Copy guidance: ${copyGuidance.join(" ")}`,
  ].join("\n");
}

export function compactSpecForGuidance(spec: DesignSpec) {
  return JSON.stringify({
    title: spec.title,
    kind: spec.kind,
    theme: spec.theme,
    designSystem: {
      id: spec.designSystem.id,
      name: spec.designSystem.name,
      visualTone: spec.designSystem.rules.visualTone,
    },
    sections: spec.page.sections.map((section, index) => ({
      index,
      id: section.id,
      type: section.type,
      name: section.name,
      layout: section.layout,
      elements: section.elements.map((element) => ({
        id: element.id,
        type: element.type,
        label:
          element.type === "text"
            ? element.content.slice(0, 120)
            : element.type === "button"
              ? element.label
              : element.type === "card"
                ? element.title
                : element.type === "image"
                  ? element.label ?? element.alt
                  : `${element.value} ${element.label}`,
      })),
    })),
  });
}
