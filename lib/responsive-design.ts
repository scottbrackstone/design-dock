import type {
  ButtonElement,
  ButtonResponsiveOverride,
  ButtonStyle,
  CardElement,
  CardResponsiveOverride,
  CardStyle,
  ElementNode,
  ImageElement,
  ImageResponsiveOverride,
  ImageStyle,
  SectionButtonLayout,
  SectionImagePosition,
  SectionLayout,
  SectionNode,
  SectionResponsiveOverride,
  SectionStyle,
  StatElement,
  StatResponsiveOverride,
  StatStyle,
  TextElement,
  TextResponsiveOverride,
  TextStyle,
  Viewport,
} from "@/lib/design-schema";

export const viewportLabels: Record<Viewport, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

export const compactViewportLabels: Record<Viewport, string> = {
  desktop: "Desktop base",
  tablet: "Tablet override",
  mobile: "Mobile override",
};

export const responsiveViewports: Viewport[] = ["tablet", "mobile"];

export function isBreakpointOverride(viewport: Viewport) {
  return viewport !== "desktop";
}

export function getSectionBreakpoint(section: SectionNode, viewport: Viewport): SectionResponsiveOverride | undefined {
  return section.responsive?.[viewport];
}

export function getTextBreakpoint(element: TextElement, viewport: Viewport): TextResponsiveOverride | undefined {
  return element.responsive?.[viewport];
}

export function getButtonBreakpoint(element: ButtonElement, viewport: Viewport): ButtonResponsiveOverride | undefined {
  return element.responsive?.[viewport];
}

export function getCardBreakpoint(element: CardElement, viewport: Viewport): CardResponsiveOverride | undefined {
  return element.responsive?.[viewport];
}

export function getImageBreakpoint(element: ImageElement, viewport: Viewport): ImageResponsiveOverride | undefined {
  return element.responsive?.[viewport];
}

export function getStatBreakpoint(element: StatElement, viewport: Viewport): StatResponsiveOverride | undefined {
  return element.responsive?.[viewport];
}

export function getSectionStyle(section: SectionNode, viewport: Viewport): SectionStyle {
  return {
    ...section.style,
    ...getSectionBreakpoint(section, viewport)?.style,
  };
}

export function getSectionLayout(section: SectionNode, viewport: Viewport): SectionLayout {
  return getSectionBreakpoint(section, viewport)?.layout ?? section.layout;
}

export function getSectionColumns(section: SectionNode, viewport: Viewport): number {
  const override = getSectionBreakpoint(section, viewport)?.columns;
  if (override) return override;
  const layout = getSectionLayout(section, viewport);

  if (layout === "grid" || layout === "cards" || layout === "footer-columns") {
    if (viewport === "mobile") return 1;
    if (viewport === "tablet") return 2;
    return 3;
  }

  if (section.type === "features" || section.type === "gallery" || section.type === "stats") {
    if (viewport === "mobile") return 1;
    if (viewport === "tablet") return 2;
    return 3;
  }

  return 1;
}

export function getSectionButtonLayout(section: SectionNode, viewport: Viewport): SectionButtonLayout {
  return getSectionBreakpoint(section, viewport)?.buttonLayout ?? (viewport === "mobile" ? "stack" : "inline");
}

export function getSectionImagePosition(section: SectionNode, viewport: Viewport): SectionImagePosition {
  return getSectionBreakpoint(section, viewport)?.imagePosition ?? (viewport === "mobile" ? "top" : "right");
}

export function getTextStyle(element: TextElement, viewport: Viewport): TextStyle {
  return {
    ...element.style,
    ...getTextBreakpoint(element, viewport)?.style,
  };
}

export function getButtonStyle(element: ButtonElement, viewport: Viewport): ButtonStyle {
  return {
    ...element.style,
    ...getButtonBreakpoint(element, viewport)?.style,
  };
}

export function getButtonFullWidth(element: ButtonElement, viewport: Viewport) {
  return getButtonBreakpoint(element, viewport)?.fullWidth ?? false;
}

export function getCardStyle(element: CardElement, viewport: Viewport): CardStyle {
  return {
    ...element.style,
    ...getCardBreakpoint(element, viewport)?.style,
  };
}

export function getImageStyle(element: ImageElement, viewport: Viewport): ImageStyle {
  return {
    ...element.style,
    ...getImageBreakpoint(element, viewport)?.style,
  };
}

export function getStatStyle(element: StatElement, viewport: Viewport): StatStyle {
  return {
    ...element.style,
    ...getStatBreakpoint(element, viewport)?.style,
  };
}

export function getElementStyle(element: ElementNode, viewport: Viewport) {
  if (element.type === "text") return getTextStyle(element, viewport);
  if (element.type === "button") return getButtonStyle(element, viewport);
  if (element.type === "card") return getCardStyle(element, viewport);
  if (element.type === "image") return getImageStyle(element, viewport);
  return getStatStyle(element, viewport);
}

export function hasSectionBreakpointOverride(section: SectionNode, viewport: Viewport) {
  return Boolean(section.responsive?.[viewport]);
}

export function hasElementBreakpointOverride(element: ElementNode, viewport: Viewport) {
  return Boolean(element.responsive?.[viewport]);
}
