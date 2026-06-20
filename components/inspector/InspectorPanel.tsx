"use client";

import { Button } from "@/components/ui/Button";
import { BreakpointControls } from "@/components/inspector/BreakpointControls";
import { ButtonInspector } from "@/components/inspector/ButtonInspector";
import { CardInspector } from "@/components/inspector/CardInspector";
import { ImageInspector } from "@/components/inspector/ImageInspector";
import { PageInspector } from "@/components/inspector/PageInspector";
import { SectionInspector } from "@/components/inspector/SectionInspector";
import { StatInspector } from "@/components/inspector/StatInspector";
import { TextInspector } from "@/components/inspector/TextInspector";
import { findNodeById, getNodeLabel } from "@/lib/design-actions";
import { useDesignStore } from "@/store/useDesignStore";

function SelectedNodeActions() {
  const { deleteSelected, duplicateSelected, selectedNodeId } = useDesignStore();

  if (!selectedNodeId) return null;

  return (
    <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 pt-4">
      <Button onClick={duplicateSelected}>Duplicate</Button>
      <Button onClick={deleteSelected} variant="danger">
        Delete
      </Button>
    </div>
  );
}

export function InspectorPanel() {
  const { currentSpec, selectedNodeId } = useDesignStore();
  const lookup = currentSpec ? findNodeById(currentSpec, selectedNodeId) : null;
  const title = currentSpec ? getNodeLabel(currentSpec, selectedNodeId) : "Inspector";

  let content = <PageInspector />;

  if (lookup?.kind === "section") {
    content = <SectionInspector section={lookup.node} />;
  }

  if (lookup?.kind === "element") {
    const node = lookup.node;
    if (node.type === "text") content = <TextInspector element={node} />;
    if (node.type === "button") content = <ButtonInspector element={node} />;
    if (node.type === "card") content = <CardInspector element={node} />;
    if (node.type === "image") content = <ImageInspector element={node} />;
    if (node.type === "stat") content = <StatInspector element={node} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-3">
        <p className="text-xs font-bold uppercase text-zinc-500">{selectedNodeId ? "Selected node" : "Page controls"}</p>
        <h2 className="mt-1 text-sm font-black text-zinc-50">{title}</h2>
      </div>
      <div className="flex-1 space-y-5 overflow-auto p-4 editor-scrollbar">
        <BreakpointControls />
        {content}
        <SelectedNodeActions />
      </div>
    </div>
  );
}
