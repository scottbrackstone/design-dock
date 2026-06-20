import type { CSSProperties } from "react";
import type { SectionStyle, ShadowLevel } from "@/lib/design-schema";

export const shadowStyles: Record<ShadowLevel, string> = {
  none: "none",
  sm: "0 8px 24px rgba(24, 24, 27, 0.08)",
  md: "0 18px 42px rgba(24, 24, 27, 0.12)",
  lg: "0 26px 60px rgba(24, 24, 27, 0.16)",
  xl: "0 34px 80px rgba(24, 24, 27, 0.22)",
};

export function sectionBackgroundStyle(style: SectionStyle): CSSProperties {
  if (style.backgroundType === "gradient") {
    return {
      background: `linear-gradient(135deg, ${style.gradientFrom ?? "#ffffff"}, ${style.gradientTo ?? "#ccfbf1"})`,
    };
  }

  if (style.backgroundType === "transparent") {
    return { backgroundColor: "transparent" };
  }

  return { backgroundColor: style.backgroundColor ?? "transparent" };
}
