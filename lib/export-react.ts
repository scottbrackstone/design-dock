import type {
  ButtonElement,
  CardElement,
  DesignSpec,
  ElementNode,
  ImageElement,
  SectionNode,
  ShadowLevel,
  TextElement,
  Viewport,
} from "@/lib/design-schema";
import { buildCompactDesignGuidance } from "@/lib/design-guidance/compact-guidance";
import { lintExportedCode } from "@/lib/design-lint/lint-exported-code";
import {
  getButtonFullWidth,
  getButtonStyle,
  getCardStyle,
  getImageStyle,
  getSectionButtonLayout,
  getSectionColumns,
  getSectionImagePosition,
  getSectionLayout,
  getSectionStyle,
  getStatStyle,
  getTextStyle,
} from "@/lib/responsive-design";

const shadowCss: Record<ShadowLevel, string> = {
  none: "none",
  sm: "0 8px 24px rgba(24, 24, 27, 0.08)",
  md: "0 18px 42px rgba(24, 24, 27, 0.12)",
  lg: "0 26px 60px rgba(24, 24, 27, 0.16)",
  xl: "0 34px 80px rgba(24, 24, 27, 0.22)",
};

const imageAspectClasses: Record<ImageElement["style"]["aspectRatio"], string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  video: "aspect-[16/10]",
  wide: "aspect-[21/9]",
};

const exportViewports: Viewport[] = ["mobile", "tablet", "desktop"];
const breakpointPrefixes: Record<Viewport, string> = {
  desktop: "lg:",
  tablet: "md:",
  mobile: "",
};

type StyleValue = number | string | undefined;
type StyleEntry = [string, StyleValue];

function indent(value: string, spaces: number) {
  const prefix = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => (line ? `${prefix}${line}` : line))
    .join("\n");
}

function literal(value: StyleValue) {
  return typeof value === "number" ? String(value) : JSON.stringify(value);
}

function objectLiteral(entries: StyleEntry[]) {
  const filtered = entries.filter(([, value]) => value !== undefined);
  if (filtered.length === 0) return "{}";

  return `{ ${filtered.map(([key, value]) => `${key}: ${literal(value)}`).join(", ")} }`;
}

function styleAttribute(entries: StyleEntry[]) {
  return `style={${objectLiteral(entries)}}`;
}

function classNameAttribute(className: string) {
  return `className=${jsxAttr(className)}`;
}

function uniqueClasses(classes: string[]) {
  return classes.filter(Boolean).filter((className, index, all) => all.indexOf(className) === index).join(" ");
}

function responsiveClasses<T>(values: Record<Viewport, T>, toClass: (value: T) => string) {
  return uniqueClasses(exportViewports.map((viewport) => `${breakpointPrefixes[viewport]}${toClass(values[viewport])}`));
}

function responsiveNumberClasses(values: Record<Viewport, number>, prefix: string) {
  return responsiveClasses(values, (value) => `${prefix}-[${Math.round(value)}px]`);
}

function responsiveAlignmentClasses(values: Record<Viewport, "left" | "center" | "right">) {
  return responsiveClasses(values, (value) => `text-${value}`);
}

function responsiveColumnsClasses(values: Record<Viewport, number>) {
  return responsiveClasses(values, (value) => `grid-cols-${value}`);
}

function responsiveSectionSpacingClasses(section: SectionNode) {
  const values = {
    desktop: getSectionStyle(section, "desktop"),
    tablet: getSectionStyle(section, "tablet"),
    mobile: getSectionStyle(section, "mobile"),
  };

  return uniqueClasses([
    responsiveNumberClasses(
      {
        desktop: values.desktop.paddingX,
        tablet: values.tablet.paddingX,
        mobile: values.mobile.paddingX,
      },
      "px",
    ),
    responsiveNumberClasses(
      {
        desktop: values.desktop.paddingTop,
        tablet: values.tablet.paddingTop,
        mobile: values.mobile.paddingTop,
      },
      "pt",
    ),
    responsiveNumberClasses(
      {
        desktop: values.desktop.paddingBottom,
        tablet: values.tablet.paddingBottom,
        mobile: values.mobile.paddingBottom,
      },
      "pb",
    ),
  ]);
}

function responsiveGapClasses(section: SectionNode) {
  return responsiveNumberClasses(
    {
      desktop: getSectionStyle(section, "desktop").gap,
      tablet: getSectionStyle(section, "tablet").gap,
      mobile: getSectionStyle(section, "mobile").gap,
    },
    "gap",
  );
}

function responsiveTextClasses(element: TextElement) {
  return uniqueClasses([
    responsiveNumberClasses(
      {
        desktop: getTextStyle(element, "desktop").fontSize,
        tablet: getTextStyle(element, "tablet").fontSize,
        mobile: getTextStyle(element, "mobile").fontSize,
      },
      "text",
    ),
    responsiveAlignmentClasses({
      desktop: getTextStyle(element, "desktop").align,
      tablet: getTextStyle(element, "tablet").align,
      mobile: getTextStyle(element, "mobile").align,
    }),
  ]);
}

function responsiveButtonClasses(element: ButtonElement) {
  const style = {
    desktop: getButtonStyle(element, "desktop"),
    tablet: getButtonStyle(element, "tablet"),
    mobile: getButtonStyle(element, "mobile"),
  };
  const widthValues = {
    desktop: getButtonFullWidth(element, "desktop") ? "full" : "auto",
    tablet: getButtonFullWidth(element, "tablet") ? "full" : "auto",
    mobile: getButtonFullWidth(element, "mobile") ? "full" : "auto",
  };

  return uniqueClasses([
    responsiveNumberClasses(
      {
        desktop: style.desktop.fontSize,
        tablet: style.tablet.fontSize,
        mobile: style.mobile.fontSize,
      },
      "text",
    ),
    responsiveNumberClasses(
      {
        desktop: style.desktop.paddingX,
        tablet: style.tablet.paddingX,
        mobile: style.mobile.paddingX,
      },
      "px",
    ),
    responsiveNumberClasses(
      {
        desktop: style.desktop.paddingY,
        tablet: style.tablet.paddingY,
        mobile: style.mobile.paddingY,
      },
      "py",
    ),
    responsiveClasses(widthValues, (value) => `w-${value}`),
  ]);
}

function responsiveCardClasses(element: CardElement) {
  return responsiveNumberClasses(
    {
      desktop: getCardStyle(element, "desktop").padding,
      tablet: getCardStyle(element, "tablet").padding,
      mobile: getCardStyle(element, "mobile").padding,
    },
    "p",
  );
}

function responsiveImageAspectClasses(element: ImageElement) {
  return responsiveClasses(
    {
      desktop: getImageStyle(element, "desktop").aspectRatio,
      tablet: getImageStyle(element, "tablet").aspectRatio,
      mobile: getImageStyle(element, "mobile").aspectRatio,
    },
    (value) => imageAspectClasses[value],
  );
}

function responsiveStatClasses(element: Extract<ElementNode, { type: "stat" }>) {
  return responsiveAlignmentClasses({
    desktop: getStatStyle(element, "desktop").align,
    tablet: getStatStyle(element, "tablet").align,
    mobile: getStatStyle(element, "mobile").align,
  });
}

function responsiveGridClasses(section: SectionNode) {
  return uniqueClasses([
    "grid",
    responsiveGapClasses(section),
    responsiveColumnsClasses({
      desktop: getSectionColumns(section, "desktop"),
      tablet: getSectionColumns(section, "tablet"),
      mobile: getSectionColumns(section, "mobile"),
    }),
  ]);
}

function responsiveFlexDirectionClasses(values: Record<Viewport, "row" | "col">) {
  return responsiveClasses(values, (value) => `flex-${value}`);
}

function isStackedSection(section: SectionNode, viewport: Viewport) {
  const layout = getSectionLayout(section, viewport);
  return viewport === "mobile" || layout === "stack" || layout === "footer-columns";
}

function responsiveHeaderFooterClasses(section: SectionNode) {
  return uniqueClasses([
    "flex items-start",
    responsiveGapClasses(section),
    responsiveFlexDirectionClasses({
      desktop: isStackedSection(section, "desktop") ? "col" : "row",
      tablet: isStackedSection(section, "tablet") ? "col" : "row",
      mobile: "col",
    }),
    "lg:items-center lg:justify-between",
  ]);
}

function responsiveButtonGroupClasses(section: SectionNode) {
  return uniqueClasses([
    "flex gap-3",
    responsiveFlexDirectionClasses({
      desktop: getSectionButtonLayout(section, "desktop") === "stack" ? "col" : "row",
      tablet: getSectionButtonLayout(section, "tablet") === "stack" ? "col" : "row",
      mobile: getSectionButtonLayout(section, "mobile") === "stack" ? "col" : "row",
    }),
    getSectionButtonLayout(section, "mobile") === "stack" ? "items-stretch" : "flex-wrap",
    getSectionButtonLayout(section, "tablet") === "stack" ? "md:items-stretch" : "md:flex-wrap",
    getSectionButtonLayout(section, "desktop") === "stack" ? "lg:items-stretch" : "lg:flex-wrap",
  ]);
}

function heroColumnsClass(section: SectionNode, viewport: Viewport) {
  const layout = getSectionLayout(section, viewport);
  const imagePosition = getSectionImagePosition(section, viewport);
  if (layout !== "split" || (imagePosition !== "left" && imagePosition !== "right")) return "grid-cols-1";
  return imagePosition === "left" ? "grid-cols-[0.95fr_1.05fr]" : "grid-cols-[1.05fr_0.95fr]";
}

function responsiveHeroGridClasses(section: SectionNode) {
  return uniqueClasses([
    "grid items-center",
    responsiveGapClasses(section),
    responsiveClasses(
      {
        desktop: heroColumnsClass(section, "desktop"),
        tablet: heroColumnsClass(section, "tablet"),
        mobile: "grid-cols-1",
      },
      (value) => value,
    ),
  ]);
}

function responsiveHeroOrderClasses(section: SectionNode, target: "copy" | "media") {
  return responsiveClasses(
    {
      desktop: getSectionImagePosition(section, "desktop"),
      tablet: getSectionImagePosition(section, "tablet"),
      mobile: getSectionImagePosition(section, "mobile"),
    },
    (position) => {
      const mediaFirst = position === "left" || position === "top";
      const order = target === "media" ? (mediaFirst ? 1 : 2) : mediaFirst ? 2 : 1;
      return `order-${order}`;
    },
  );
}

function jsxText(value: string) {
  return `{${JSON.stringify(value)}}`;
}

function jsxAttr(value: string) {
  return `{${JSON.stringify(value)}}`;
}

function safeComment(value: string) {
  return value.replace(/\*\//g, "* /").replace(/\r?\n/g, " ");
}

function pascalCase(value: string) {
  const normalized = value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");

  return normalized || "Section";
}

function sectionComponentName(section: SectionNode, index: number) {
  return `Section${String(index + 1).padStart(2, "0")}${pascalCase(section.name || section.type)}`;
}

function sectionBackgroundEntries(section: SectionNode): StyleEntry[] {
  const style = getSectionStyle(section, "desktop");

  if (style.backgroundType === "gradient") {
    return [
      [
        "background",
        `linear-gradient(135deg, ${style.gradientFrom ?? "#ffffff"}, ${style.gradientTo ?? "#ccfbf1"})`,
      ],
    ];
  }

  if (style.backgroundType === "transparent") {
    return [["backgroundColor", "transparent"]];
  }

  return [["backgroundColor", style.backgroundColor ?? "transparent"]];
}

function sectionStyleEntries(section: SectionNode): StyleEntry[] {
  const style = getSectionStyle(section, "desktop");

  return [
    ...sectionBackgroundEntries(section),
    ["borderColor", style.borderColor],
    ["borderRadius", style.borderRadius],
    ["boxShadow", shadowCss[style.shadow]],
  ];
}

function sectionInnerStyleEntries(section: SectionNode): StyleEntry[] {
  const style = getSectionStyle(section, "desktop");

  return [
    ["borderRadius", style.borderRadius],
    ["margin", "0 auto"],
    ["maxWidth", style.maxWidth],
  ];
}

function textTag(element: TextElement, section: SectionNode) {
  if (element.role === "heading" && section.type === "hero") return "h1";
  if (element.role === "heading") return "h2";
  return "p";
}

function textClassName(element: TextElement) {
  if (element.role === "eyebrow") {
    return "m-0 text-xs font-black uppercase tracking-wide";
  }

  if (element.role === "heading") {
    return "m-0";
  }

  return "m-0";
}

function renderTextElement(element: TextElement, section: SectionNode, level: number) {
  const Tag = textTag(element, section);
  const style = getTextStyle(element, "desktop");

  return indent(
    `<${Tag}
  ${classNameAttribute(uniqueClasses([textClassName(element), responsiveTextClasses(element)]))}
  ${styleAttribute([
    ["color", style.color],
    ["fontFamily", `${style.fontFamily}, ui-sans-serif, system-ui, sans-serif`],
    ["fontWeight", style.fontWeight],
    ["letterSpacing", style.letterSpacing],
    ["lineHeight", style.lineHeight],
    ["maxWidth", style.maxWidth],
  ])}
>
  ${jsxText(element.content)}
</${Tag}>`,
    level,
  );
}

function renderButtonElement(element: ButtonElement, level: number) {
  const style = getButtonStyle(element, "desktop");

  return indent(
    `<a
  ${classNameAttribute(
    uniqueClasses(["inline-flex items-center justify-center border transition hover:brightness-105", responsiveButtonClasses(element)]),
  )}
  href=${jsxAttr(element.href ?? "#")}
  ${styleAttribute([
    ["backgroundColor", style.backgroundColor],
    ["borderColor", style.borderColor ?? style.backgroundColor],
    ["borderRadius", style.radius],
    ["color", style.textColor],
    ["fontWeight", style.fontWeight],
  ])}
>
  ${jsxText(element.label)}
</a>`,
    level,
  );
}

function renderImageElement(element: ImageElement, level: number) {
  const style = getImageStyle(element, "desktop");

  return indent(
    `<div
  aria-label=${jsxAttr(element.alt)}
  ${classNameAttribute(
    uniqueClasses(["relative flex min-h-48 overflow-hidden border border-white/50 p-5", responsiveImageAspectClasses(element)]),
  )}
  role="img"
  ${styleAttribute([
    ["background", `linear-gradient(135deg, ${style.backgroundColor}, #0f766e)`],
    ["borderRadius", style.radius],
    ["maxWidth", "100%"],
    ["minHeight", style.minHeight],
    ["width", style.width],
  ])}
>
  <div className="absolute inset-5 rounded-md border border-white/35" />
  <div className="mt-auto rounded-full bg-white/85 px-3 py-1 text-xs font-black text-zinc-950">
    ${jsxText(element.label ?? element.alt)}
  </div>
</div>`,
    level,
  );
}

function cardTextColors(element: CardElement) {
  const style = getCardStyle(element, "desktop");
  const darkCard = style.backgroundColor.toLowerCase() !== "#ffffff";
  return {
    body: darkCard ? "#cbd5e1" : "#52525b",
    heading: darkCard ? "#f8fafc" : "#111827",
  };
}

function renderCardElement(element: CardElement, level: number) {
  const colors = cardTextColors(element);
  const style = getCardStyle(element, "desktop");
  const image = element.image
    ? `${indent("<div className=\"mb-5\">", level + 2)}\n${renderImageElement(element.image, level + 4)}\n${indent("</div>", level + 2)}\n`
    : "";

  return indent(
    `<article
  ${classNameAttribute(uniqueClasses(["h-full border", responsiveCardClasses(element)]))}
  ${styleAttribute([
    ["backgroundColor", style.backgroundColor],
    ["borderColor", style.borderColor ?? "transparent"],
    ["borderRadius", style.radius],
    ["boxShadow", shadowCss[style.shadow]],
    ["maxWidth", "100%"],
    ["minHeight", style.minHeight],
    ["width", style.width],
  ])}
>
${image}${indent(`<h3 className="text-xl font-black leading-tight" style={{ color: ${JSON.stringify(colors.heading)} }}>
  ${jsxText(element.title)}
</h3>
<p className="mt-3 text-sm leading-6" style={{ color: ${JSON.stringify(colors.body)} }}>
  ${jsxText(element.body)}
</p>`, 2)}
</article>`,
    level,
  );
}

function renderStatElement(element: Extract<ElementNode, { type: "stat" }>, level: number) {
  const style = getStatStyle(element, "desktop");

  return indent(
    `<div ${classNameAttribute(responsiveStatClasses(element))}>
  <div
    className="text-4xl font-black leading-none"
    ${styleAttribute([["color", style.color]])}
  >
    ${jsxText(element.value)}
  </div>
  <div
    className="mt-2 text-sm font-bold"
    ${styleAttribute([["color", style.labelColor]])}
  >
    ${jsxText(element.label)}
  </div>
</div>`,
    level,
  );
}

function renderElement(element: ElementNode, section: SectionNode, level: number): string {
  if (element.type === "text") return renderTextElement(element, section, level);
  if (element.type === "button") return renderButtonElement(element, level);
  if (element.type === "card") return renderCardElement(element, level);
  if (element.type === "image") return renderImageElement(element, level);
  return renderStatElement(element, level);
}

function renderElementList(elements: ElementNode[], section: SectionNode, level: number) {
  return elements.map((element) => renderElement(element, section, level)).join("\n");
}

function renderGroupedElements(elements: ElementNode[], section: SectionNode, level: number) {
  const textElements = elements.filter((element) => element.type === "text");
  const buttonElements = elements.filter((element) => element.type === "button");
  const imageElements = elements.filter((element) => element.type === "image");
  const cardElements = elements.filter((element) => element.type === "card");
  const statElements = elements.filter((element) => element.type === "stat");

  if (section.type === "header" || section.type === "footer") {
    const textGroupClass = uniqueClasses([
      "flex gap-2",
      responsiveFlexDirectionClasses({
        desktop: isStackedSection(section, "desktop") ? "col" : "row",
        tablet: isStackedSection(section, "tablet") ? "col" : "row",
        mobile: "col",
      }),
      "lg:items-center lg:gap-8",
    ]);

    return indent(
      `<div ${classNameAttribute(responsiveHeaderFooterClasses(section))}>
  <div ${classNameAttribute(textGroupClass)}>
${renderElementList(textElements, section, 4)}
  </div>
  <div ${classNameAttribute(responsiveButtonGroupClasses(section))}>
${renderElementList(buttonElements, section, 4)}
  </div>
</div>`,
      level,
    );
  }

  if (section.type === "hero") {
    return indent(
      `<div ${classNameAttribute(responsiveHeroGridClasses(section))}>
  <div ${classNameAttribute(uniqueClasses(["flex flex-col", responsiveGapClasses(section), responsiveHeroOrderClasses(section, "copy")]))}>
${renderElementList(textElements, section, 4)}
    <div ${classNameAttribute(uniqueClasses(["pt-2", responsiveButtonGroupClasses(section)]))}>
${renderElementList(buttonElements, section, 6)}
    </div>
  </div>
  <div ${classNameAttribute(uniqueClasses(["grid", responsiveGapClasses(section), responsiveHeroOrderClasses(section, "media")]))}>
${renderElementList(imageElements, section, 4)}
  </div>
</div>`,
      level,
    );
  }

  if (section.type === "features" || section.type === "gallery") {
    return indent(
      `<div ${classNameAttribute(uniqueClasses(["flex flex-col", responsiveGapClasses(section)]))}>
  <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
${renderElementList(textElements, section, 4)}
  </div>
  <div ${classNameAttribute(responsiveGridClasses(section))}>
${renderElementList([...cardElements, ...imageElements], section, 4)}
  </div>
</div>`,
      level,
    );
  }

  if (section.type === "stats") {
    return indent(
      `<div ${classNameAttribute(responsiveGridClasses(section))}>
${renderElementList(statElements, section, 2)}
</div>`,
      level,
    );
  }

  if (section.type === "cta") {
    return indent(
      `<div ${classNameAttribute(
        uniqueClasses([
          "mx-auto flex max-w-3xl flex-col items-center",
          responsiveGapClasses(section),
          responsiveAlignmentClasses({
            desktop: getSectionStyle(section, "desktop").align,
            tablet: getSectionStyle(section, "tablet").align,
            mobile: getSectionStyle(section, "mobile").align,
          }),
        ]),
      )}>
${renderElementList(elements, section, 2)}
</div>`,
      level,
    );
  }

  return indent(
    `<div ${classNameAttribute(responsiveGridClasses(section))}>
${renderElementList(elements, section, 2)}
</div>`,
    level,
  );
}

function renderSection(section: SectionNode, index: number) {
  const componentName = sectionComponentName(section, index);
  const sectionComment = `DesignSpec section: ${section.name} (${section.type}), id: ${section.id}`;

  return {
    componentName,
    code: `// ${safeComment(sectionComment)}
function ${componentName}() {
  return (
    <SectionFrame
      label=${jsxAttr(section.name)}
      innerClassName="w-full"
      innerStyle={${objectLiteral(sectionInnerStyleEntries(section))}}
      sectionClassName=${jsxAttr(uniqueClasses(["w-full", responsiveSectionSpacingClasses(section)]))}
      sectionStyle={${objectLiteral(sectionStyleEntries(section))}}
    >
      {/* ${safeComment(sectionComment)} */}
${renderGroupedElements(section.elements, section, 6)}
    </SectionFrame>
  );
}`,
  };
}

export function exportDesignSpecJson(spec: DesignSpec) {
  return JSON.stringify(spec, null, 2);
}

export function exportReactComponent(spec: DesignSpec) {
  const sections = spec.page.sections.map(renderSection);
  const sectionInvocations = sections.map(({ componentName }) => `      <${componentName} />`).join("\n");
  const sectionFunctions = sections.map(({ code }) => code).join("\n\n");

  return `import type { CSSProperties, ReactNode } from "react";

type SectionFrameProps = {
  children: ReactNode;
  innerClassName?: string;
  innerStyle?: CSSProperties;
  label: string;
  sectionClassName?: string;
  sectionStyle?: CSSProperties;
};

function SectionFrame({
  children,
  innerClassName = "w-full",
  innerStyle,
  label,
  sectionClassName = "w-full",
  sectionStyle,
}: SectionFrameProps) {
  return (
    <section aria-label={label} className={sectionClassName} style={sectionStyle}>
      <div className={innerClassName} style={innerStyle}>
        {children}
      </div>
    </section>
  );
}

export default function GeneratedDesign() {
  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        backgroundColor: "${spec.page.style.backgroundColor}",
        color: "${spec.page.style.textColor}",
        fontFamily: "${spec.page.style.fontFamily}, ui-sans-serif, system-ui, sans-serif",
        margin: "0 auto",
        maxWidth: ${spec.page.style.maxWidth},
      }}
    >
${sectionInvocations}
    </main>
  );
}

${sectionFunctions}
`;
}

export function exportHandoffPrompt(spec: DesignSpec) {
  const reactCode = exportReactComponent(spec);
  const exportLintIssues = lintExportedCode(reactCode);
  const exportLintSummary =
    exportLintIssues.length > 0
      ? exportLintIssues.map((issue) => `- [${issue.severity}] ${issue.message}`).join("\n")
      : "- No deterministic export lint warnings.";

  return `You are implementing a UI generated in DesignDock.

Use the attached DesignSpec JSON as the source of truth.
Build this as a Next.js App Router page using TypeScript and Tailwind CSS.
Preserve the layout, spacing, typography, colours, rounded corners, shadows, and responsive behaviour.
Start from the React/Tailwind export below, then adapt it into the target app's component structure.
Do not execute generated code; translate the structured DesignSpec into trusted local components.
Do not add unnecessary dependencies.
Use accessible semantic HTML, descriptive buttons, readable contrast, and responsive layouts.
Run lint, typecheck, and build before finishing.

Design title: ${spec.title}
Design kind: ${spec.kind}
Theme: ${spec.theme}

Design guidance:
${buildCompactDesignGuidance({
  prompt: `${spec.title}. ${spec.description}`,
  designSystem: spec.designSystem,
  pageKind: spec.kind,
})}

Export lint notes:
${exportLintSummary}

React/Tailwind starting point:
${reactCode}

DesignSpec JSON:
${exportDesignSpecJson(spec)}
`;
}
