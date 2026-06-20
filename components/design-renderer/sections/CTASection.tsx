import { RenderElement } from "@/components/design-renderer/RenderElement";
import type { SectionRendererProps } from "@/components/design-renderer/sections/section-types";
import { getSectionButtonLayout, getSectionStyle } from "@/lib/responsive-design";

export function CTASection({
  section,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
}: SectionRendererProps) {
  const style = getSectionStyle(section, viewport);
  const buttonLayout = getSectionButtonLayout(section, viewport);

  return (
    <div
      className="mx-auto flex max-w-3xl flex-col items-center"
      style={{ gap: Math.max(style.gap * 0.55, 16), textAlign: style.align }}
    >
      {section.elements.map((element) => (
        <RenderElement
          className={element.type === "button" && buttonLayout === "stack" ? "w-full [&>a]:w-full" : "mx-auto"}
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
