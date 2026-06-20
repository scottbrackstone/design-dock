import { RenderElement } from "@/components/design-renderer/RenderElement";
import type { SectionRendererProps } from "@/components/design-renderer/sections/section-types";
import { getSectionColumns, getSectionLayout, getSectionStyle } from "@/lib/responsive-design";

export function CustomSection({
  section,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
}: SectionRendererProps) {
  const style = getSectionStyle(section, viewport);
  const layout = getSectionLayout(section, viewport);
  const columns = layout === "grid" || layout === "cards" ? getSectionColumns(section, viewport) : 1;

  return (
    <div
      className="grid"
      style={{
        gap: Math.max(style.gap * 0.55, 16),
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        textAlign: style.align,
      }}
    >
      {section.elements.map((element) => (
        <RenderElement
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
