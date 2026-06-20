"use client";

import type { SectionNode, Viewport } from "@/lib/design-schema";
import { getNodeDisplayName, getNodeTypeLabel, type SectionDropPlacement } from "@/lib/design-actions";
import { getSectionStyle } from "@/lib/responsive-design";
import { cx } from "@/lib/tailwind-utils";
import { sectionBackgroundStyle, shadowStyles } from "@/components/design-renderer/render-styles";
import { CTASection } from "@/components/design-renderer/sections/CTASection";
import { CustomSection } from "@/components/design-renderer/sections/CustomSection";
import { FeatureSection } from "@/components/design-renderer/sections/FeatureSection";
import { FooterSection } from "@/components/design-renderer/sections/FooterSection";
import { GallerySection } from "@/components/design-renderer/sections/GallerySection";
import { HeaderSection } from "@/components/design-renderer/sections/HeaderSection";
import { HeroSection } from "@/components/design-renderer/sections/HeroSection";
import { StatsSection } from "@/components/design-renderer/sections/StatsSection";

type RenderSectionProps = {
  section: SectionNode;
  viewport: Viewport;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onHoverNode: (nodeId: string) => void;
  onClearHover: () => void;
  onReorderSection?: (sectionId: string, targetSectionId: string, placement: SectionDropPlacement) => void;
  draggedSectionId?: string | null;
  dropTargetId?: string | null;
  dropPlacement?: SectionDropPlacement | null;
  onSectionDragStart?: (sectionId: string) => void;
  onSectionDragOver?: (sectionId: string, placement: SectionDropPlacement) => void;
  onSectionDragEnd?: () => void;
};

function getDropPlacement(element: HTMLElement, clientY: number): SectionDropPlacement {
  const rect = element.getBoundingClientRect();
  return clientY < rect.top + rect.height / 2 ? "before" : "after";
}

function DragHandleDots() {
  return (
    <span aria-hidden="true" className="grid grid-cols-2 gap-0.5">
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
    </span>
  );
}

function SectionContent({
  section,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
}: RenderSectionProps) {
  if (section.type === "header") {
    return (
      <HeaderSection
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        section={section}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    );
  }

  if (section.type === "hero") {
    return (
      <HeroSection
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        section={section}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    );
  }

  if (section.type === "features") {
    return (
      <FeatureSection
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        section={section}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    );
  }

  if (section.type === "gallery") {
    return (
      <GallerySection
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        section={section}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    );
  }

  if (section.type === "stats") {
    return (
      <StatsSection
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        section={section}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    );
  }

  if (section.type === "cta") {
    return (
      <CTASection
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        section={section}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    );
  }

  if (section.type === "footer") {
    return (
      <FooterSection
        hoveredNodeId={hoveredNodeId}
        onClearHover={onClearHover}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
        section={section}
        selectedNodeId={selectedNodeId}
        viewport={viewport}
      />
    );
  }

  return (
    <CustomSection
      hoveredNodeId={hoveredNodeId}
      onClearHover={onClearHover}
      onHoverNode={onHoverNode}
      onSelectNode={onSelectNode}
      section={section}
      selectedNodeId={selectedNodeId}
      viewport={viewport}
    />
  );
}

export function RenderSection({
  section,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
  onReorderSection,
  draggedSectionId,
  dropTargetId,
  dropPlacement,
  onSectionDragStart,
  onSectionDragOver,
  onSectionDragEnd,
}: RenderSectionProps) {
  const style = getSectionStyle(section, viewport);
  const isSelected = selectedNodeId === section.id;
  const isHovered = hoveredNodeId === section.id;
  const showLabel = isSelected || isHovered;
  const rounded = style.borderRadius > 0;
  const label = `${getNodeTypeLabel(section)}: ${getNodeDisplayName(section)}`;
  const isDragging = draggedSectionId === section.id;
  const isDropTarget = dropTargetId === section.id && draggedSectionId !== section.id;

  return (
    <section
      className={cx(
        "relative transition",
        rounded && "mx-4 my-5 overflow-hidden border",
        isSelected && "shadow-selected",
        !isSelected && isHovered && "outline outline-2 outline-teal-400/60",
        isDragging && "opacity-55",
      )}
      data-selectable-section="true"
      data-node-id={section.id}
      data-node-type={section.type}
      onDragOver={(event) => {
        if (!draggedSectionId || draggedSectionId === section.id) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onSectionDragOver?.(section.id, getDropPlacement(event.currentTarget, event.clientY));
      }}
      onDrop={(event) => {
        if (!draggedSectionId || draggedSectionId === section.id) return;
        event.preventDefault();
        event.stopPropagation();
        const sectionId = event.dataTransfer.getData("text/plain") || draggedSectionId;
        onReorderSection?.(sectionId, section.id, getDropPlacement(event.currentTarget, event.clientY));
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelectNode(section.id);
      }}
      onMouseEnter={() => onHoverNode(section.id)}
      onMouseLeave={onClearHover}
      onMouseMove={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-selectable-element='true']")) return;
        onHoverNode(section.id);
      }}
      style={{
        ...sectionBackgroundStyle(style),
        borderColor: rounded ? style.borderColor : undefined,
        borderRadius: rounded ? style.borderRadius : undefined,
        boxShadow: shadowStyles[style.shadow],
        paddingBottom: style.paddingBottom,
        paddingLeft: style.paddingX,
        paddingRight: style.paddingX,
        paddingTop: style.paddingTop,
      }}
    >
      {isDropTarget && dropPlacement && (
        <div
          className={cx(
            "pointer-events-none absolute left-0 right-0 z-30 h-1 bg-teal-300 shadow-[0_0_18px_rgba(45,212,191,0.9)]",
            dropPlacement === "before" ? "top-0" : "bottom-0",
          )}
        />
      )}
      {showLabel && (
        <span
          className={cx(
            "absolute left-4 top-3 z-20 max-w-[calc(100%-2rem)] truncate rounded px-2 py-0.5 text-[11px] font-black",
            isSelected ? "bg-teal-400 text-zinc-950" : "bg-zinc-950/90 text-teal-200 ring-1 ring-teal-400/40",
          )}
        >
          {label}
        </span>
      )}
      <button
        aria-label={`Drag ${section.name} section`}
        className={cx(
          "absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-950/10 bg-white/85 text-zinc-700 shadow-sm transition hover:bg-teal-100 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-400",
          isSelected || isHovered || isDragging ? "opacity-100" : "opacity-55",
        )}
        data-section-drag-handle="true"
        draggable
        onClick={(event) => event.stopPropagation()}
        onDragEnd={() => onSectionDragEnd?.()}
        onDragStart={(event) => {
          event.stopPropagation();
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", section.id);
          onSectionDragStart?.(section.id);
        }}
        title="Drag section"
        type="button"
      >
        <DragHandleDots />
      </button>
      <div style={{ margin: "0 auto", maxWidth: style.maxWidth }}>
        <SectionContent
          hoveredNodeId={hoveredNodeId}
          onClearHover={onClearHover}
          onHoverNode={onHoverNode}
          onSelectNode={onSelectNode}
          section={section}
          selectedNodeId={selectedNodeId}
          viewport={viewport}
        />
      </div>
    </section>
  );
}
