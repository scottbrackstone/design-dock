import { RenderElement } from "@/components/design-renderer/RenderElement";
import type { SectionRendererProps } from "@/components/design-renderer/sections/section-types";
import { getSectionLayout, getSectionStyle } from "@/lib/responsive-design";
import { cx } from "@/lib/tailwind-utils";

export function FooterSection({
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
  const stacked = viewport === "mobile" || layout === "stack" || layout === "footer-columns";

  return (
    <div
      className={cx("flex", stacked ? "flex-col" : "flex-row items-center justify-between")}
      style={{ gap: Math.max(style.gap * 0.45, 16), textAlign: style.align }}
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
