import type { DesignSpec, ElementNode, SectionNode } from "@/lib/design-schema";
import { inferDesignRegister } from "@/lib/design-guidance/design-register";
import { normalizePageKind } from "@/lib/design-guidance/page-type-rules";
import { lintCopyText, lintDuplicateCtaLabels } from "@/lib/design-lint/lint-copy";
import {
  scoreDesignLintIssues,
  sortDesignLintIssues,
  type DesignLintIssue,
  type DesignLintSeverity,
} from "@/lib/design-lint/design-lint-types";
import {
  getButtonStyle,
  getCardStyle,
  getSectionColumns,
  getSectionStyle,
  getTextStyle,
} from "@/lib/responsive-design";

type Rgb = { r: number; g: number; b: number };

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function addIssue(issues: DesignLintIssue[], input: Omit<DesignLintIssue, "id"> & { idBase: string }) {
  issues.push({
    id: `lint-${slugify(input.category)}-${slugify(input.idBase)}-${issues.length + 1}`,
    severity: input.severity,
    category: input.category,
    message: input.message,
    nodeId: input.nodeId,
    sectionId: input.sectionId,
    suggestedFix: input.suggestedFix,
  });
}

function normalizeHex(value: string | undefined) {
  if (!value) return null;
  const color = value.trim();
  const short = /^#([0-9a-f]{3})$/i.exec(color);
  if (short) {
    return `#${short[1]
      .split("")
      .map((part) => `${part}${part}`)
      .join("")}`;
  }
  return /^#[0-9a-f]{6}$/i.test(color) ? color : null;
}

function hexToRgb(value: string | undefined): Rgb | null {
  const hex = normalizeHex(value);
  if (!hex) return null;
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function linear(value: number) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: Rgb) {
  return 0.2126 * linear(rgb.r) + 0.7152 * linear(rgb.g) + 0.0722 * linear(rgb.b);
}

function contrastRatio(foreground: string | undefined, background: string | undefined) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return null;
  const lighter = Math.max(luminance(fg), luminance(bg));
  const darker = Math.min(luminance(fg), luminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

function sectionBackground(spec: DesignSpec, section: SectionNode) {
  const style = getSectionStyle(section, "desktop");
  if (style.backgroundType === "solid" && style.backgroundColor) return style.backgroundColor;
  if (style.backgroundType === "gradient" && style.gradientFrom) return style.gradientFrom;
  return spec.page.style.backgroundColor;
}

function allElements(spec: DesignSpec) {
  return spec.page.sections.flatMap((section) =>
    section.elements.flatMap((element) => (element.type === "card" && element.image ? [element, element.image] : [element])),
  );
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function textValue(element: ElementNode) {
  if (element.type === "text") return element.content;
  if (element.type === "button") return element.label;
  if (element.type === "card") return `${element.title} ${element.body}`;
  if (element.type === "image") return `${element.label ?? ""} ${element.alt}`;
  return `${element.value} ${element.label}`;
}

function severityForContrast(ratio: number): DesignLintSeverity {
  return ratio < 3 ? "high" : "medium";
}

export function lintDesignSpec(spec: DesignSpec) {
  const issues: DesignLintIssue[] = [];
  const pageKind = normalizePageKind(spec.kind);
  const register = inferDesignRegister({
    prompt: `${spec.title} ${spec.description}`,
    pageKind,
    designSystemName: spec.designSystem.name,
  });
  const sections = spec.page.sections;
  const elements = allElements(spec);
  const hero = sections.find((section) => section.type === "hero");

  const layoutCounts = countBy(sections.map((section) => section.layout));
  for (const [layout, count] of Object.entries(layoutCounts)) {
    if (count >= 4) {
      addIssue(issues, {
        idBase: layout,
        severity: "medium",
        category: "layout",
        message: `The design repeats the "${layout}" layout across ${count} sections.`,
        suggestedFix: "Vary section layout families when section purpose changes.",
      });
    }
  }

  const cardGridCount = sections.filter((section) => section.layout === "cards" || section.elements.some((element) => element.type === "card")).length;
  if (cardGridCount >= 4) {
    addIssue(issues, {
      idBase: "card-grid-count",
      severity: "medium",
      category: "cards",
      message: "The design leans heavily on card-grid sections.",
      suggestedFix: "Replace some cards with typography, dividers, media, or contrast bands.",
    });
  }

  if (hero) {
    const heroTexts = hero.elements.filter((element) => element.type === "text");
    const heroButtons = hero.elements.filter((element) => element.type === "button");
    const heroSubtext = heroTexts.find((element) => element.role === "subheading" || element.role === "body");

    if (heroTexts.length > 4) {
      addIssue(issues, {
        idBase: hero.id,
        severity: "medium",
        category: "hero",
        sectionId: hero.id,
        message: "Hero has too many text elements.",
        suggestedFix: "Keep the hero to a sharp heading, short support copy, and one clear action group.",
      });
    }

    if (heroSubtext && heroSubtext.content.split(/\s+/).filter(Boolean).length > 28) {
      addIssue(issues, {
        idBase: heroSubtext.id,
        severity: "medium",
        category: "hero",
        sectionId: hero.id,
        nodeId: heroSubtext.id,
        message: "Hero support copy is long.",
        suggestedFix: "Aim for under 20 words where possible.",
      });
    }

    if (heroButtons.length > 2) {
      addIssue(issues, {
        idBase: `${hero.id}-buttons`,
        severity: "medium",
        category: "hero",
        sectionId: hero.id,
        message: "Hero has too many CTA buttons.",
        suggestedFix: "Use one primary CTA and at most one secondary action.",
      });
    }
  }

  for (const section of sections) {
    const sectionName = section.name.trim().toLowerCase();
    if (sections.filter((item) => item.name.trim().toLowerCase() === sectionName).length > 1) {
      addIssue(issues, {
        idBase: `${section.id}-name`,
        severity: "low",
        category: "layout",
        sectionId: section.id,
        message: `Section name "${section.name}" is repeated.`,
        suggestedFix: "Give sections names that reflect their purpose.",
      });
    }

    if ((section.type === "features" || section.type === "gallery" || section.type === "stats") && getSectionColumns(section, "mobile") > 1) {
      addIssue(issues, {
        idBase: `${section.id}-mobile-columns`,
        severity: "high",
        category: "responsiveness",
        sectionId: section.id,
        message: "Multi-column section does not collapse to one column on mobile.",
        suggestedFix: "Set mobile columns to one.",
      });
    }

    for (const element of section.elements) {
      issues.push(...lintCopyText({ value: textValue(element), nodeId: element.id, sectionId: section.id, context: spec.title }));

      if (element.type === "text") {
        const style = getTextStyle(element, "desktop");
        const ratio = contrastRatio(style.color, sectionBackground(spec, section));
        if (style.fontSize < 13) {
          addIssue(issues, {
            idBase: element.id,
            severity: "medium",
            category: "typography",
            nodeId: element.id,
            sectionId: section.id,
            message: "Text size is very small.",
            suggestedFix: "Use at least 14px for normal readable text.",
          });
        }
        if ((style.maxWidth ?? 0) > 840) {
          addIssue(issues, {
            idBase: `${element.id}-line-length`,
            severity: "low",
            category: "typography",
            nodeId: element.id,
            sectionId: section.id,
            message: "Text line length may be too wide.",
            suggestedFix: "Keep body line length around 65-75 characters.",
          });
        }
        if (ratio !== null && ratio < 4.5 && element.role !== "heading") {
          addIssue(issues, {
            idBase: `${element.id}-contrast`,
            severity: severityForContrast(ratio),
            category: "colour",
            nodeId: element.id,
            sectionId: section.id,
            message: `Text contrast is weak at ${ratio.toFixed(1)}:1.`,
            suggestedFix: "Use a stronger foreground colour against this background.",
          });
        }
      }

      if (element.type === "button") {
        const style = getButtonStyle(element, "desktop");
        const ratio = contrastRatio(style.textColor, style.backgroundColor);
        if (element.label.length > 28) {
          addIssue(issues, {
            idBase: element.id,
            severity: "low",
            category: "copy",
            nodeId: element.id,
            sectionId: section.id,
            message: "Button label is long and may wrap.",
            suggestedFix: "Use a shorter action label.",
          });
        }
        if (ratio !== null && ratio < 4.5) {
          addIssue(issues, {
            idBase: `${element.id}-button-contrast`,
            severity: severityForContrast(ratio),
            category: "accessibility",
            nodeId: element.id,
            sectionId: section.id,
            message: `Button contrast is weak at ${ratio.toFixed(1)}:1.`,
            suggestedFix: "Use a readable button text colour.",
          });
        }
      }

      if (element.type === "card") {
        const style = getCardStyle(element, "desktop");
        if (style.radius > 24 && spec.designSystem.tokens.radius.xl <= 24) {
          addIssue(issues, {
            idBase: `${element.id}-radius`,
            severity: "low",
            category: "cards",
            nodeId: element.id,
            sectionId: section.id,
            message: "Card radius is large for this design system.",
            suggestedFix: "Snap card radius to the selected design system scale.",
          });
        }
        if (style.shadow === "xl" && style.borderColor) {
          addIssue(issues, {
            idBase: `${element.id}-shadow-border`,
            severity: "low",
            category: "cards",
            nodeId: element.id,
            sectionId: section.id,
            message: "Card combines a heavy shadow with a border.",
            suggestedFix: "Use either border or stronger shadow for most cards.",
          });
        }
      }
    }
  }

  const eyebrowCount = elements.filter((element) => element.type === "text" && element.role === "eyebrow").length;
  if (eyebrowCount >= Math.max(4, sections.length - 1)) {
    addIssue(issues, {
      idBase: "eyebrow-count",
      severity: "low",
      category: "ai-tell",
      message: "Most sections use eyebrow labels.",
      suggestedFix: "Reserve eyebrow labels for sections that need navigation or context.",
    });
  }

  if (register === "brand" && !sections.some((section) => section.type === "footer")) {
    addIssue(issues, {
      idBase: "missing-footer",
      severity: "medium",
      category: "layout",
      message: "Brand page is missing a footer.",
      suggestedFix: "Add a simple footer with brand, links, or contact details.",
    });
  }

  if (register === "product") {
    const stateWords = elements.map(textValue).join(" ").toLowerCase();
    if (!/empty|loading|error|failed|no results|saved|success/.test(stateWords)) {
      addIssue(issues, {
        idBase: "missing-product-states",
        severity: "low",
        category: "accessibility",
        message: "Product UI does not mention loading, empty, success, or error states.",
        suggestedFix: "Represent state-aware UI where the schema supports it.",
      });
    }
  }

  const allButtons = sections.flatMap((section) =>
    section.elements
      .filter((element) => element.type === "button")
      .map((button) => ({ id: button.id, label: button.label, sectionId: section.id })),
  );
  issues.push(...lintDuplicateCtaLabels(allButtons));

  const accentColors = new Set(
    elements
      .flatMap((element) => {
        if (element.type === "button") return [normalizeHex(getButtonStyle(element, "desktop").backgroundColor)];
        if (element.type === "text") return [normalizeHex(getTextStyle(element, "desktop").color)];
        return [];
      })
      .filter((value): value is string => Boolean(value)),
  );
  if (accentColors.size > 7) {
    addIssue(issues, {
      idBase: "accent-colors",
      severity: "medium",
      category: "design-system",
      message: "The design uses many distinct accent/text colours.",
      suggestedFix: "Constrain accents to the selected design system palette.",
    });
  }

  const sorted = sortDesignLintIssues(issues).slice(0, 30);
  return {
    issues: sorted,
    score: scoreDesignLintIssues(sorted),
  };
}
