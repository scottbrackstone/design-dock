"use client";

import { Button } from "@/components/ui/Button";
import {
  applyDesktopStylesToBreakpoints,
  autoCreateMobileLayout,
  resetBreakpointOverride,
} from "@/lib/design-actions";
import { compactViewportLabels, viewportLabels } from "@/lib/responsive-design";
import { useDesignStore } from "@/store/useDesignStore";

export function BreakpointControls() {
  const { currentSpec, selectedNodeId, updateCurrentSpec, viewport } = useDesignStore();

  if (!currentSpec) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase text-zinc-500">Editing breakpoint</p>
        <span className="rounded bg-teal-500 px-2 py-1 text-xs font-black text-zinc-950">
          {compactViewportLabels[viewport]}
        </span>
      </div>
      <div className="mt-3 grid gap-2">
        <Button onClick={() => updateCurrentSpec((spec) => applyDesktopStylesToBreakpoints(spec, selectedNodeId))}>
          Desktop to tablet/mobile
        </Button>
        <Button
          onClick={() => updateCurrentSpec((spec) => resetBreakpointOverride(spec, selectedNodeId, viewport))}
        >
          Reset {viewportLabels[viewport]}
        </Button>
        <Button onClick={() => updateCurrentSpec((spec) => autoCreateMobileLayout(spec, selectedNodeId))}>
          Auto mobile layout
        </Button>
      </div>
    </div>
  );
}
