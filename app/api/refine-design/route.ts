import { NextResponse } from "next/server";
import { z } from "zod";
import { refineDesignWithAi } from "@/lib/ai-provider";
import { mockRefineSpec } from "@/lib/design-actions";
import { designSpecSchema } from "@/lib/design-schema-zod";

const refineRequestSchema = z.object({
  instruction: z.string().min(1),
  currentSpec: designSpecSchema,
  selectedNodeId: z.string().optional(),
});

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const result = refineRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "A valid currentSpec and instruction are required." }, { status: 400 });
  }

  const { instruction, currentSpec, selectedNodeId } = result.data;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      spec: mockRefineSpec(currentSpec, instruction, selectedNodeId),
      source: "mock",
      summary: selectedNodeId ? "Mock refined the selected node." : "Mock refined the full design.",
    });
  }

  try {
    const spec = await refineDesignWithAi(currentSpec, instruction, selectedNodeId);
    return NextResponse.json({
      spec: designSpecSchema.parse(spec),
      source: "ai",
      summary: selectedNodeId ? "AI refined the selected node." : "AI refined the full design.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI refinement failed.";
    return NextResponse.json({
      spec: mockRefineSpec(currentSpec, instruction, selectedNodeId),
      source: "mock",
      summary: `AI refinement failed, so DesignDock used mock refinement. ${message}`,
    });
  }
}
