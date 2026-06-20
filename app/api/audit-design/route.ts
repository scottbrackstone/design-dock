import { NextResponse } from "next/server";
import { z } from "zod";
import { auditDesignWithAi } from "@/lib/ai-provider";
import { designSpecSchema } from "@/lib/design-schema-zod";

const auditRequestSchema = z.object({
  currentSpec: designSpecSchema,
});

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const result = auditRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "A valid currentSpec is required." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI audit requires OPENAI_API_KEY." }, { status: 400 });
  }

  try {
    const issues = await auditDesignWithAi(result.data.currentSpec);
    return NextResponse.json({ issues, source: "ai" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI audit failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
