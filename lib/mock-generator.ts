import type { DesignKind, DesignSpec, DesignSystemSnapshot, SectionNode } from "@/lib/design-schema";
import {
  createButtonStyle,
  createCardStyle,
  createImageStyle,
  createPageStyle,
  createSectionStyle,
  createStatStyle,
  createTextStyle,
} from "@/lib/design-defaults";
import { cloneDesignSystem, defaultDesignSystem, getReadableTextColor, isDarkHexColor } from "@/lib/design-systems";
import { buildDesignRead } from "@/lib/design-guidance/compact-guidance";
import { getPageTypeRules } from "@/lib/design-guidance/page-type-rules";
import { rewriteGenericUICopy } from "@/lib/design-guidance/copy-rules";
import { createId } from "@/lib/ids";

function titleFromPrompt(prompt: string) {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (!cleaned) {
    return "DesignDock Starter";
  }

  return cleaned
    .split(" ")
    .slice(0, 6)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function inferAudience(prompt: string) {
  const lower = prompt.toLowerCase();

  if (lower.includes("fitness")) return "active teams";
  if (lower.includes("finance") || lower.includes("bank")) return "modern finance teams";
  if (lower.includes("health")) return "care teams";
  if (lower.includes("portfolio")) return "creative professionals";
  if (lower.includes("dashboard")) return "operators";
  return "ambitious product teams";
}

function designKindFromPageKind(pageKind: string): DesignKind {
  if (pageKind === "dashboard" || pageKind === "admin-panel") return "dashboard";
  if (pageKind === "settings") return "settings";
  if (pageKind === "gallery") return "gallery";
  if (pageKind === "form-workflow") return "form";
  if (pageKind === "mobile-app-landing") return "app-screen";
  return "landing-page";
}

function generateProductMockDesignSpec(
  prompt: string,
  designSystem: DesignSystemSnapshot,
  pageKind: string,
): DesignSpec {
  const title = titleFromPrompt(prompt);
  const activeDesignSystem = cloneDesignSystem(designSystem);
  const pageRules = getPageTypeRules(pageKind);
  const { colors, radius } = activeDesignSystem.tokens;
  const theme = isDarkHexColor(colors.background) ? "dark" : "light";
  const pageStyle = createPageStyle(theme, activeDesignSystem);
  const dark = theme === "dark";
  const foreground = colors.foreground;
  const muted = colors.muted;
  const card = colors.card;
  const border = colors.border;
  const rewrittenTitle = rewriteGenericUICopy(title, pageRules.primaryGoal);

  const sections: SectionNode[] = [
    {
      id: createId("section"),
      type: "header",
      name: "Workspace header",
      layout: "inline",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: card,
        paddingTop: 18,
        paddingBottom: 18,
        paddingX: 24,
        gap: 18,
        borderColor: border,
        align: "left",
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: rewrittenTitle,
          style: createTextStyle("heading", {
            fontSize: 20,
            fontWeight: 850,
            color: foreground,
            maxWidth: 360,
          }, activeDesignSystem),
        },
        {
          id: createId("text"),
          type: "text",
          role: "body",
          content: pageRules.recommendedSections.slice(0, 4).join(" / "),
          style: createTextStyle("body", { fontSize: 14, color: muted }, activeDesignSystem),
        },
        {
          id: createId("button"),
          type: "button",
          label: pageKind === "settings" ? "Save changes" : "Create view",
          variant: "primary",
          style: createButtonStyle({}, activeDesignSystem),
        },
      ],
    },
    {
      id: createId("section"),
      type: "stats",
      name: "Status summary",
      layout: "grid",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: colors.background,
        paddingTop: 36,
        paddingBottom: 20,
        gap: 16,
        align: "left",
      }, activeDesignSystem),
      elements: [
        ...[
          ["24", "Open items"],
          ["8", "Need review"],
          ["99%", "Saved changes"],
        ].map(([value, label]) => ({
          id: createId("stat"),
          type: "stat" as const,
          value,
          label,
          style: createStatStyle({
            color: foreground,
            labelColor: muted,
            align: "left",
          }, activeDesignSystem),
        })),
      ],
    },
    {
      id: createId("section"),
      type: "custom",
      name: "Primary work area",
      layout: "cards",
      responsive: { mobile: { columns: 1 }, tablet: { columns: 2 } },
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: colors.background,
        paddingTop: 28,
        paddingBottom: 40,
        gap: 16,
        align: "left",
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: pageRules.primaryGoal,
          style: createTextStyle("heading", {
            fontSize: 34,
            color: foreground,
            align: "left",
            maxWidth: 760,
          }, activeDesignSystem),
        },
        {
          id: createId("text"),
          type: "text",
          role: "body",
          content: "Review the active state, adjust filters, and resolve the next item without leaving the workspace.",
          style: createTextStyle("body", {
            color: muted,
            align: "left",
            maxWidth: 720,
          }, activeDesignSystem),
        },
        ...pageRules.recommendedSections.slice(0, 3).map((item, index) => ({
          id: createId("card"),
          type: "card" as const,
          title: item.charAt(0).toUpperCase() + item.slice(1),
          body:
            index === 0
              ? "Shows current status, loading, empty, and error states clearly."
              : index === 1
                ? "Keeps actions close to the content they affect."
                : "Uses compact spacing for repeated daily work.",
          style: createCardStyle({
            backgroundColor: card,
            borderColor: border,
            radius: radius.md,
            shadow: dark ? "none" : "sm",
            minHeight: 150,
          }, activeDesignSystem),
        })),
      ],
    },
    {
      id: createId("section"),
      type: pageKind === "gallery" ? "gallery" : "features",
      name: "State and activity",
      layout: "grid",
      responsive: { mobile: { columns: 1 }, tablet: { columns: 2 } },
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: card,
        paddingTop: 34,
        paddingBottom: 34,
        gap: 14,
        borderRadius: radius.lg,
        borderColor: border,
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: "States are visible before users need them",
          style: createTextStyle("heading", { fontSize: 28, color: foreground, align: "left" }, activeDesignSystem),
        },
        ...["Loading queue", "Empty results", "Error recovery"].map((label) => ({
          id: createId("card"),
          type: "card" as const,
          title: label,
          body: `${label} has clear copy, a visible next action, and enough contrast for repeated use.`,
          style: createCardStyle({
            backgroundColor: colors.background,
            borderColor: border,
            radius: radius.md,
            shadow: "none",
          }, activeDesignSystem),
        })),
      ],
    },
    {
      id: createId("section"),
      type: "footer",
      name: "Utility footer",
      layout: "footer-columns",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: colors.background,
        paddingTop: 28,
        paddingBottom: 28,
        borderColor: border,
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "body",
          content: `Designed as a ${pageKind} with ${activeDesignSystem.name}.`,
          style: createTextStyle("body", { fontSize: 14, color: muted }, activeDesignSystem),
        },
        {
          id: createId("button"),
          type: "button",
          label: "View audit",
          variant: "outline",
          style: createButtonStyle({
            backgroundColor: card,
            textColor: foreground,
            borderColor: border,
          }, activeDesignSystem),
        },
      ],
    },
  ];

  return {
    id: createId("spec"),
    title,
    description: prompt || "A generated editable product UI design.",
    kind: designKindFromPageKind(pageKind),
    theme,
    viewport: "desktop",
    designSystem: activeDesignSystem,
    page: {
      id: createId("page"),
      type: "page",
      name: `${title} workspace`,
      style: pageStyle,
      sections,
    },
  };
}

export function generateMockDesignSpec(
  prompt: string,
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): DesignSpec {
  const title = titleFromPrompt(prompt);
  const audience = inferAudience(prompt);
  const activeDesignSystem = cloneDesignSystem(designSystem);
  const designRead = buildDesignRead({ prompt, designSystem: activeDesignSystem });

  if (designRead.register === "product") {
    return generateProductMockDesignSpec(prompt, activeDesignSystem, designRead.pageKind);
  }

  const { colors, radius } = activeDesignSystem.tokens;
  const theme = isDarkHexColor(colors.background) ? "dark" : "light";
  const pageStyle = createPageStyle(theme, activeDesignSystem);
  const dark = theme === "dark";
  const foreground = colors.foreground;
  const muted = colors.muted;
  const card = colors.card;
  const border = colors.border;
  const onPrimary = getReadableTextColor(colors.primary);
  const onAccent = getReadableTextColor(colors.accent);
  const onForeground = getReadableTextColor(colors.foreground);
  const pageRules = getPageTypeRules(designRead.pageKind);
  const expressive = designRead.dials.designVariance >= 7;
  const sparse = designRead.dials.visualDensity <= 3;
  const heroBackground = expressive && activeDesignSystem.id === "bold-startup-landing" ? colors.secondary : colors.background;
  const featureTopics = pageRules.recommendedSections
    .filter((section) => !["nav", "hero", "footer"].includes(section))
    .slice(0, sparse ? 2 : 3);

  const sections: SectionNode[] = [
    {
      id: createId("section"),
      type: "header",
      name: "Header",
      layout: "inline",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: card,
        paddingTop: 22,
        paddingBottom: 22,
        paddingX: 28,
        borderColor: border,
        align: "center",
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: title,
          style: createTextStyle("heading", {
            fontSize: 20,
            fontWeight: 850,
            color: foreground,
            maxWidth: 280,
          }, activeDesignSystem),
        },
        {
          id: createId("text"),
          type: "text",
          role: "body",
          content: "Workflows, examples, pricing",
          style: createTextStyle("body", {
            fontSize: 14,
            color: muted,
            align: "center",
          }, activeDesignSystem),
        },
        {
          id: createId("button"),
          type: "button",
          label: "Open preview",
          variant: "primary",
          style: createButtonStyle({}, activeDesignSystem),
        },
      ],
    },
    {
      id: createId("section"),
      type: "hero",
      name: "Hero",
      layout: sparse ? "centered" : "split",
      style: createSectionStyle({
        backgroundType: expressive ? "gradient" : "solid",
        backgroundColor: heroBackground,
        gradientFrom: colors.background,
        gradientTo: heroBackground,
        paddingTop: sparse ? 116 : 88,
        paddingBottom: sparse ? 116 : 96,
        gap: sparse ? 28 : 42,
        align: sparse ? "center" : "left",
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "eyebrow",
          content: activeDesignSystem.name,
          style: createTextStyle("eyebrow", { color: colors.primary }, activeDesignSystem),
        },
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: `A polished ${title} experience for ${audience}`,
          style: createTextStyle("heading", { color: foreground }, activeDesignSystem),
        },
        {
          id: createId("text"),
          type: "text",
          role: "subheading",
          content: rewriteGenericUICopy(
            "Shape the visual direction locally, save versions, and export a clear implementation handoff when the design feels right.",
            pageRules.primaryGoal,
          ),
          style: createTextStyle("subheading", { color: muted }, activeDesignSystem),
        },
        {
          id: createId("button"),
          type: "button",
          label: "Start designing",
          variant: "primary",
          style: createButtonStyle({}, activeDesignSystem),
        },
        {
          id: createId("button"),
          type: "button",
          label: "View examples",
          variant: "outline",
          style: createButtonStyle({
            backgroundColor: card,
            textColor: foreground,
            borderColor: border,
          }, activeDesignSystem),
        },
        {
          id: createId("image"),
          type: "image",
          alt: "Abstract product preview",
          label: "Live editable canvas",
          style: createImageStyle({
            backgroundColor: dark ? colors.secondary : border,
            radius: radius.xl,
            aspectRatio: "wide",
          }, activeDesignSystem),
        },
      ],
    },
    {
      id: createId("section"),
      type: "features",
      name: "Features",
      layout: "cards",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: colors.background,
        gap: 24,
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: "Everything stays editable",
          style: createTextStyle("heading", { fontSize: 40, color: foreground, align: "center" }, activeDesignSystem),
        },
        {
          id: createId("text"),
          type: "text",
          role: "body",
          content: "The design is structured data, so every visible choice can become a local control.",
          style: createTextStyle("body", { color: muted, align: "center", maxWidth: 680 }, activeDesignSystem),
        },
        ...featureTopics.map((feature) => ({
          id: createId("card"),
          type: "card" as const,
          title: feature.charAt(0).toUpperCase() + feature.slice(1),
          body:
            feature.includes("value") || feature.includes("problem")
              ? "AI returns a validated DesignSpec instead of executable code."
              : feature.includes("features") || feature.includes("screens")
                ? "Change colours, spacing, type, radius, shadows, and layout instantly."
                : "Copy JSON, React/Tailwind, or a coding-agent prompt from the same source.",
          style: createCardStyle({
            backgroundColor: card,
            borderColor: border,
            shadow: dark ? "none" : "md",
          }, activeDesignSystem),
        })),
      ],
    },
    {
      id: createId("section"),
      type: "gallery",
      name: "Gallery",
      layout: "grid",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: card,
        borderRadius: radius.xl,
        shadow: dark ? "none" : "sm",
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: "A canvas that feels concrete",
          style: createTextStyle("heading", { fontSize: 36, color: foreground, align: "center" }, activeDesignSystem),
        },
        ...["Hero variant", "Mobile frame", "Component grid"].map((label) => ({
          id: createId("image"),
          type: "image" as const,
          alt: `${label} preview placeholder`,
          label,
          style: createImageStyle({
            backgroundColor: dark ? colors.secondary : colors.background,
            radius: radius.lg,
            aspectRatio: "video",
          }, activeDesignSystem),
        })),
      ],
    },
    {
      id: createId("section"),
      type: "stats",
      name: "Stats",
      layout: "grid",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: colors.primary,
        paddingTop: 64,
        paddingBottom: 64,
        borderRadius: radius.xl,
        gap: 20,
      }, activeDesignSystem),
      elements: [
        ...[
          ["4x", "Faster visual direction"],
          ["0", "Generated code executed"],
          ["100%", "Local manual edits"],
        ].map(([value, label]) => ({
          id: createId("stat"),
          type: "stat" as const,
          value,
          label,
          style: createStatStyle({
            color: onPrimary,
            labelColor: onPrimary,
          }, activeDesignSystem),
        })),
      ],
    },
    {
      id: createId("section"),
      type: "cta",
      name: "CTA",
      layout: "centered",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: colors.foreground,
        paddingTop: 76,
        paddingBottom: 76,
        borderRadius: radius.xl,
        align: "center",
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: "Ready for a sharper build handoff?",
          style: createTextStyle("heading", {
            fontSize: 42,
            color: onForeground,
            align: "center",
            maxWidth: 760,
          }, activeDesignSystem),
        },
        {
          id: createId("text"),
          type: "text",
          role: "body",
          content: "Save this version, refine the selected pieces, then export a clear implementation brief.",
          style: createTextStyle("body", { color: onForeground, align: "center", maxWidth: 680 }, activeDesignSystem),
        },
        {
          id: createId("button"),
          type: "button",
          label: "Copy handoff",
          variant: "secondary",
          style: createButtonStyle({
            backgroundColor: colors.accent,
            textColor: onAccent,
            borderColor: colors.accent,
          }, activeDesignSystem),
        },
      ],
    },
    {
      id: createId("section"),
      type: "footer",
      name: "Footer",
      layout: "footer-columns",
      style: createSectionStyle({
        backgroundType: "solid",
        backgroundColor: card,
        paddingTop: 44,
        paddingBottom: 44,
        borderColor: border,
      }, activeDesignSystem),
      elements: [
        {
          id: createId("text"),
          type: "text",
          role: "heading",
          content: title,
          style: createTextStyle("heading", { fontSize: 20, color: foreground }, activeDesignSystem),
        },
        {
          id: createId("text"),
          type: "text",
          role: "body",
          content: `Generated with ${activeDesignSystem.name}.`,
          style: createTextStyle("body", { fontSize: 14, color: muted }, activeDesignSystem),
        },
      ],
    },
  ];

  return {
    id: createId("spec"),
    title,
    description: prompt || "A generated editable UI design.",
    kind: "landing-page",
    theme,
    viewport: "desktop",
    designSystem: activeDesignSystem,
    page: {
      id: createId("page"),
      type: "page",
      name: `${title} page`,
      style: pageStyle,
      sections,
    },
  };
}
