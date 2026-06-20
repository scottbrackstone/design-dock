import type { ButtonElement, Viewport } from "@/lib/design-schema";
import { getButtonFullWidth, getButtonStyle } from "@/lib/responsive-design";
import { cx } from "@/lib/tailwind-utils";

export function ButtonBlock({ element, viewport }: { element: ButtonElement; viewport: Viewport }) {
  const style = getButtonStyle(element, viewport);
  const fullWidth = getButtonFullWidth(element, viewport);

  return (
    <a
      className={cx("inline-flex items-center justify-center border transition hover:brightness-105", fullWidth && "w-full")}
      href={element.href ?? "#"}
      onClick={(event) => event.preventDefault()}
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor ?? style.backgroundColor,
        borderRadius: style.radius,
        color: style.textColor,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        padding: `${style.paddingY}px ${style.paddingX}px`,
      }}
    >
      {element.label}
    </a>
  );
}
