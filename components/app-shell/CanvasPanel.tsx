"use client";

import { DesignCanvas } from "@/components/canvas/DesignCanvas";
import { TopToolbar } from "@/components/app-shell/TopToolbar";

export function CanvasPanel() {
  return (
    <main className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950/70 shadow-panel">
      <TopToolbar />
      <div className="p-4">
        <DesignCanvas />
      </div>
    </main>
  );
}
