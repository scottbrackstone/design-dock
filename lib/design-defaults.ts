import type {
  ButtonStyle,
  CardStyle,
  DesignSystemSnapshot,
  ImageStyle,
  PageStyle,
  SectionStyle,
  StatStyle,
  TextRole,
  TextStyle,
} from "@/lib/design-schema";
import { defaultDesignSystem, getReadableTextColor } from "@/lib/design-systems";

export { defaultDesignSystem };

export function createPageStyle(
  _theme: "light" | "dark",
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): PageStyle {
  return {
    backgroundColor: designSystem.tokens.colors.background,
    textColor: designSystem.tokens.colors.foreground,
    fontFamily: designSystem.tokens.typography.bodyFont,
    maxWidth: 1440,
  };
}

export function createSectionStyle(
  overrides: Partial<SectionStyle> = {},
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): SectionStyle {
  return {
    backgroundType: "transparent",
    backgroundColor: designSystem.tokens.colors.card,
    paddingTop: 88,
    paddingBottom: 88,
    paddingX: 28,
    gap: 28,
    maxWidth: 1180,
    borderRadius: 0,
    shadow: "none",
    borderColor: designSystem.tokens.colors.border,
    align: "left",
    ...overrides,
  };
}

export function createTextStyle(
  role: TextRole,
  overrides: Partial<TextStyle> = {},
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): TextStyle {
  const roleDefaults: Record<TextRole, Pick<TextStyle, "fontSize" | "fontWeight" | "lineHeight">> = {
    eyebrow: { fontSize: 13, fontWeight: 800, lineHeight: 1.3 },
    heading: { fontSize: 56, fontWeight: 850, lineHeight: 1.04 },
    subheading: { fontSize: 22, fontWeight: 520, lineHeight: 1.45 },
    body: { fontSize: 16, fontWeight: 450, lineHeight: 1.65 },
    caption: { fontSize: 13, fontWeight: 500, lineHeight: 1.45 },
  };

  return {
    fontFamily:
      role === "heading" || role === "eyebrow" || role === "subheading"
        ? designSystem.tokens.typography.headingFont
        : designSystem.tokens.typography.bodyFont,
    fontSize: roleDefaults[role].fontSize,
    fontWeight: roleDefaults[role].fontWeight,
    lineHeight: roleDefaults[role].lineHeight,
    letterSpacing: 0,
    color: role === "eyebrow" ? designSystem.tokens.colors.primary : designSystem.tokens.colors.foreground,
    align: "left",
    maxWidth: role === "heading" ? 820 : 720,
    ...overrides,
  };
}

export function createButtonStyle(
  overrides: Partial<ButtonStyle> = {},
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): ButtonStyle {
  return {
    backgroundColor: designSystem.tokens.colors.primary,
    textColor: getReadableTextColor(designSystem.tokens.colors.primary),
    borderColor: designSystem.tokens.colors.primary,
    radius: designSystem.tokens.radius.full,
    paddingX: 22,
    paddingY: 12,
    fontSize: 15,
    fontWeight: 750,
    ...overrides,
  };
}

export function createCardStyle(
  overrides: Partial<CardStyle> = {},
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): CardStyle {
  return {
    backgroundColor: designSystem.tokens.colors.card,
    borderColor: designSystem.tokens.colors.border,
    radius: designSystem.tokens.radius.lg,
    shadow: "sm",
    padding: 24,
    minHeight: 180,
    ...overrides,
  };
}

export function createImageStyle(
  overrides: Partial<ImageStyle> = {},
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): ImageStyle {
  return {
    backgroundColor: designSystem.tokens.colors.border,
    radius: designSystem.tokens.radius.lg,
    aspectRatio: "video",
    ...overrides,
  };
}

export function createStatStyle(
  overrides: Partial<StatStyle> = {},
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): StatStyle {
  return {
    color: designSystem.tokens.colors.foreground,
    labelColor: designSystem.tokens.colors.muted,
    align: "center",
    ...overrides,
  };
}
