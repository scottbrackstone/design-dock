import { NextResponse } from "next/server";
import { getAiProviderStatuses, getDefaultAiProviderId } from "@/lib/ai/ai-provider-registry";

export async function GET() {
  return NextResponse.json({
    defaultProviderId: getDefaultAiProviderId(),
    providers: getAiProviderStatuses(),
  });
}
