import type { TextElement, Viewport } from "@/lib/design-schema";
import { getTextStyle } from "@/lib/responsive-design";

export function TextBlock({ element, viewport }: { element: TextElement; viewport: Viewport }) {
  const Tag = element.role === "heading" ? "h2" : "p";
  const style = getTextStyle(element, viewport);

  return (
    <Tag
      style={{
        color: style.color,
        fontFamily: `${style.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        maxWidth: style.maxWidth,
        textAlign: style.align,
      }}
    >
      {element.content}
    </Tag>
  );
}
