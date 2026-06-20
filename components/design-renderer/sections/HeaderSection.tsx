import { RenderElement } from "@/components/design-renderer/RenderElement";
import type { SectionRendererProps } from "@/components/design-renderer/sections/section-types";
import { getSectionButtonLayout, getSectionLayout, getSectionStyle } from "@/lib/responsive-design";
import { cx } from "@/lib/tailwind-utils";

export function HeaderSection({
  section,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
}: SectionRendererProps) {
  const texts = section.elements.filter((element) => element.type === "text");
  const buttons = section.elements.filter((element) => element.type === "button");
  const style = getSectionStyle(section, viewport);
  const layout = getSectionLayout(section, viewport);
  const buttonLayout = getSectionButtonLayout(section, viewport);
  const stacked = viewport === "mobile" || layout === "stack";
  const buttonsStacked = buttonLayout === "stack";

  return (
    <div
      className={cx("flex", stacked ? "flex-col" : "flex-row items-center justify-between")}
      style={{ gap: Math.max(style.gap * 0.5, 16), textAlign: style.align }}
    >
      <div
        className={cx("flex", stacked ? "flex-col" : "flex-row items-center")}
        style={{ gap: stacked ? 8 : Math.max(style.gap, 24) }}
      >
        {texts.map((element) => (
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
      <div className={cx("flex gap-3", buttonsStacked ? "flex-col items-stretch" : "flex-wrap")}>
        {buttons.map((element) => (
          <RenderElement
            className={buttonsStacked ? "w-full [&>a]:w-full" : undefined}
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
