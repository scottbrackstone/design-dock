import { RenderElement } from "@/components/design-renderer/RenderElement";
import type { SectionRendererProps } from "@/components/design-renderer/sections/section-types";
import { getSectionColumns, getSectionStyle } from "@/lib/responsive-design";

export function GallerySection({
  section,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
}: SectionRendererProps) {
  const headings = section.elements.filter((element) => element.type === "text");
  const images = section.elements.filter((element) => element.type === "image");
  const cards = section.elements.filter((element) => element.type === "card");
  const style = getSectionStyle(section, viewport);
  const columns = getSectionColumns(section, viewport);

  return (
    <div className="flex flex-col" style={{ gap: Math.max(style.gap, 20), textAlign: style.align }}>
      <div className="mx-auto flex max-w-3xl flex-col items-center" style={{ gap: Math.max(style.gap * 0.4, 12) }}>
        {headings.map((element) => (
          <RenderElement
            className="mx-auto"
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
      <div
        className="grid"
        style={{
          gap: Math.max(style.gap * 0.55, 18),
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {[...images, ...cards].map((element) => (
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
    </div>
  );
}
