import { RenderElement } from "@/components/design-renderer/RenderElement";
import type { SectionRendererProps } from "@/components/design-renderer/sections/section-types";
import { getSectionColumns, getSectionStyle } from "@/lib/responsive-design";

export function StatsSection({
  section,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
}: SectionRendererProps) {
  const style = getSectionStyle(section, viewport);
  const columns = getSectionColumns(section, viewport);

  return (
    <div
      className="grid"
      style={{
        gap: Math.max(style.gap * 0.55, 18),
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {section.elements.map((element) => (
        <RenderElement
          className="rounded-lg bg-white/10 p-5"
          element={element}
          hoveredNodeId={hoveredNodeId}
          key={element.id}
          onClearHover={onClearHover}
          onHoverNode={onHoverNode}
          onSelectNode={onSelectNode}
          selectedNodeId={selectedNodeId}
          viewport={viewport}
        />
      ))}
    </div>
  );
}
