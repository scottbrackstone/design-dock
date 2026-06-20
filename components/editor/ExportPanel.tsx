"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { exportDesignSpecJson, exportHandoffPrompt, exportReactComponent } from "@/lib/export-react";
import { useDesignStore } from "@/store/useDesignStore";

type ExportKind = "json" | "react" | "handoff";

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function ExportPanel() {
  const [copied, setCopied] = useState<ExportKind | null>(null);
  const { currentSpec } = useDesignStore();

  async function handleCopy(kind: ExportKind) {
    if (!currentSpec) return;

    const value =
      kind === "json"
        ? exportDesignSpecJson(currentSpec)
        : kind === "react"
          ? exportReactComponent(currentSpec)
          : exportHandoffPrompt(currentSpec);

    await copyText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" disabled={!currentSpec} onClick={() => void handleCopy("json")}>
        {copied === "json" ? "Copied JSON" : "Copy DesignSpec JSON"}
      </Button>
      <Button className="w-full" disabled={!currentSpec} onClick={() => void handleCopy("react")}>
        {copied === "react" ? "Copied React" : "Copy React/Tailwind"}
      </Button>
      <Button className="w-full" disabled={!currentSpec} onClick={() => void handleCopy("handoff")}>
        {copied === "handoff" ? "Copied handoff" : "Copy coding-agent handoff prompt"}
      </Button>
    </div>
  );
}
