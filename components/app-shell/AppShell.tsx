"use client";

import { useEffect } from "react";
import { CanvasPanel } from "@/components/app-shell/CanvasPanel";
import { LeftPanel } from "@/components/app-shell/LeftPanel";
import { RightInspector } from "@/components/app-shell/RightInspector";
import { useDesignStore } from "@/store/useDesignStore";

function isEditableKeyboardTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function isInteractiveKeyboardTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true']"))
  );
}

export function AppShell() {
  const { clearHover, clearSelection, deleteSelected, nudgeSelectedNode, redo, selectedNodeId, undo } = useDesignStore();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isEditableTarget = isEditableKeyboardTarget(event.target);
      const isInteractiveTarget = isInteractiveKeyboardTarget(event.target);

      if (event.key === "Escape") {
        clearSelection();
        clearHover();
        return;
      }

      const isUndoShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey;
      const isRedoShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && event.shiftKey;

      if (isUndoShortcut && !isEditableTarget) {
        event.preventDefault();
        undo();
        return;
      }

      if (isRedoShortcut && !isEditableTarget) {
        event.preventDefault();
        redo();
        return;
      }

      if (!selectedNodeId || isInteractiveTarget || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgeSelectedNode("left", event.shiftKey);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgeSelectedNode("right", event.shiftKey);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        nudgeSelectedNode("up", event.shiftKey);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        nudgeSelectedNode("down", event.shiftKey);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearHover, clearSelection, deleteSelected, nudgeSelectedNode, redo, selectedNodeId, undo]);

  return (
    <div className="grid min-h-screen gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
      <LeftPanel />
      <CanvasPanel />
      <RightInspector />
    </div>
  );
}
