"use client";

import { useRef } from "react";
import { CanvasResizeOverlay } from "@/components/canvas/CanvasResizeOverlay";
import { DesignRenderer } from "@/components/design-renderer/DesignRenderer";
import { Button } from "@/components/ui/Button";
import { useDesignStore } from "@/store/useDesignStore";
import { CanvasViewport } from "@/components/canvas/CanvasViewport";

export function DesignCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    clearSelection,
    clearHover,
    currentSpec,
    error,
    generateDesign,
    hoverNode,
    hoveredNodeId,
    isGenerating,
    reorderSectionByDrop,
    selectNode,
    selectedNodeId,
    viewport,
  } = useDesignStore();

  if (!currentSpec) {
    return (
      <div className="flex min-h-[620px] items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950/45 p-8 text-center">
        <div className="max-w-md">
          <p className="text-sm font-black uppercase text-teal-300">DesignDock</p>
          <h1 className="mt-3 text-3xl font-black text-zinc-50">Generate your first editable UI design</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            The mock generator works without an API key and returns a validated DesignSpec.
          </p>
          <Button
            className="mt-6"
            disabled={isGenerating}
            onClick={() => void generateDesign("A premium landing page for an AI design workbench")}
            variant="primary"
          >
            {isGenerating ? "Generating..." : "Generate starter design"}
          </Button>
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-[680px] justify-center overflow-auto rounded-lg border border-zinc-800 bg-[linear-gradient(45deg,#27272a_25%,transparent_25%),linear-gradient(-45deg,#27272a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#27272a_75%),linear-gradient(-45deg,transparent_75%,#27272a_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] p-8 editor-scrollbar"
      onClick={clearSelection}
      onMouseLeave={clearHover}
      ref={canvasRef}
    >
      <CanvasViewport viewport={viewport}>
        <DesignRenderer
          hoveredNodeId={hoveredNodeId}
          onClearHover={clearHover}
          onHoverNode={hoverNode}
          onReorderSection={reorderSectionByDrop}
          onSelectNode={selectNode}
          selectedNodeId={selectedNodeId}
          spec={currentSpec}
        />
      </CanvasViewport>
      <CanvasResizeOverlay containerRef={canvasRef} />
    </div>
  );
}
