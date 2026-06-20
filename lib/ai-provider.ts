import type { DesignSpec, DesignSystemSnapshot } from "@/lib/design-schema";
import { findNodeById } from "@/lib/design-actions";
import { defaultDesignSystem } from "@/lib/design-systems";
import { designSpecSchema } from "@/lib/design-schema-zod";
import {
  aiAuditResponseSchema,
  compactDesignAuditSummary,
  normalizeAiAuditIssues,
  type AuditIssue,
} from "@/lib/design-audit";
import { compactSpecForGuidance } from "@/lib/design-guidance/compact-guidance";
import {
  buildAuditPrompt,
  buildGenerateDesignPrompt,
  buildRefineSelectedNodePrompt,
  buildRefineWholeDesignPrompt,
} from "@/lib/design-guidance/prompt-builder";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DESIGN_SPEC_SCHEMA_SUMMARY =
  "DesignSpec { id, title, description, kind, theme, viewport, designSystem, page { id, type:'page', name, style, sections[] } }. Sections use supported types header, hero, features, gallery, stats, cta, footer, custom. Elements use supported types text, button, card, image, stat. Styles use local DesignSpec fields only.";

type ChatCompletionPayload = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

function getModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
}

function buildSystemPrompt() {
  return [
    "You are DesignDock's structured UI design generator.",
    "Return only valid JSON matching the DesignSpec schema.",
    "Do not return React, JavaScript, HTML, markdown, or explanatory prose.",
    "Use the provided local schema style fields and safe hex colours.",
    "Supported section types: header, hero, features, gallery, stats, cta, footer, custom.",
    "Supported element types: text, button, card, image, stat.",
  ].join("\n");
}

function buildAuditSystemPrompt() {
  return [
    "You are DesignDock's design quality auditor.",
    "Return only valid JSON with this shape: {\"issues\":[{\"severity\":\"low|medium|high\",\"category\":\"string\",\"sectionId\":\"optional id\",\"nodeId\":\"optional id\",\"title\":\"string\",\"explanation\":\"string\",\"suggestedFix\":\"string\"}]}",
    "Do not return markdown or explanatory prose.",
    "Prioritize actionable design issues over generic advice.",
    "Use only sectionId and nodeId values that appear in the provided summary.",
    "Do not suggest executing arbitrary code or replacing the structured DesignSpec model.",
  ].join("\n");
}

function parseValidatedSpec(content: string): DesignSpec {
  const parsed = JSON.parse(content) as unknown;
  return designSpecSchema.parse(parsed);
}

async function requestJson(userPrompt: string, systemPrompt = buildSystemPrompt(), temperature = 0.55) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as ChatCompletionPayload;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI provider returned an empty response.");
  }

  return content;
}

export async function generateDesignWithAi(
  prompt: string,
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): Promise<DesignSpec> {
  const content = await requestJson(buildGenerateDesignPrompt({
    userPrompt: prompt,
    designSystem,
    schemaSummary: DESIGN_SPEC_SCHEMA_SUMMARY,
  }));

  return parseValidatedSpec(content);
}

export async function auditDesignWithAi(currentSpec: DesignSpec): Promise<AuditIssue[]> {
  const summary = compactDesignAuditSummary(currentSpec);
  const content = await requestJson(buildAuditPrompt({
    compactDesignSpec: JSON.stringify(summary),
    designSystem: currentSpec.designSystem,
    pageKind: currentSpec.kind,
  }), buildAuditSystemPrompt(), 0.2);
  const parsed = JSON.parse(content) as unknown;
  return normalizeAiAuditIssues(aiAuditResponseSchema.parse(parsed));
}

export async function refineDesignWithAi(
  currentSpec: DesignSpec,
  instruction: string,
  selectedNodeId?: string,
): Promise<DesignSpec> {
  const selectedNode = selectedNodeId ? findNodeById(currentSpec, selectedNodeId)?.node : null;
  const content = await requestJson(
    selectedNode
      ? buildRefineSelectedNodePrompt({
          instruction,
          selectedNode,
          compactPageContext: compactSpecForGuidance(currentSpec),
          designSystem: currentSpec.designSystem,
          schemaSummary: DESIGN_SPEC_SCHEMA_SUMMARY,
        })
      : buildRefineWholeDesignPrompt({
          instruction,
          compactDesignSpec: compactSpecForGuidance(currentSpec),
          designSystem: currentSpec.designSystem,
          schemaSummary: DESIGN_SPEC_SCHEMA_SUMMARY,
        }),
  );

  return parseValidatedSpec(content);
}
