import { RenderElement } from "@/components/design-renderer/RenderElement";
import type { SectionRendererProps } from "@/components/design-renderer/sections/section-types";
import {
  getSectionButtonLayout,
  getSectionImagePosition,
  getSectionLayout,
  getSectionStyle,
} from "@/lib/responsive-design";
import { cx } from "@/lib/tailwind-utils";

export function HeroSection({
  section,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
}: SectionRendererProps) {
  const imageElements = section.elements.filter((element) => element.type === "image");
  const buttonElements = section.elements.filter((element) => element.type === "button");
  const textElements = section.elements.filter((element) => element.type === "text");
  const style = getSectionStyle(section, viewport);
  const layout = getSectionLayout(section, viewport);
  const imagePosition = getSectionImagePosition(section, viewport);
  const buttonLayout = getSectionButtonLayout(section, viewport);
  const useSplit = layout === "split" && viewport !== "mobile" && (imagePosition === "left" || imagePosition === "right");
  const imagesFirst = imagePosition === "left" || imagePosition === "top";
  const buttonsStacked = buttonLayout === "stack";
  const textAlign = style.align;
  const copy = (
    <div className={cx("flex flex-col", textAlign === "center" && "items-center")} style={{ gap: Math.max(style.gap * 0.45, 16) }}>
      {textElements.map((element) => (
        <RenderElement
          className={textAlign === "center" ? "mx-auto" : undefined}
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
      <div className={cx("flex gap-3 pt-2", buttonsStacked ? "w-full flex-col items-stretch" : "flex-wrap")}>
        {buttonElements.map((element) => (
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
  const media = (
    <div className="grid" style={{ gap: Math.max(style.gap * 0.35, 14) }}>
      {imageElements.map((element) => (
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

  return (
    <div
      className="grid items-center"
      style={{
        gap: style.gap,
        gridTemplateColumns: useSplit
          ? imagePosition === "left"
            ? "0.95fr 1.05fr"
            : "1.05fr 0.95fr"
          : "1fr",
        textAlign,
      }}
    >
      {imagesFirst && media}
      {copy}
      {!imagesFirst && media}
    </div>
  );
}
