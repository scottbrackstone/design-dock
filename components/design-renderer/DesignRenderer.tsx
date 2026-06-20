"use client";

import { useState } from "react";
import type { DesignSpec } from "@/lib/design-schema";
import type { SectionDropPlacement } from "@/lib/design-actions";
import { RenderSection } from "@/components/design-renderer/RenderSection";

type DesignRendererProps = {
  spec: DesignSpec;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onHoverNode: (nodeId: string) => void;
  onClearHover: () => void;
  onReorderSection: (sectionId: string, targetSectionId: string, placement: SectionDropPlacement) => void;
};

export function DesignRenderer({
  spec,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
  onReorderSection,
}: DesignRendererProps) {
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    sectionId: string;
    placement: SectionDropPlacement;
  } | null>(null);

  const clearSectionDrag = () => {
    setDraggedSectionId(null);
    setDropTarget(null);
  };

  return (
    <main
      data-node-id={spec.page.id}
      data-node-type="page"
      style={{
        backgroundColor: spec.page.style.backgroundColor,
        color: spec.page.style.textColor,
        fontFamily: `${spec.page.style.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
        margin: "0 auto",
        maxWidth: spec.page.style.maxWidth,
        minHeight: "100%",
      }}
    >
      {spec.page.sections.map((section) => (
        <RenderSection
          hoveredNodeId={hoveredNodeId}
          key={section.id}
          onClearHover={onClearHover}
          onHoverNode={onHoverNode}
          onReorderSection={(sectionId, targetSectionId, placement) => {
            onReorderSection(sectionId, targetSectionId, placement);
            clearSectionDrag();
          }}
          onSelectNode={onSelectNode}
          onSectionDragEnd={clearSectionDrag}
          onSectionDragOver={(sectionId, placement) => {
            if (!draggedSectionId || draggedSectionId === sectionId) {
              setDropTarget(null);
              return;
            }
            setDropTarget({ sectionId, placement });
          }}
          onSectionDragStart={(sectionId) => {
            setDraggedSectionId(sectionId);
            setDropTarget(null);
          }}
          section={section}
          selectedNodeId={selectedNodeId}
          draggedSectionId={draggedSectionId}
          dropPlacement={dropTarget?.placement ?? null}
          dropTargetId={dropTarget?.sectionId ?? null}
          viewport={spec.viewport}
        />
      ))}
    </main>
  );
}
