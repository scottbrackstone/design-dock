"use client";

import { DesignSystemPicker } from "@/components/editor/DesignSystemPicker";
import { AiSettingsPanel } from "@/components/editor/AiSettingsPanel";
import { ExportPanel } from "@/components/editor/ExportPanel";
import { ProjectManager } from "@/components/editor/ProjectManager";
import { AuditPanel } from "@/components/editor/AuditPanel";
import { RefinementBox } from "@/components/editor/RefinementBox";
import { StarterPanel } from "@/components/editor/StarterPanel";
import { VersionHistory } from "@/components/editor/VersionHistory";
import { useDesignStore } from "@/store/useDesignStore";

export function LeftPanel() {
  const { currentSpec, error } = useDesignStore();

  return (
    <aside className="min-h-0 rounded-lg border border-zinc-800 bg-zinc-950/75 shadow-panel">
      <div className="border-b border-zinc-800 px-4 py-4">
        <p className="text-xs font-black uppercase text-teal-300">DesignDock</p>
        <h1 className="mt-2 text-xl font-black text-zinc-50">AI design workbench</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Prompt, edit locally, save versions, and export from one DesignSpec.
        </p>
      </div>
      <div className="flex max-h-[calc(100vh-8rem)] flex-col gap-6 overflow-auto p-4 editor-scrollbar">
        <StarterPanel />
        <DesignSystemPicker />
        <AiSettingsPanel />
        <ProjectManager />
        <RefinementBox />
        <AuditPanel />
        {error && <p className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
        <div className="border-t border-zinc-800 pt-5">
          <VersionHistory />
        </div>
        <div className="border-t border-zinc-800 pt-5">
          <p className="mb-3 text-xs font-bold uppercase text-zinc-500">Export</p>
          <ExportPanel />
        </div>
        {currentSpec && (
          <p className="text-xs leading-5 text-zinc-500">
            Current source: structured JSON rendered through trusted local components.
          </p>
        )}
      </div>
    </aside>
  );
}
