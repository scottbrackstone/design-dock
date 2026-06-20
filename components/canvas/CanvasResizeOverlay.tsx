"use client";

import { useEffect, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { Viewport } from "@/lib/design-schema";
import {
  findNodeById,
  getNodeDisplayName,
  isResizableDesignNode,
  resizeDesignNode,
  type CanvasResizePatch,
} from "@/lib/design-actions";
import { cx } from "@/lib/tailwind-utils";
import { useDesignStore } from "@/store/useDesignStore";

type ResizeHandle = "right" | "bottom" | "corner";

type OverlayBox = {
  nodeId: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

type ResizeDragState = {
  box: OverlayBox;
  handle: ResizeHandle;
  nodeId: string;
  startClientX: number;
  startClientY: number;
  startHeight: number;
  startWidth: number;
  viewport: Viewport;
};

function findNodeElement(root: HTMLElement, nodeId: string) {
  const candidates = root.querySelectorAll<HTMLElement>("[data-node-id]");
  return Array.from(candidates).find((element) => element.dataset.nodeId === nodeId) ?? null;
}

function overlayBoxForElement(container: HTMLElement, element: HTMLElement, nodeId: string): OverlayBox {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return {
    height: elementRect.height,
    left: elementRect.left - containerRect.left + container.scrollLeft,
    nodeId,
    top: elementRect.top - containerRect.top + container.scrollTop,
    width: elementRect.width,
  };
}

function visualSize(value: number, minimum: number) {
  return Math.max(Math.round(value), minimum);
}

export function CanvasResizeOverlay({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const { currentSpec, selectedNodeId, updateCurrentSpec, viewport } = useDesignStore();
  const [box, setBox] = useState<OverlayBox | null>(null);
  const [drag, setDrag] = useState<ResizeDragState | null>(null);
  const [previewBox, setPreviewBox] = useState<OverlayBox | null>(null);

  const lookup = currentSpec ? findNodeById(currentSpec, selectedNodeId) : null;
  const canResize = Boolean(currentSpec && isResizableDesignNode(currentSpec, selectedNodeId));
  const label = lookup?.kind === "element" ? getNodeDisplayName(lookup.node) : "selected node";
  const measuredBox = box?.nodeId === selectedNodeId ? box : null;
  const activeBox = previewBox ?? measuredBox;
  const isDragging = Boolean(drag);

  useEffect(() => {
    if (!currentSpec || !selectedNodeId || !canResize || drag) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const selectedElement = findNodeElement(container, selectedNodeId);
    if (!selectedElement) {
      return;
    }

    const syncBox = () => {
      setBox(overlayBoxForElement(container, selectedElement, selectedNodeId));
    };

    const animationFrame = window.requestAnimationFrame(syncBox);
    container.addEventListener("scroll", syncBox, { passive: true });
    window.addEventListener("resize", syncBox);

    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(syncBox) : null;
    resizeObserver?.observe(container);
    resizeObserver?.observe(selectedElement);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      container.removeEventListener("scroll", syncBox);
      window.removeEventListener("resize", syncBox);
      resizeObserver?.disconnect();
    };
  }, [canResize, containerRef, currentSpec, drag, selectedNodeId]);

  useEffect(() => {
    if (!drag) return;
    const activeDrag = drag;

    function handlePointerMove(event: PointerEvent) {
      const nextWidth =
        activeDrag.handle === "right" || activeDrag.handle === "corner"
          ? visualSize(activeDrag.startWidth + event.clientX - activeDrag.startClientX, 80)
          : activeDrag.startWidth;
      const nextHeight =
        activeDrag.handle === "bottom" || activeDrag.handle === "corner"
          ? visualSize(activeDrag.startHeight + event.clientY - activeDrag.startClientY, 80)
          : activeDrag.startHeight;

      setPreviewBox({
        ...activeDrag.box,
        height: nextHeight,
        width: nextWidth,
      });
    }

    function handlePointerUp() {
      const finalBox = previewBox ?? activeDrag.box;
      const patch: CanvasResizePatch = {};

      if (activeDrag.handle === "right" || activeDrag.handle === "corner") {
        patch.width = finalBox.width;
      }

      if (activeDrag.handle === "bottom" || activeDrag.handle === "corner") {
        patch.minHeight = finalBox.height;
      }

      updateCurrentSpec((spec) => resizeDesignNode(spec, activeDrag.nodeId, activeDrag.viewport, patch));
      setDrag(null);
      setPreviewBox(null);
    }

    function handlePointerCancel() {
      setDrag(null);
      setPreviewBox(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointercancel", handlePointerCancel, { once: true });
    window.addEventListener("pointerup", handlePointerUp, { once: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [drag, previewBox, updateCurrentSpec]);

  if (!currentSpec || !selectedNodeId || !canResize || !activeBox) return null;

  const beginResize = (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setDrag({
      box: activeBox,
      handle,
      nodeId: selectedNodeId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startHeight: activeBox.height,
      startWidth: activeBox.width,
      viewport,
    });
    setPreviewBox(activeBox);
  };

  return (
    <div
      className={cx(
        "pointer-events-none absolute z-40 rounded-md border-2 border-teal-300 shadow-[0_0_0_1px_rgba(15,23,42,0.35)]",
        isDragging && "border-dashed bg-teal-300/5",
      )}
      style={{
        height: activeBox.height,
        left: activeBox.left,
        top: activeBox.top,
        width: activeBox.width,
      }}
    >
      {isDragging && (
        <>
          <div className="absolute bottom-0 right-0 top-0 w-px bg-teal-200/80" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-teal-200/80" />
          <div className="absolute -bottom-7 right-0 rounded bg-zinc-950/90 px-2 py-1 text-[11px] font-black text-teal-100 ring-1 ring-teal-300/40">
            {Math.round(activeBox.width)} x {Math.round(activeBox.height)}
          </div>
        </>
      )}
      <button
        aria-label={`Resize ${label} width`}
        className="pointer-events-auto absolute -right-2 top-1/2 h-9 w-4 -translate-y-1/2 cursor-ew-resize rounded-full border border-teal-100 bg-teal-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-100"
        onPointerDown={beginResize("right")}
        tabIndex={-1}
        type="button"
      />
      <button
        aria-label={`Resize ${label} height`}
        className="pointer-events-auto absolute -bottom-2 left-1/2 h-4 w-9 -translate-x-1/2 cursor-ns-resize rounded-full border border-teal-100 bg-teal-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-100"
        onPointerDown={beginResize("bottom")}
        tabIndex={-1}
        type="button"
      />
      <button
        aria-label={`Resize ${label} width and height`}
        className="pointer-events-auto absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded border border-teal-100 bg-teal-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-100"
        onPointerDown={beginResize("corner")}
        tabIndex={-1}
        type="button"
      />
    </div>
  );
}
