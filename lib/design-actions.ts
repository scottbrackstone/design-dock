import type {
  ButtonElement,
  ButtonResponsiveOverride,
  ButtonStyle,
  CardElement,
  CardResponsiveOverride,
  CardStyle,
  DesignNode,
  DesignSpec,
  ElementNode,
  ImageElement,
  ImageResponsiveOverride,
  ImageStyle,
  PageNode,
  PageStyle,
  ResponsiveOverrides,
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
  Theme,
  Viewport,
} from "@/lib/design-schema";
import { createId } from "@/lib/ids";
import { getCardStyle, getImageStyle, getSectionColumns } from "@/lib/responsive-design";

export type NodeLookup = {
  node: PageNode;
  kind: "page";
} | {
  node: SectionNode;
  kind: "section";
} | {
  node: ElementNode;
  kind: "element";
  parentSection: SectionNode;
  parentElement?: ElementNode;
};

export type SectionDropPlacement = "before" | "after";
export type CanvasResizePatch = {
  width?: number;
  minHeight?: number;
};
export type CanvasNudgeDirection = "left" | "right" | "up" | "down";

const CARD_SIZE_LIMITS = {
  minWidth: 180,
  maxWidth: 900,
  minHeight: 80,
  maxHeight: 900,
};

const IMAGE_SIZE_LIMITS = {
  minWidth: 120,
  maxWidth: 1200,
  minHeight: 80,
  maxHeight: 900,
};

const COMMON_WIDTHS = [240, 320, 360, 420, 480, 560, 640, 720, 840, 960, 1100];
const COMMON_HEIGHTS = [120, 160, 200, 240, 280, 320, 360, 420, 480, 560, 640];
const SNAP_DISTANCE = 10;

function cloneSpec(spec: DesignSpec): DesignSpec {
  return structuredClone(spec);
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.round(value), min), max);
}

function snapToCommonValue(value: number, commonValues: number[]) {
  const rounded = Math.round(value);
  const match = commonValues.find((commonValue) => Math.abs(commonValue - rounded) <= SNAP_DISTANCE);
  return match ?? rounded;
}

function snapWidth(value: number, min: number, max: number) {
  return clamp(snapToCommonValue(value, COMMON_WIDTHS), min, max);
}

function snapHeight(value: number, min: number, max: number) {
  return clamp(snapToCommonValue(value, COMMON_HEIGHTS), min, max);
}

function cloneElementWithNewIds(element: ElementNode): ElementNode {
  if (element.type === "card") {
    return {
      ...element,
      id: createId("card"),
      image: element.image ? { ...element.image, id: createId("image") } : undefined,
    };
  }

  return { ...element, id: createId(element.type) } as ElementNode;
}

function cloneSectionWithNewIds(section: SectionNode): SectionNode {
  return {
    ...section,
    id: createId("section"),
    name: `${section.name} copy`,
    elements: section.elements.map(cloneElementWithNewIds),
  };
}

function updateElement(element: ElementNode, nodeId: string, updater: (element: ElementNode) => ElementNode): ElementNode {
  if (element.id === nodeId) {
    return updater(element);
  }

  if (element.type === "card" && element.image?.id === nodeId) {
    return {
      ...element,
      image: updater(element.image) as ImageElement,
    };
  }

  return element;
}

function mergeResponsiveOverride<T>(
  responsive: ResponsiveOverrides<T> | undefined,
  viewport: Viewport,
  patch: T,
): ResponsiveOverrides<T> {
  return {
    ...responsive,
    [viewport]: {
      ...(responsive?.[viewport] ?? {}),
      ...patch,
    },
  };
}

function removeResponsiveOverride<T>(
  responsive: ResponsiveOverrides<T> | undefined,
  viewport: Viewport,
): ResponsiveOverrides<T> | undefined {
  if (!responsive?.[viewport]) return responsive;
  const next = { ...responsive };
  delete next[viewport];
  return Object.keys(next).length > 0 ? next : undefined;
}

function withSectionResponsive(
  section: SectionNode,
  viewport: Viewport,
  patch: SectionResponsiveOverride,
): SectionNode {
  return {
    ...section,
    responsive: mergeResponsiveOverride(section.responsive, viewport, {
      ...patch,
      style: patch.style
        ? {
            ...(section.responsive?.[viewport]?.style ?? {}),
            ...patch.style,
          }
        : section.responsive?.[viewport]?.style,
    }),
  };
}

function mergeBreakpointStyle<TOverride extends { style?: object }>(
  current: TOverride | undefined,
  patch: TOverride,
): TOverride {
  return {
    ...current,
    ...patch,
    style: patch.style
      ? {
          ...(current?.style ?? {}),
          ...patch.style,
        }
      : current?.style,
  } as TOverride;
}

function withTextResponsive(element: TextElement, viewport: Viewport, patch: TextResponsiveOverride): TextElement {
  return {
    ...element,
    responsive: mergeResponsiveOverride(
      element.responsive,
      viewport,
      mergeBreakpointStyle(element.responsive?.[viewport], patch),
    ),
  };
}

function withButtonResponsive(
  element: ButtonElement,
  viewport: Viewport,
  patch: ButtonResponsiveOverride,
): ButtonElement {
  return {
    ...element,
    responsive: mergeResponsiveOverride(
      element.responsive,
      viewport,
      mergeBreakpointStyle(element.responsive?.[viewport], patch),
    ),
  };
}

function withCardResponsive(element: CardElement, viewport: Viewport, patch: CardResponsiveOverride): CardElement {
  return {
    ...element,
    responsive: mergeResponsiveOverride(
      element.responsive,
      viewport,
      mergeBreakpointStyle(element.responsive?.[viewport], patch),
    ),
  };
}

function withImageResponsive(element: ImageElement, viewport: Viewport, patch: ImageResponsiveOverride): ImageElement {
  return {
    ...element,
    responsive: mergeResponsiveOverride(
      element.responsive,
      viewport,
      mergeBreakpointStyle(element.responsive?.[viewport], patch),
    ),
  };
}

function withStatResponsive(element: StatElement, viewport: Viewport, patch: StatResponsiveOverride): StatElement {
  return {
    ...element,
    responsive: mergeResponsiveOverride(
      element.responsive,
      viewport,
      mergeBreakpointStyle(element.responsive?.[viewport], patch),
    ),
  };
}

function mapElements(elements: ElementNode[], mapper: (element: ElementNode) => ElementNode): ElementNode[] {
  return elements.map((element) => {
    const nextElement = mapper(element);

    if (nextElement.type === "card" && nextElement.image) {
      return {
        ...nextElement,
        image: mapper(nextElement.image) as ImageElement,
      };
    }

    return nextElement;
  });
}

function updateSectionNode(spec: DesignSpec, sectionId: string, updater: (section: SectionNode) => SectionNode) {
  const next = cloneSpec(spec);
  next.page.sections = next.page.sections.map((section) => (section.id === sectionId ? updater(section) : section));
  return next;
}

export function findNodeById(spec: DesignSpec, nodeId: string | null): NodeLookup | null {
  if (!nodeId) return null;
  if (spec.page.id === nodeId) return { node: spec.page, kind: "page" };

  for (const section of spec.page.sections) {
    if (section.id === nodeId) {
      return { node: section, kind: "section" };
    }

    for (const element of section.elements) {
      if (element.id === nodeId) {
        return { node: element, kind: "element", parentSection: section };
      }

      if (element.type === "card" && element.image?.id === nodeId) {
        return { node: element.image, kind: "element", parentSection: section, parentElement: element };
      }
    }
  }

  return null;
}

export function getNodeTypeLabel(node: DesignNode) {
  if (node.type === "page") return "Page";
  if ("elements" in node) return `${node.type.charAt(0).toUpperCase()}${node.type.slice(1)} section`;
  return `${node.type.charAt(0).toUpperCase()}${node.type.slice(1)}`;
}

export function getNodeDisplayName(node: DesignNode) {
  if (node.type === "page") return node.name;
  if ("name" in node) return node.name;
  if (node.type === "text") return node.content || node.role;
  if (node.type === "button") return node.label;
  if (node.type === "card") return node.title;
  if (node.type === "image") return node.label ?? node.alt;
  return `${node.value} ${node.label}`;
}

export function getNodeLabel(spec: DesignSpec, nodeId: string | null) {
  const lookup = findNodeById(spec, nodeId);
  const node = lookup?.node ?? spec.page;

  return `${getNodeTypeLabel(node)}: ${getNodeDisplayName(node)}`;
}

export type NodeBreadcrumbItem = {
  id: string | null;
  label: string;
  type: string;
};

export function getNodeBreadcrumb(spec: DesignSpec, nodeId: string | null): NodeBreadcrumbItem[] {
  const pageCrumb: NodeBreadcrumbItem = {
    id: null,
    label: spec.page.name,
    type: "Page",
  };
  const lookup = findNodeById(spec, nodeId);

  if (!lookup || lookup.kind === "page") {
    return [pageCrumb];
  }

  if (lookup.kind === "section") {
    return [
      pageCrumb,
      {
        id: lookup.node.id,
        label: lookup.node.name,
        type: getNodeTypeLabel(lookup.node),
      },
    ];
  }

  const crumbs: NodeBreadcrumbItem[] = [
    pageCrumb,
    {
      id: lookup.parentSection.id,
      label: lookup.parentSection.name,
      type: getNodeTypeLabel(lookup.parentSection),
    },
  ];

  if (lookup.parentElement) {
    crumbs.push({
      id: lookup.parentElement.id,
      label: getNodeDisplayName(lookup.parentElement),
      type: getNodeTypeLabel(lookup.parentElement),
    });
  }

  crumbs.push({
    id: lookup.node.id,
    label: getNodeDisplayName(lookup.node),
    type: getNodeTypeLabel(lookup.node),
  });

  return crumbs;
}

export function updateTheme(spec: DesignSpec, theme: Theme): DesignSpec {
  const next = cloneSpec(spec);
  next.theme = theme;
  next.page.style.backgroundColor = theme === "dark" ? "#111111" : "#f8fafc";
  next.page.style.textColor = theme === "dark" ? "#f8fafc" : "#111827";
  return next;
}

export function updatePageStyle(spec: DesignSpec, patch: Partial<PageStyle>): DesignSpec {
  const next = cloneSpec(spec);
  next.page.style = { ...next.page.style, ...patch };
  return next;
}

export function updateSectionStyle(spec: DesignSpec, sectionId: string, patch: Partial<SectionStyle>): DesignSpec {
  const next = cloneSpec(spec);
  next.page.sections = next.page.sections.map((section) =>
    section.id === sectionId ? { ...section, style: { ...section.style, ...patch } } : section,
  );
  return next;
}

export function updateSectionLayout(spec: DesignSpec, sectionId: string, layout: SectionLayout): DesignSpec {
  const next = cloneSpec(spec);
  next.page.sections = next.page.sections.map((section) =>
    section.id === sectionId ? { ...section, layout } : section,
  );
  return next;
}

export function updateResponsiveSectionStyle(
  spec: DesignSpec,
  sectionId: string,
  viewport: Viewport,
  patch: Partial<SectionStyle>,
): DesignSpec {
  if (viewport === "desktop") {
    return updateSectionStyle(spec, sectionId, patch);
  }

  return updateSectionNode(spec, sectionId, (section) => withSectionResponsive(section, viewport, { style: patch }));
}

export function updateResponsiveSectionLayout(
  spec: DesignSpec,
  sectionId: string,
  viewport: Viewport,
  layout: SectionLayout,
): DesignSpec {
  if (viewport === "desktop") {
    return updateSectionLayout(spec, sectionId, layout);
  }

  return updateSectionNode(spec, sectionId, (section) => withSectionResponsive(section, viewport, { layout }));
}

export function updateResponsiveSectionColumns(
  spec: DesignSpec,
  sectionId: string,
  viewport: Viewport,
  columns: number,
): DesignSpec {
  return updateSectionNode(spec, sectionId, (section) =>
    withSectionResponsive(section, viewport, {
      columns: Math.min(Math.max(Math.round(columns), 1), 4),
    }),
  );
}

export function updateResponsiveSectionButtonLayout(
  spec: DesignSpec,
  sectionId: string,
  viewport: Viewport,
  buttonLayout: SectionButtonLayout,
): DesignSpec {
  return updateSectionNode(spec, sectionId, (section) =>
    withSectionResponsive(section, viewport, { buttonLayout }),
  );
}

export function updateResponsiveSectionImagePosition(
  spec: DesignSpec,
  sectionId: string,
  viewport: Viewport,
  imagePosition: SectionImagePosition,
): DesignSpec {
  return updateSectionNode(spec, sectionId, (section) =>
    withSectionResponsive(section, viewport, { imagePosition }),
  );
}

export function updateTextElement(spec: DesignSpec, nodeId: string, patch: Partial<Omit<TextElement, "id" | "type">>): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "text" ? { ...element, ...patch } : element,
  );
}

export function updateTextStyle(spec: DesignSpec, nodeId: string, patch: Partial<TextStyle>): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "text" ? { ...element, style: { ...element.style, ...patch } } : element,
  );
}

export function updateResponsiveTextStyle(
  spec: DesignSpec,
  nodeId: string,
  viewport: Viewport,
  patch: Partial<TextStyle>,
): DesignSpec {
  if (viewport === "desktop") {
    return updateTextStyle(spec, nodeId, patch);
  }

  return updateElementNode(spec, nodeId, (element) =>
    element.type === "text" ? withTextResponsive(element, viewport, { style: patch }) : element,
  );
}

export function updateButtonElement(
  spec: DesignSpec,
  nodeId: string,
  patch: Partial<Omit<ButtonElement, "id" | "type" | "style">>,
): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "button" ? { ...element, ...patch } : element,
  );
}

export function updateButtonStyle(spec: DesignSpec, nodeId: string, patch: Partial<ButtonStyle>): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "button" ? { ...element, style: { ...element.style, ...patch } } : element,
  );
}

export function updateResponsiveButtonStyle(
  spec: DesignSpec,
  nodeId: string,
  viewport: Viewport,
  patch: Partial<ButtonStyle>,
): DesignSpec {
  if (viewport === "desktop") {
    return updateButtonStyle(spec, nodeId, patch);
  }

  return updateElementNode(spec, nodeId, (element) =>
    element.type === "button" ? withButtonResponsive(element, viewport, { style: patch }) : element,
  );
}

export function updateResponsiveButtonFullWidth(
  spec: DesignSpec,
  nodeId: string,
  viewport: Viewport,
  fullWidth: boolean,
): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "button" ? withButtonResponsive(element, viewport, { fullWidth }) : element,
  );
}

export function updateCardElement(
  spec: DesignSpec,
  nodeId: string,
  patch: Partial<Omit<CardElement, "id" | "type" | "style">>,
): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "card" ? { ...element, ...patch } : element,
  );
}

export function updateCardStyle(spec: DesignSpec, nodeId: string, patch: Partial<CardStyle>): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "card" ? { ...element, style: { ...element.style, ...patch } } : element,
  );
}

export function updateResponsiveCardStyle(
  spec: DesignSpec,
  nodeId: string,
  viewport: Viewport,
  patch: Partial<CardStyle>,
): DesignSpec {
  if (viewport === "desktop") {
    return updateCardStyle(spec, nodeId, patch);
  }

  return updateElementNode(spec, nodeId, (element) =>
    element.type === "card" ? withCardResponsive(element, viewport, { style: patch }) : element,
  );
}

export function updateStatElement(
  spec: DesignSpec,
  nodeId: string,
  patch: Partial<Omit<StatElement, "id" | "type" | "style">>,
): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "stat" ? { ...element, ...patch } : element,
  );
}

export function updateStatStyle(spec: DesignSpec, nodeId: string, patch: Partial<StatStyle>): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "stat" ? { ...element, style: { ...element.style, ...patch } } : element,
  );
}

export function updateResponsiveStatStyle(
  spec: DesignSpec,
  nodeId: string,
  viewport: Viewport,
  patch: Partial<StatStyle>,
): DesignSpec {
  if (viewport === "desktop") {
    return updateStatStyle(spec, nodeId, patch);
  }

  return updateElementNode(spec, nodeId, (element) =>
    element.type === "stat" ? withStatResponsive(element, viewport, { style: patch }) : element,
  );
}

export function updateImageElement(
  spec: DesignSpec,
  nodeId: string,
  patch: Partial<Omit<ImageElement, "id" | "type" | "style">>,
): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "image" ? { ...element, ...patch } : element,
  );
}

export function updateImageStyle(spec: DesignSpec, nodeId: string, patch: Partial<ImageStyle>): DesignSpec {
  return updateElementNode(spec, nodeId, (element) =>
    element.type === "image" ? { ...element, style: { ...element.style, ...patch } } : element,
  );
}

export function updateResponsiveImageStyle(
  spec: DesignSpec,
  nodeId: string,
  viewport: Viewport,
  patch: Partial<ImageStyle>,
): DesignSpec {
  if (viewport === "desktop") {
    return updateImageStyle(spec, nodeId, patch);
  }

  return updateElementNode(spec, nodeId, (element) =>
    element.type === "image" ? withImageResponsive(element, viewport, { style: patch }) : element,
  );
}

function updateElementNode(spec: DesignSpec, nodeId: string, updater: (element: ElementNode) => ElementNode): DesignSpec {
  const next = cloneSpec(spec);
  next.page.sections = next.page.sections.map((section) => ({
    ...section,
    elements: section.elements.map((element) => updateElement(element, nodeId, updater)),
  }));
  return next;
}

export function moveSection(spec: DesignSpec, sectionId: string, direction: "up" | "down"): DesignSpec {
  const next = cloneSpec(spec);
  const index = next.page.sections.findIndex((section) => section.id === sectionId);
  if (index < 0) return spec;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= next.page.sections.length) return spec;

  const sections = [...next.page.sections];
  const [section] = sections.splice(index, 1);
  sections.splice(targetIndex, 0, section);
  next.page.sections = sections;
  return next;
}

export function reorderSection(
  spec: DesignSpec,
  sectionId: string,
  targetSectionId: string,
  placement: SectionDropPlacement,
): DesignSpec {
  if (sectionId === targetSectionId) return spec;

  const sourceIndex = spec.page.sections.findIndex((section) => section.id === sectionId);
  const targetIndex = spec.page.sections.findIndex((section) => section.id === targetSectionId);
  if (sourceIndex < 0 || targetIndex < 0) return spec;

  let insertIndex = targetIndex + (placement === "after" ? 1 : 0);
  if (sourceIndex < insertIndex) {
    insertIndex -= 1;
  }

  if (insertIndex === sourceIndex) return spec;

  const next = cloneSpec(spec);
  const sections = [...next.page.sections];
  const [section] = sections.splice(sourceIndex, 1);
  sections.splice(Math.min(Math.max(insertIndex, 0), sections.length), 0, section);
  next.page.sections = sections;
  return next;
}

export function isResizableDesignNode(spec: DesignSpec, nodeId: string | null) {
  const lookup = findNodeById(spec, nodeId);
  return lookup?.kind === "element" && (lookup.node.type === "card" || lookup.node.type === "image");
}

export function resizeDesignNode(
  spec: DesignSpec,
  nodeId: string,
  viewport: Viewport,
  patch: CanvasResizePatch,
): DesignSpec {
  const lookup = findNodeById(spec, nodeId);
  if (lookup?.kind !== "element") return spec;

  if (lookup.node.type === "card") {
    const currentStyle = getCardStyle(lookup.node, viewport);
    const nextPatch: Partial<CardStyle> = {};

    if (patch.width !== undefined) {
      const width = snapWidth(patch.width, CARD_SIZE_LIMITS.minWidth, CARD_SIZE_LIMITS.maxWidth);
      if (currentStyle.width !== width) nextPatch.width = width;
    }

    if (patch.minHeight !== undefined) {
      const minHeight = snapHeight(patch.minHeight, CARD_SIZE_LIMITS.minHeight, CARD_SIZE_LIMITS.maxHeight);
      if (currentStyle.minHeight !== minHeight) nextPatch.minHeight = minHeight;
    }

    return Object.keys(nextPatch).length > 0
      ? updateResponsiveCardStyle(spec, nodeId, viewport, nextPatch)
      : spec;
  }

  if (lookup.node.type === "image") {
    const currentStyle = getImageStyle(lookup.node, viewport);
    const nextPatch: Partial<ImageStyle> = {};

    if (patch.width !== undefined) {
      const width = snapWidth(patch.width, IMAGE_SIZE_LIMITS.minWidth, IMAGE_SIZE_LIMITS.maxWidth);
      if (currentStyle.width !== width) nextPatch.width = width;
    }

    if (patch.minHeight !== undefined) {
      const minHeight = snapHeight(patch.minHeight, IMAGE_SIZE_LIMITS.minHeight, IMAGE_SIZE_LIMITS.maxHeight);
      if (currentStyle.minHeight !== minHeight) nextPatch.minHeight = minHeight;
    }

    return Object.keys(nextPatch).length > 0
      ? updateResponsiveImageStyle(spec, nodeId, viewport, nextPatch)
      : spec;
  }

  return spec;
}

export function nudgeDesignNodeSize(
  spec: DesignSpec,
  nodeId: string,
  viewport: Viewport,
  direction: CanvasNudgeDirection,
  largeStep = false,
): DesignSpec {
  const lookup = findNodeById(spec, nodeId);
  if (lookup?.kind !== "element") return spec;
  if (lookup.node.type !== "card" && lookup.node.type !== "image") return spec;

  const style = lookup.node.type === "card" ? getCardStyle(lookup.node, viewport) : getImageStyle(lookup.node, viewport);
  const step = largeStep ? 48 : 12;
  const defaultWidth = lookup.node.type === "card" ? 320 : 420;
  const defaultHeight = lookup.node.type === "card" ? 180 : 220;

  if (direction === "left" || direction === "right") {
    const delta = direction === "left" ? -step : step;
    return resizeDesignNode(spec, nodeId, viewport, { width: (style.width ?? defaultWidth) + delta });
  }

  const delta = direction === "up" ? -step : step;
  return resizeDesignNode(spec, nodeId, viewport, { minHeight: (style.minHeight ?? defaultHeight) + delta });
}

export function duplicateNode(spec: DesignSpec, nodeId: string): { spec: DesignSpec; newNodeId: string | null } {
  const next = cloneSpec(spec);
  const sectionIndex = next.page.sections.findIndex((section) => section.id === nodeId);

  if (sectionIndex >= 0) {
    const clone = cloneSectionWithNewIds(next.page.sections[sectionIndex]);
    next.page.sections.splice(sectionIndex + 1, 0, clone);
    return { spec: next, newNodeId: clone.id };
  }

  for (const section of next.page.sections) {
    const elementIndex = section.elements.findIndex((element) => element.id === nodeId);
    if (elementIndex >= 0) {
      const clone = cloneElementWithNewIds(section.elements[elementIndex]);
      section.elements.splice(elementIndex + 1, 0, clone);
      return { spec: next, newNodeId: clone.id };
    }
  }

  return { spec, newNodeId: null };
}

export function deleteNode(spec: DesignSpec, nodeId: string): { spec: DesignSpec; deleted: boolean } {
  const next = cloneSpec(spec);
  const sectionIndex = next.page.sections.findIndex((section) => section.id === nodeId);

  if (sectionIndex >= 0) {
    if (next.page.sections.length <= 1) return { spec, deleted: false };
    next.page.sections.splice(sectionIndex, 1);
    return { spec: next, deleted: true };
  }

  for (const section of next.page.sections) {
    const initialLength = section.elements.length;
    section.elements = section.elements.filter((element) => element.id !== nodeId);
    if (section.elements.length !== initialLength) {
      return { spec: next, deleted: true };
    }
  }

  return { spec, deleted: false };
}

function desktopSectionOverride(section: SectionNode): SectionResponsiveOverride {
  return {
    layout: section.layout,
    style: { ...section.style },
    columns: getSectionColumns(section, "desktop"),
    buttonLayout: "inline",
    imagePosition: "right",
  };
}

function applyDesktopToElement(element: ElementNode): ElementNode {
  if (element.type === "text") {
    const tablet = withTextResponsive(element, "tablet", { style: { ...element.style } });
    return withTextResponsive(tablet, "mobile", { style: { ...element.style } });
  }

  if (element.type === "button") {
    const override: ButtonResponsiveOverride = { style: { ...element.style }, fullWidth: false };
    return withButtonResponsive(withButtonResponsive(element, "tablet", override), "mobile", override);
  }

  if (element.type === "card") {
    return {
      ...withCardResponsive(
        withCardResponsive(element, "tablet", { style: { ...element.style } }),
        "mobile",
        { style: { ...element.style } },
      ),
      image: element.image ? (applyDesktopToElement(element.image) as ImageElement) : undefined,
    };
  }

  if (element.type === "image") {
    return withImageResponsive(
      withImageResponsive(element, "tablet", { style: { ...element.style } }),
      "mobile",
      { style: { ...element.style } },
    );
  }

  return withStatResponsive(
    withStatResponsive(element, "tablet", { style: { ...element.style } }),
    "mobile",
    { style: { ...element.style } },
  );
}

function applyDesktopToSection(section: SectionNode): SectionNode {
  const desktop = desktopSectionOverride(section);
  return {
    ...withSectionResponsive(withSectionResponsive(section, "tablet", desktop), "mobile", desktop),
    elements: section.elements.map(applyDesktopToElement),
  };
}

function resetElementBreakpoint(element: ElementNode, viewport: Viewport): ElementNode {
  if (element.type === "card") {
    return {
      ...element,
      responsive: removeResponsiveOverride(element.responsive, viewport),
      image: element.image ? (resetElementBreakpoint(element.image, viewport) as ImageElement) : undefined,
    };
  }

  if (element.type === "text") {
    return { ...element, responsive: removeResponsiveOverride(element.responsive, viewport) };
  }

  if (element.type === "button") {
    return { ...element, responsive: removeResponsiveOverride(element.responsive, viewport) };
  }

  if (element.type === "image") {
    return { ...element, responsive: removeResponsiveOverride(element.responsive, viewport) };
  }

  return { ...element, responsive: removeResponsiveOverride(element.responsive, viewport) };
}

function autoMobileTextStyle(element: TextElement, section: SectionNode): Partial<TextStyle> {
  const maxFontSizeByRole: Record<TextElement["role"], number> = {
    eyebrow: 12,
    heading: 38,
    subheading: 20,
    body: 17,
    caption: 13,
  };

  return {
    align: section.type === "hero" || section.type === "cta" ? "center" : element.style.align,
    fontSize: Math.min(element.style.fontSize, maxFontSizeByRole[element.role]),
    maxWidth: element.style.maxWidth ? Math.min(element.style.maxWidth, 560) : undefined,
  };
}

function autoMobileElement(element: ElementNode, section: SectionNode): ElementNode {
  if (element.type === "text") {
    return withTextResponsive(element, "mobile", { style: autoMobileTextStyle(element, section) });
  }

  if (element.type === "button") {
    return withButtonResponsive(element, "mobile", {
      fullWidth: true,
      style: {
        fontSize: Math.min(element.style.fontSize, 16),
        paddingX: Math.min(element.style.paddingX, 22),
        paddingY: Math.max(element.style.paddingY, 10),
      },
    });
  }

  if (element.type === "card") {
    return {
      ...withCardResponsive(element, "mobile", {
        style: {
          padding: Math.min(element.style.padding, 24),
          width: undefined,
        },
      }),
      image: element.image ? (autoMobileElement(element.image, section) as ImageElement) : undefined,
    };
  }

  if (element.type === "image") {
    return withImageResponsive(element, "mobile", {
      style: {
        aspectRatio: element.style.aspectRatio === "portrait" ? "square" : element.style.aspectRatio,
      },
    });
  }

  return withStatResponsive(element, "mobile", { style: { align: "center" } });
}

function autoMobileSection(section: SectionNode): SectionNode {
  const style: Partial<SectionStyle> = {
    align: section.type === "hero" || section.type === "cta" ? "center" : section.style.align,
    gap: Math.min(Math.max(Math.round(section.style.gap * 0.8), 16), 40),
    paddingBottom: Math.min(Math.max(Math.round(section.style.paddingBottom * 0.72), 36), 88),
    paddingTop: Math.min(Math.max(Math.round(section.style.paddingTop * 0.72), 36), 88),
    paddingX: Math.min(Math.max(Math.round(section.style.paddingX * 0.75), 18), 28),
  };

  return {
    ...withSectionResponsive(section, "mobile", {
      buttonLayout: "stack",
      columns: 1,
      imagePosition: section.type === "hero" ? "top" : "right",
      layout: section.type === "cta" || section.type === "hero" ? "centered" : "stack",
      style,
    }),
    elements: section.elements.map((element) => autoMobileElement(element, section)),
  };
}

export function applyDesktopStylesToBreakpoints(spec: DesignSpec, nodeId: string | null): DesignSpec {
  const lookup = findNodeById(spec, nodeId);
  const next = cloneSpec(spec);

  if (!lookup || lookup.kind === "page") {
    next.page.sections = next.page.sections.map(applyDesktopToSection);
    return next;
  }

  if (lookup.kind === "section") {
    next.page.sections = next.page.sections.map((section) =>
      section.id === nodeId ? applyDesktopToSection(section) : section,
    );
    return next;
  }

  next.page.sections = next.page.sections.map((section) => ({
    ...section,
    elements: mapElements(section.elements, (element) => (element.id === nodeId ? applyDesktopToElement(element) : element)),
  }));
  return next;
}

export function resetBreakpointOverride(spec: DesignSpec, nodeId: string | null, viewport: Viewport): DesignSpec {
  const lookup = findNodeById(spec, nodeId);
  const next = cloneSpec(spec);

  if (!lookup || lookup.kind === "page") {
    next.page.sections = next.page.sections.map((section) => ({
      ...section,
      responsive: removeResponsiveOverride(section.responsive, viewport),
      elements: section.elements.map((element) => resetElementBreakpoint(element, viewport)),
    }));
    return next;
  }

  if (lookup.kind === "section") {
    next.page.sections = next.page.sections.map((section) =>
      section.id === nodeId
        ? {
            ...section,
            responsive: removeResponsiveOverride(section.responsive, viewport),
            elements: section.elements.map((element) => resetElementBreakpoint(element, viewport)),
          }
        : section,
    );
    return next;
  }

  next.page.sections = next.page.sections.map((section) => ({
    ...section,
    elements: mapElements(section.elements, (element) =>
      element.id === nodeId ? resetElementBreakpoint(element, viewport) : element,
    ),
  }));
  return next;
}

export function autoCreateMobileLayout(spec: DesignSpec, nodeId: string | null): DesignSpec {
  const lookup = findNodeById(spec, nodeId);
  const next = cloneSpec(spec);

  if (!lookup || lookup.kind === "page") {
    next.page.sections = next.page.sections.map(autoMobileSection);
    return next;
  }

  if (lookup.kind === "section") {
    next.page.sections = next.page.sections.map((section) => (section.id === nodeId ? autoMobileSection(section) : section));
    return next;
  }

  next.page.sections = next.page.sections.map((section) => ({
    ...section,
    elements: mapElements(section.elements, (element) =>
      element.id === nodeId ? autoMobileElement(element, section) : element,
    ),
  }));
  return next;
}

export function mockRefineSpec(spec: DesignSpec, instruction: string, selectedNodeId?: string): DesignSpec {
  const lower = instruction.toLowerCase();

  if (selectedNodeId) {
    const lookup = findNodeById(spec, selectedNodeId);
    if (!lookup) return spec;

    if (lookup.kind === "section") {
      return updateSectionStyle(spec, selectedNodeId, {
        paddingTop: Math.min((lookup.node as SectionNode).style.paddingTop + 12, 180),
        paddingBottom: Math.min((lookup.node as SectionNode).style.paddingBottom + 12, 180),
        shadow: "md",
      });
    }

    if (lookup.node.type === "text") {
      return updateTextElement(spec, selectedNodeId, {
        content: lower.includes("shorter")
          ? lookup.node.content.split(" ").slice(0, 8).join(" ")
          : `${lookup.node.content} with sharper clarity`,
      });
    }

    if (lookup.node.type === "button") {
      return updateButtonStyle(spec, selectedNodeId, {
        radius: 999,
        paddingX: Math.min(lookup.node.style.paddingX + 4, 44),
      });
    }

    if (lookup.node.type === "card") {
      return updateCardStyle(spec, selectedNodeId, {
        shadow: "lg",
        radius: Math.min(lookup.node.style.radius + 4, 36),
      });
    }
  }

  let next = spec;
  if (lower.includes("dark")) {
    next = updateTheme(next, "dark");
  }

  if (lower.includes("light")) {
    next = updateTheme(next, "light");
  }

  next = {
    ...next,
    page: {
      ...next.page,
      sections: next.page.sections.map((section) => ({
        ...section,
        style: {
          ...section.style,
          gap: Math.min(section.style.gap + 4, 64),
          shadow: section.type === "header" || section.type === "footer" ? section.style.shadow : "sm",
        },
      })),
    },
  };

  return next;
}
