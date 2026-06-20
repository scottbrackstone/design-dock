"use client";

import type { ElementNode, Viewport } from "@/lib/design-schema";
import { getNodeDisplayName, getNodeTypeLabel } from "@/lib/design-actions";
import { cx } from "@/lib/tailwind-utils";
import { ButtonBlock } from "@/components/design-renderer/primitives/ButtonBlock";
import { CardBlock } from "@/components/design-renderer/primitives/CardBlock";
import { ImagePlaceholder } from "@/components/design-renderer/primitives/ImagePlaceholder";
import { StatBlock } from "@/components/design-renderer/primitives/StatBlock";
import { TextBlock } from "@/components/design-renderer/primitives/TextBlock";

type RenderElementProps = {
  element: ElementNode;
  viewport: Viewport;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onHoverNode: (nodeId: string) => void;
  onClearHover: () => void;
  className?: string;
};

function ElementPrimitive({
  element,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
}: Omit<RenderElementProps, "className">) {
  if (element.type === "text") return <TextBlock element={element} viewport={viewport} />;
  if (element.type === "button") return <ButtonBlock element={element} viewport={viewport} />;
  if (element.type === "card") {
    return (
      <CardBlock
        element={element}
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    );
  }
  if (element.type === "image") return <ImagePlaceholder element={element} viewport={viewport} />;
  return <StatBlock element={element} viewport={viewport} />;
}

export function RenderElement({
  element,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
  className,
}: RenderElementProps) {
  const isSelected = selectedNodeId === element.id;
  const isHovered = hoveredNodeId === element.id;
  const showLabel = isSelected || isHovered;
  const label = `${getNodeTypeLabel(element)}: ${getNodeDisplayName(element)}`;

  return (
    <div
      className={cx(
        "relative rounded-md transition",
        isSelected && "shadow-selected",
        !isSelected && isHovered && "outline outline-2 outline-teal-400/70",
        className,
      )}
      data-selectable-element="true"
      data-node-id={element.id}
      data-node-type={element.type}
      onClick={(event) => {
        event.stopPropagation();
        onSelectNode(element.id);
      }}
      onMouseEnter={(event) => {
        event.stopPropagation();
        onHoverNode(element.id);
      }}
      onMouseLeave={(event) => {
        event.stopPropagation();
        onClearHover();
      }}
      onMouseMove={(event) => {
        event.stopPropagation();
        onHoverNode(element.id);
      }}
    >
      {showLabel && (
        <span
          className={cx(
            "absolute -top-3 left-2 z-20 max-w-[min(20rem,calc(100vw-3rem))] truncate rounded px-2 py-0.5 text-[11px] font-black",
            isSelected ? "bg-teal-400 text-zinc-950" : "bg-zinc-950/90 text-teal-200 ring-1 ring-teal-400/40",
          )}
        >
          {label}
        </span>
      )}
      <ElementPrimitive
        element={element}
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    </div>
  );
}
