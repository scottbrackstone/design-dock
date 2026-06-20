import { NextResponse } from "next/server";
import { z } from "zod";
import { DESIGN_SPEC_SCHEMA_SUMMARY, isAiProviderId } from "@/lib/ai/ai-provider-types";
import { getAiProvider, getAiProviderStatuses } from "@/lib/ai/ai-provider-registry";
import { designSpecSchema, designSystemSchema } from "@/lib/design-schema-zod";
import { defaultDesignSystem } from "@/lib/design-systems";

const generateRequestSchema = z.object({
  prompt: z.string().min(1),
  designSystem: designSystemSchema.optional(),
  pageKind: z.string().optional(),
  providerId: z.string().optional(),
});

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const result = generateRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const { prompt, pageKind } = result.data;
  const designSystem = result.data.designSystem ?? defaultDesignSystem;
  const providerId = isAiProviderId(result.data.providerId) ? result.data.providerId : undefined;
  const provider = getAiProvider(providerId);

  try {
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          error: `${provider.label} is selected, but its API key is not configured. Choose Mock or add the provider key in .env.local.`,
          providerStatuses: getAiProviderStatuses(),
        },
        { status: 400 },
      );
    }

    const spec = await provider.generateDesign({
      userPrompt: prompt,
      designSystem,
      pageKind,
      schemaSummary: DESIGN_SPEC_SCHEMA_SUMMARY,
    });
    return NextResponse.json({
      spec: designSpecSchema.parse(spec),
      source: provider.id,
      summary: `Generated with ${provider.label} (${provider.getModelName()}).`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed.";
    return NextResponse.json({ error: message, providerStatuses: getAiProviderStatuses() }, { status: 502 });
  }
}
