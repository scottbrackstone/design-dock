"use client";

import { InspectorPanel } from "@/components/inspector/InspectorPanel";

export function RightInspector() {
  return (
    <aside className="min-h-0 rounded-lg border border-zinc-800 bg-zinc-950/75 shadow-panel">
      <InspectorPanel />
    </aside>
  );
}
