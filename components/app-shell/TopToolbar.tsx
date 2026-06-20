"use client";

import { BreakpointToggle } from "@/components/canvas/BreakpointToggle";
import { Button } from "@/components/ui/Button";
import { getNodeBreadcrumb, getNodeLabel } from "@/lib/design-actions";
import { cx } from "@/lib/tailwind-utils";
import { useDesignStore } from "@/store/useDesignStore";

export function TopToolbar() {
  const {
    canRedo,
    canUndo,
    clearSelection,
    currentSpec,
    message,
    redo,
    selectNode,
    selectedNodeId,
    undo,
  } = useDesignStore();
  const selectedLabel = currentSpec ? getNodeLabel(currentSpec, selectedNodeId) : "No design";
  const breadcrumbs = currentSpec ? getNodeBreadcrumb(currentSpec, selectedNodeId) : [];

  return (
    <div className="flex flex-col gap-4 border-b border-zinc-800 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase text-zinc-500">Canvas</p>
        <h2 className="text-sm font-black text-zinc-50">{currentSpec?.title ?? "No active design"}</h2>
        <p className="mt-1 text-xs text-zinc-500">Selected: {selectedLabel}</p>
        {breadcrumbs.length > 0 && (
          <nav aria-label="Selected node path" className="mt-2 flex flex-wrap items-center gap-1 text-xs">
            {breadcrumbs.map((crumb, index) => {
              const active = index === breadcrumbs.length - 1;

              return (
                <span className="flex items-center gap-1" key={`${crumb.type}-${crumb.id ?? "page"}-${index}`}>
                  {index > 0 && <span className="text-zinc-600">/</span>}
                  <button
                    className={cx(
                      "max-w-44 truncate rounded px-2 py-1 text-left font-bold transition",
                      active
                        ? "bg-teal-400/15 text-teal-200"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
                    )}
                    onClick={() => {
                      if (crumb.id) {
                        selectNode(crumb.id);
                      } else {
                        clearSelection();
                      }
                    }}
                    title={`${crumb.type}: ${crumb.label}`}
                    type="button"
                  >
                    {crumb.type}: {crumb.label}
                  </button>
                </span>
              );
            })}
          </nav>
        )}
      </div>
      <div className="w-full max-w-sm">
        <BreakpointToggle />
      </div>
      <div className="flex gap-2">
        <Button
          aria-label="Undo local edit"
          className="min-h-9 px-3 py-1.5 text-xs"
          disabled={!canUndo}
          onClick={undo}
          title="Undo local edit (Ctrl/Cmd+Z)"
          variant="ghost"
        >
          Undo
        </Button>
        <Button
          aria-label="Redo local edit"
          className="min-h-9 px-3 py-1.5 text-xs"
          disabled={!canRedo}
          onClick={redo}
          title="Redo local edit (Ctrl/Cmd+Shift+Z)"
          variant="ghost"
        >
          Redo
        </Button>
      </div>
      {message && <p className="text-xs font-medium text-teal-200">{message}</p>}
    </div>
  );
}
