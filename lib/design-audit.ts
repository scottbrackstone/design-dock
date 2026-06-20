import { z } from "zod";
import type {
  ButtonStyle,
  CardStyle,
  DesignSpec,
  ElementNode,
  ImageStyle,
  SectionNode,
  SectionStyle,
  StatStyle,
  TextElement,
  TextStyle,
  Viewport,
} from "@/lib/design-schema";
import {
  updateResponsiveButtonFullWidth,
  updateResponsiveButtonStyle,
  updateResponsiveCardStyle,
  updateResponsiveImageStyle,
  updateResponsiveSectionColumns,
  updateResponsiveSectionStyle,
  updateResponsiveStatStyle,
  updateResponsiveTextStyle,
} from "@/lib/design-actions";
import {
  getButtonFullWidth,
  getButtonStyle,
  getCardStyle,
  getImageStyle,
  getSectionButtonLayout,
  getSectionColumns,
  getSectionStyle,
  getStatStyle,
  getTextStyle,
} from "@/lib/responsive-design";
import { lintDesignSpec } from "@/lib/design-lint/lint-design-spec";
import type { DesignLintIssue } from "@/lib/design-lint/design-lint-types";

export const auditSeveritySchema = z.enum(["low", "medium", "high"]);

export const aiAuditIssueSchema = z
  .object({
    severity: auditSeveritySchema,
    category: z.string().min(1).max(80),
    sectionId: z.string().min(1).optional(),
    nodeId: z.string().min(1).optional(),
    title: z.string().min(1).max(120),
    explanation: z.string().min(1).max(700),
    suggestedFix: z.string().min(1).max(700),
  })
  .strict();

export const aiAuditResponseSchema = z
  .object({
    issues: z.array(aiAuditIssueSchema).max(12),
  })
  .strict();

export type AuditSeverity = z.infer<typeof auditSeveritySchema>;

export type AuditFix =
  | {
      type: "text-style";
      nodeId: string;
      viewport: Viewport;
      patch: Partial<TextStyle>;
    }
  | {
      type: "button-style";
      nodeId: string;
      viewport: Viewport;
      patch: Partial<ButtonStyle>;
    }
  | {
      type: "button-full-width";
      nodeId: string;
      viewport: Viewport;
      fullWidth: boolean;
    }
  | {
      type: "card-style";
      nodeId: string;
      viewport: Viewport;
      patch: Partial<CardStyle>;
    }
  | {
      type: "image-style";
      nodeId: string;
      viewport: Viewport;
      patch: Partial<ImageStyle>;
    }
  | {
      type: "section-columns";
      sectionId: string;
      viewport: Viewport;
      columns: number;
    }
  | {
      type: "section-style";
      sectionId: string;
      viewport: Viewport;
      patch: Partial<SectionStyle>;
    }
  | {
      type: "stat-style";
      nodeId: string;
      viewport: Viewport;
      patch: Partial<StatStyle>;
    };

export type AuditIssue = {
  id: string;
  source: "local" | "ai";
  severity: AuditSeverity;
  category: string;
  sectionId?: string;
  nodeId?: string;
  title: string;
  explanation: string;
  suggestedFix: string;
  fix?: AuditFix;
};

type IssueInput = Omit<AuditIssue, "id" | "source">;

type Rgb = {
  r: number;
  g: number;
  b: number;
};

const severityRank: Record<AuditSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const weakButtonLabels = new Set(["click here", "learn more", "more", "go", "submit", "next", "continue"]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function addIssue(issues: AuditIssue[], input: IssueInput) {
  const target = input.nodeId ?? input.sectionId ?? input.title;
  const id = `local-${slugify(input.category)}-${slugify(target)}-${issues.length + 1}`;
  issues.push({ ...input, id, source: "local" });
}

function normalizeHexColor(value: string | undefined) {
  const color = value?.trim();
  if (!color) return null;

  const shortHex = /^#([0-9a-f]{3})$/i.exec(color);
  if (shortHex) {
    return `#${shortHex[1]
      .split("")
      .map((part) => `${part}${part}`)
      .join("")}`;
  }

  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  return null;
}

function hexToRgb(value: string | undefined): Rgb | null {
  const color = normalizeHexColor(value);
  if (!color) return null;

  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
  };
}

function linearChannel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color: Rgb) {
  return 0.2126 * linearChannel(color.r) + 0.7152 * linearChannel(color.g) + 0.0722 * linearChannel(color.b);
}

function contrastRatio(foreground: string | undefined, background: string | undefined) {
  const foregroundRgb = hexToRgb(foreground);
  const backgroundRgb = hexToRgb(background);
  if (!foregroundRgb || !backgroundRgb) return null;

  const lighter = Math.max(luminance(foregroundRgb), luminance(backgroundRgb));
  const darker = Math.min(luminance(foregroundRgb), luminance(backgroundRgb));
  return (lighter + 0.05) / (darker + 0.05);
}

function bestTextColor(background: string | undefined, candidates: string[]) {
  return candidates.reduce(
    (best, candidate) => {
      const ratio = contrastRatio(candidate, background) ?? 0;
      return ratio > best.ratio ? { color: candidate, ratio } : best;
    },
    { color: "#111827", ratio: 0 },
  ).color;
}

function sectionBackground(spec: DesignSpec, section: SectionNode, viewport: Viewport) {
  const style = getSectionStyle(section, viewport);
  if (style.backgroundType === "solid" && style.backgroundColor) return style.backgroundColor;
  if (style.backgroundType === "gradient" && style.gradientFrom) return style.gradientFrom;
  return spec.page.style.backgroundColor;
}

function textContrastMinimum(element: TextElement, style: TextStyle) {
  const isLarge = style.fontSize >= 24 || (style.fontSize >= 18 && style.fontWeight >= 700);
  return element.role === "caption" || isLarge ? 3 : 4.5;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function nearestToken(value: number, tokens: number[]) {
  return tokens.reduce((best, token) => (Math.abs(token - value) < Math.abs(best - value) ? token : best), tokens[0]);
}

function summarizeText(value: string, limit = 140) {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > limit ? `${compact.slice(0, limit - 1)}...` : compact;
}

function sectionButtons(section: SectionNode) {
  return section.elements.filter((element) => element.type === "button");
}

function allElements(spec: DesignSpec) {
  return spec.page.sections.flatMap((section) =>
    section.elements.flatMap((element) => (element.type === "card" && element.image ? [element, element.image] : [element])),
  );
}

function checkStructure(spec: DesignSpec, issues: AuditIssue[]) {
  const sections = spec.page.sections;
  const headerIndex = sections.findIndex((section) => section.type === "header");
  const heroIndex = sections.findIndex((section) => section.type === "hero");
  const footerIndex = sections.findIndex((section) => section.type === "footer");
  const ctaIndex = sections.findIndex((section) => section.type === "cta");

  if (headerIndex === -1) {
    addIssue(issues, {
      severity: "medium",
      category: "Missing header",
      title: "No header section",
      explanation: "The page does not include a header, so navigation and product identity may feel less anchored.",
      suggestedFix: "Add a compact header with the product name and one primary navigation action.",
    });
  } else if (headerIndex > 0) {
    addIssue(issues, {
      severity: "low",
      category: "Weak section order",
      sectionId: sections[headerIndex].id,
      title: "Header is not first",
      explanation: "A header works best as the first section so users immediately understand where they are.",
      suggestedFix: "Move the header above the current first section.",
    });
  }

  if (heroIndex === -1) {
    addIssue(issues, {
      severity: "medium",
      category: "Visual hierarchy",
      title: "No hero section",
      explanation: "The page is missing a clear opening section for the main promise and primary action.",
      suggestedFix: "Add or convert the first content section into a focused hero with a strong heading and one main CTA.",
    });
  } else if (heroIndex > 1) {
    addIssue(issues, {
      severity: "medium",
      category: "Weak section order",
      sectionId: sections[heroIndex].id,
      title: "Hero appears too late",
      explanation: "The main value proposition appears after too much supporting content.",
      suggestedFix: "Move the hero near the top, ideally after the header.",
    });
  }

  if (footerIndex === -1) {
    addIssue(issues, {
      severity: "low",
      category: "Missing footer",
      title: "No footer section",
      explanation: "A footer gives the page a natural ending and a place for secondary links or trust details.",
      suggestedFix: "Add a simple footer with brand, contact, and secondary navigation details.",
    });
  } else if (footerIndex !== sections.length - 1) {
    addIssue(issues, {
      severity: "medium",
      category: "Weak section order",
      sectionId: sections[footerIndex].id,
      title: "Footer is not last",
      explanation: "Content after the footer can make the page feel unfinished or oddly ordered.",
      suggestedFix: "Move the footer to the bottom of the page.",
    });
  }

  if (ctaIndex !== -1 && heroIndex !== -1 && ctaIndex < heroIndex) {
    addIssue(issues, {
      severity: "medium",
      category: "Weak section order",
      sectionId: sections[ctaIndex].id,
      title: "CTA appears before the hero",
      explanation: "A conversion section before the main pitch asks users to act before they understand the offer.",
      suggestedFix: "Place the CTA after the hero and proof sections.",
    });
  }
}

function checkHierarchy(spec: DesignSpec, issues: AuditIssue[]) {
  const hero = spec.page.sections.find((section) => section.type === "hero") ?? spec.page.sections[0];
  if (!hero) return;

  const heroHeading = hero.elements.find(
    (element): element is TextElement => element.type === "text" && element.role === "heading",
  );

  if (!heroHeading) {
    addIssue(issues, {
      severity: "high",
      category: "Visual hierarchy",
      sectionId: hero.id,
      title: "Opening section has no heading",
      explanation: "The first major section needs a dominant heading to establish hierarchy.",
      suggestedFix: "Add a heading or convert the strongest text in this section to a heading.",
    });
    return;
  }

  const heroHeadingStyle = getTextStyle(heroHeading, "desktop");
  if (heroHeadingStyle.fontSize < 36) {
    addIssue(issues, {
      severity: "medium",
      category: "Visual hierarchy",
      sectionId: hero.id,
      nodeId: heroHeading.id,
      title: "Hero heading is too quiet",
      explanation: "The primary heading is close to ordinary content size, which weakens the first impression.",
      suggestedFix: "Increase the desktop heading size to create a clearer focal point.",
      fix: {
        type: "text-style",
        nodeId: heroHeading.id,
        viewport: "desktop",
        patch: { fontSize: 48, lineHeight: 1.08 },
      },
    });
  }

  const headings = allElements(spec).filter(
    (element): element is TextElement => element.type === "text" && element.role === "heading",
  );
  const bodyText = allElements(spec).filter(
    (element): element is TextElement => element.type === "text" && (element.role === "body" || element.role === "subheading"),
  );
  const largestHeading = Math.max(...headings.map((element) => getTextStyle(element, "desktop").fontSize), 0);
  const largestBody = Math.max(...bodyText.map((element) => getTextStyle(element, "desktop").fontSize), 0);

  if (largestHeading > 0 && largestBody > 0 && largestHeading - largestBody < 10) {
    addIssue(issues, {
      severity: "medium",
      category: "Visual hierarchy",
      nodeId: heroHeading.id,
      sectionId: hero.id,
      title: "Heading and body sizes are too close",
      explanation: "Headings need more scale contrast from supporting copy for the page to scan quickly.",
      suggestedFix: "Increase the primary heading size or reduce oversized supporting text.",
      fix: {
        type: "text-style",
        nodeId: heroHeading.id,
        viewport: "desktop",
        patch: { fontSize: Math.max(largestBody + 16, 44), lineHeight: 1.1 },
      },
    });
  }
}

function checkSpacing(spec: DesignSpec, issues: AuditIssue[]) {
  const contentSections = spec.page.sections.filter((section) => section.type !== "header" && section.type !== "footer");
  const paddingTotals = contentSections.map((section) => {
    const style = getSectionStyle(section, "desktop");
    return style.paddingTop + style.paddingBottom;
  });
  const typicalPadding = paddingTotals.length > 2 ? median(paddingTotals) : null;
  const spacingTokens = [32, 40, 48, 56, 64, 80, 96, 120, 144];

  for (const section of contentSections) {
    const style = getSectionStyle(section, "desktop");

    if (style.paddingTop < 32 || style.paddingBottom < 32) {
      addIssue(issues, {
        severity: "medium",
        category: "Spacing consistency",
        sectionId: section.id,
        title: "Section spacing is cramped",
        explanation: "This section has very little vertical padding, so its content may blend into neighboring sections.",
        suggestedFix: "Give the section a more deliberate vertical rhythm.",
        fix: {
          type: "section-style",
          sectionId: section.id,
          viewport: "desktop",
          patch: {
            paddingTop: Math.max(style.paddingTop, 56),
            paddingBottom: Math.max(style.paddingBottom, 56),
          },
        },
      });
    }

    if (section.elements.length > 2 && style.gap < 12) {
      addIssue(issues, {
        severity: "medium",
        category: "Spacing consistency",
        sectionId: section.id,
        title: "Element gap is too tight",
        explanation: "Multiple elements in this section have too little breathing room.",
        suggestedFix: "Increase the section gap so related elements remain scannable.",
        fix: {
          type: "section-style",
          sectionId: section.id,
          viewport: "desktop",
          patch: { gap: 24 },
        },
      });
    }

    if (typicalPadding && Math.abs(style.paddingTop + style.paddingBottom - typicalPadding) > 96) {
      const snapped = nearestToken(typicalPadding / 2, spacingTokens);
      addIssue(issues, {
        severity: "low",
        category: "Spacing consistency",
        sectionId: section.id,
        title: "Section rhythm is inconsistent",
        explanation: "This section's vertical padding is far from the rest of the page.",
        suggestedFix: "Snap the section padding closer to the page's dominant rhythm.",
        fix: {
          type: "section-style",
          sectionId: section.id,
          viewport: "desktop",
          patch: { paddingTop: snapped, paddingBottom: snapped },
        },
      });
    }
  }
}

function checkContrast(spec: DesignSpec, issues: AuditIssue[]) {
  const candidates = [spec.designSystem.tokens.colors.foreground, spec.page.style.textColor, "#111827", "#ffffff"];
  let contrastIssues = 0;

  for (const section of spec.page.sections) {
    const background = sectionBackground(spec, section, "desktop");

    for (const element of section.elements) {
      if (contrastIssues >= 5) return;

      if (element.type === "text") {
        const style = getTextStyle(element, "desktop");
        const ratio = contrastRatio(style.color, background);
        const minimum = textContrastMinimum(element, style);

        if (ratio !== null && ratio < minimum) {
          contrastIssues += 1;
          addIssue(issues, {
            severity: ratio < 3 ? "high" : "medium",
            category: "Colour contrast",
            sectionId: section.id,
            nodeId: element.id,
            title: "Text contrast is weak",
            explanation: `This ${element.role} text has a contrast ratio of ${ratio.toFixed(1)}:1 against its section background.`,
            suggestedFix: "Use a stronger foreground colour for this text.",
            fix: {
              type: "text-style",
              nodeId: element.id,
              viewport: "desktop",
              patch: { color: bestTextColor(background, candidates) },
            },
          });
        }
      }

      if (element.type === "button") {
        const style = getButtonStyle(element, "desktop");
        const ratio = contrastRatio(style.textColor, style.backgroundColor);

        if (ratio !== null && ratio < 4.5) {
          contrastIssues += 1;
          addIssue(issues, {
            severity: ratio < 3 ? "high" : "medium",
            category: "Colour contrast",
            sectionId: section.id,
            nodeId: element.id,
            title: "Button text contrast is weak",
            explanation: `The button label has a contrast ratio of ${ratio.toFixed(1)}:1 against its fill colour.`,
            suggestedFix: "Use a readable button text colour against the current button background.",
            fix: {
              type: "button-style",
              nodeId: element.id,
              viewport: "desktop",
              patch: { textColor: bestTextColor(style.backgroundColor, candidates) },
            },
          });
        }
      }

      if (element.type === "stat") {
        const style = getStatStyle(element, "desktop");
        const valueRatio = contrastRatio(style.color, background);
        const labelRatio = contrastRatio(style.labelColor, background);

        if (valueRatio !== null && labelRatio !== null && Math.min(valueRatio, labelRatio) < 4.5) {
          contrastIssues += 1;
          addIssue(issues, {
            severity: Math.min(valueRatio, labelRatio) < 3 ? "high" : "medium",
            category: "Colour contrast",
            sectionId: section.id,
            nodeId: element.id,
            title: "Stat contrast is weak",
            explanation: "The stat value or label may be hard to read against its section background.",
            suggestedFix: "Use stronger stat colours that preserve the current hierarchy.",
            fix: {
              type: "stat-style",
              nodeId: element.id,
              viewport: "desktop",
              patch: {
                color: bestTextColor(background, candidates),
                labelColor: bestTextColor(background, candidates),
              },
            },
          });
        }
      }
    }
  }
}

function checkButtons(spec: DesignSpec, issues: AuditIssue[]) {
  const primaryButtons = allElements(spec).filter((element) => element.type === "button" && element.variant === "primary");

  if (primaryButtons.length > 4) {
    addIssue(issues, {
      severity: "medium",
      category: "Too many competing CTAs",
      title: "Too many primary buttons",
      explanation: "Several primary buttons compete for attention, which can make the intended next step feel unclear.",
      suggestedFix: "Reserve primary styling for the most important action in each major decision point.",
    });
  }

  for (const section of spec.page.sections) {
    const buttons = sectionButtons(section);
    const sectionPrimaryButtons = buttons.filter((button) => button.variant === "primary");

    if ((section.type === "hero" || section.type === "cta") && buttons.length > 2) {
      addIssue(issues, {
        severity: "medium",
        category: "Too many competing CTAs",
        sectionId: section.id,
        title: "CTA cluster has too many actions",
        explanation: "Hero and CTA sections work best with one primary action and at most one secondary action.",
        suggestedFix: "Remove or demote extra actions so the primary path is obvious.",
      });
    }

    if (sectionPrimaryButtons.length > 1) {
      addIssue(issues, {
        severity: "medium",
        category: "Too many competing CTAs",
        sectionId: section.id,
        nodeId: sectionPrimaryButtons[1].id,
        title: "Multiple primary actions in one section",
        explanation: "More than one primary CTA in a section creates ambiguity about the intended action.",
        suggestedFix: "Keep one primary button and change the rest to secondary or ghost style.",
      });
    }

    for (const button of buttons) {
      const label = button.label.trim();
      const normalized = label.toLowerCase();

      if (weakButtonLabels.has(normalized)) {
        addIssue(issues, {
          severity: "low",
          category: "Button clarity",
          sectionId: section.id,
          nodeId: button.id,
          title: "Button label is generic",
          explanation: `"${label}" does not describe the outcome of the action.`,
          suggestedFix: "Use a specific verb phrase such as 'Create workspace', 'View pricing', or 'Book a demo'.",
        });
      }

      if (label.length > 32) {
        addIssue(issues, {
          severity: "low",
          category: "Button clarity",
          sectionId: section.id,
          nodeId: button.id,
          title: "Button label is long",
          explanation: "Long CTA labels are harder to scan and can wrap awkwardly on small screens.",
          suggestedFix: "Shorten the label to a compact action phrase.",
        });
      }
    }
  }
}

function checkTextBlocks(spec: DesignSpec, issues: AuditIssue[]) {
  for (const section of spec.page.sections) {
    for (const element of section.elements) {
      if (element.type === "text") {
        const style = getTextStyle(element, "desktop");
        const longText = element.content.length > 220 && (element.role === "body" || element.role === "subheading");
        const wideText = (style.maxWidth ?? 0) > 820;

        if (longText || wideText) {
          addIssue(issues, {
            severity: longText ? "medium" : "low",
            category: "Long text blocks",
            sectionId: section.id,
            nodeId: element.id,
            title: longText ? "Text block is long" : "Text line length is wide",
            explanation: longText
              ? "This text may be difficult to scan as a single uninterrupted block."
              : "Wide line lengths can slow reading and weaken the visual column.",
            suggestedFix: "Constrain the text width so the block reads more comfortably.",
            fix: {
              type: "text-style",
              nodeId: element.id,
              viewport: "desktop",
              patch: { maxWidth: 680, lineHeight: Math.max(style.lineHeight, 1.5) },
            },
          });
        }
      }

      if (element.type === "card" && element.body.length > 240) {
        addIssue(issues, {
          severity: "low",
          category: "Long text blocks",
          sectionId: section.id,
          nodeId: element.id,
          title: "Card body is long",
          explanation: "Cards are most effective when each one carries a tight, scannable idea.",
          suggestedFix: "Shorten the card body or split the content into two cards.",
        });
      }
    }
  }
}

function checkSurfaceConsistency(spec: DesignSpec, issues: AuditIssue[]) {
  const cards = allElements(spec).filter((element) => element.type === "card");
  const cardRadii = cards.map((card) => getCardStyle(card, "desktop").radius);
  const cardShadows = cards.map((card) => getCardStyle(card, "desktop").shadow);
  const uniqueCardRadii = new Set(cardRadii);
  const uniqueCardShadows = new Set(cardShadows);

  if (cards.length >= 3 && uniqueCardRadii.size > 2) {
    const targetRadius = spec.designSystem.tokens.radius.lg;
    const outlier = cards.find((card) => getCardStyle(card, "desktop").radius !== targetRadius) ?? cards[0];
    addIssue(issues, {
      severity: "low",
      category: "Radius and shadow",
      nodeId: outlier.id,
      title: "Card radius is inconsistent",
      explanation: "Cards use several different corner radii, which can make the design system feel less intentional.",
      suggestedFix: "Snap this card radius to the selected design system's large radius token.",
      fix: {
        type: "card-style",
        nodeId: outlier.id,
        viewport: "desktop",
        patch: { radius: targetRadius },
      },
    });
  }

  if (cards.length >= 3 && uniqueCardShadows.size > 2) {
    const outlier = cards.find((card) => getCardStyle(card, "desktop").shadow !== "md") ?? cards[0];
    addIssue(issues, {
      severity: "low",
      category: "Radius and shadow",
      nodeId: outlier.id,
      title: "Card shadows feel inconsistent",
      explanation: "Cards mix several shadow levels, which can create noisy depth cues.",
      suggestedFix: "Normalize this card to a moderate shadow level.",
      fix: {
        type: "card-style",
        nodeId: outlier.id,
        viewport: "desktop",
        patch: { shadow: "md" },
      },
    });
  }

  for (const section of spec.page.sections) {
    const style = getSectionStyle(section, "desktop");
    if (style.borderRadius > spec.designSystem.tokens.radius.xl * 1.75 && section.type !== "hero") {
      addIssue(issues, {
        severity: "low",
        category: "Radius and shadow",
        sectionId: section.id,
        title: "Section radius is oversized",
        explanation: "This section's corner radius is much larger than the design system tokens.",
        suggestedFix: "Snap the section radius to the selected design system's extra-large radius token.",
        fix: {
          type: "section-style",
          sectionId: section.id,
          viewport: "desktop",
          patch: { borderRadius: spec.designSystem.tokens.radius.xl },
        },
      });
    }
  }
}

function checkMobileLayout(spec: DesignSpec, issues: AuditIssue[]) {
  for (const section of spec.page.sections) {
    const mobileStyle = getSectionStyle(section, "mobile");
    const mobileColumns = getSectionColumns(section, "mobile");

    if ((section.type === "features" || section.type === "gallery" || section.type === "stats") && mobileColumns > 1) {
      addIssue(issues, {
        severity: "high",
        category: "Mobile layout",
        sectionId: section.id,
        title: "Mobile grid has multiple columns",
        explanation: "Feature, gallery, and stat grids are easier to scan on phones when they collapse to one column.",
        suggestedFix: "Set this section's mobile columns to one.",
        fix: {
          type: "section-columns",
          sectionId: section.id,
          viewport: "mobile",
          columns: 1,
        },
      });
    }

    if (mobileStyle.paddingX > 40) {
      addIssue(issues, {
        severity: "medium",
        category: "Mobile layout",
        sectionId: section.id,
        title: "Mobile horizontal padding is large",
        explanation: "Large side padding can leave too little room for content on smaller screens.",
        suggestedFix: "Reduce mobile horizontal padding to a comfortable compact value.",
        fix: {
          type: "section-style",
          sectionId: section.id,
          viewport: "mobile",
          patch: { paddingX: 24 },
        },
      });
    }

    const buttons = sectionButtons(section);
    if (buttons.length > 1 && getSectionButtonLayout(section, "mobile") === "stack") {
      const narrowButton = buttons.find((button) => !getButtonFullWidth(button, "mobile"));
      if (narrowButton) {
        addIssue(issues, {
          severity: "low",
          category: "Mobile layout",
          sectionId: section.id,
          nodeId: narrowButton.id,
          title: "Stacked mobile button is not full width",
          explanation: "Stacked CTA groups are easier to tap when each button uses the available width.",
          suggestedFix: "Make this button full width on mobile.",
          fix: {
            type: "button-full-width",
            nodeId: narrowButton.id,
            viewport: "mobile",
            fullWidth: true,
          },
        });
      }
    }

    for (const element of section.elements) {
      if (element.type === "text") {
        const style = getTextStyle(element, "mobile");

        if (element.role === "heading" && style.fontSize > 52) {
          addIssue(issues, {
            severity: "medium",
            category: "Mobile layout",
            sectionId: section.id,
            nodeId: element.id,
            title: "Mobile heading may overflow",
            explanation: "Very large mobile headings can wrap awkwardly or crowd the first viewport.",
            suggestedFix: "Set a calmer mobile heading size.",
            fix: {
              type: "text-style",
              nodeId: element.id,
              viewport: "mobile",
              patch: { fontSize: 40, lineHeight: 1.12 },
            },
          });
        }

        if ((element.role === "body" || element.role === "caption") && style.fontSize < 14) {
          addIssue(issues, {
            severity: "low",
            category: "Mobile layout",
            sectionId: section.id,
            nodeId: element.id,
            title: "Mobile text is small",
            explanation: "Small text can be hard to read on phones.",
            suggestedFix: "Raise the mobile text size to at least 14px.",
            fix: {
              type: "text-style",
              nodeId: element.id,
              viewport: "mobile",
              patch: { fontSize: 14 },
            },
          });
        }
      }

      if (element.type === "card") {
        const style = getCardStyle(element, "mobile");
        if ((style.width ?? 0) > 360) {
          addIssue(issues, {
            severity: "medium",
            category: "Mobile layout",
            sectionId: section.id,
            nodeId: element.id,
            title: "Card width may overflow mobile",
            explanation: "A fixed card width above 360px can create horizontal scrolling on small screens.",
            suggestedFix: "Reduce the mobile card width to fit common phone viewports.",
            fix: {
              type: "card-style",
              nodeId: element.id,
              viewport: "mobile",
              patch: { width: 320 },
            },
          });
        }
      }

      if (element.type === "image") {
        const style = getImageStyle(element, "mobile");
        if ((style.minHeight ?? 0) > 480) {
          addIssue(issues, {
            severity: "medium",
            category: "Mobile layout",
            sectionId: section.id,
            nodeId: element.id,
            title: "Image is tall on mobile",
            explanation: "A very tall mobile image can push important content below the first screen.",
            suggestedFix: "Reduce the mobile image minimum height.",
            fix: {
              type: "image-style",
              nodeId: element.id,
              viewport: "mobile",
              patch: { minHeight: 320 },
            },
          });
        }
      }
    }
  }
}

export function sortAuditIssues(issues: AuditIssue[]) {
  return [...issues].sort((a, b) => {
    const severityDelta = severityRank[a.severity] - severityRank[b.severity];
    if (severityDelta !== 0) return severityDelta;
    return a.title.localeCompare(b.title);
  });
}

function auditIssueFromLintIssue(issue: DesignLintIssue): AuditIssue {
  return {
    id: `lint-${issue.id}`,
    source: "local",
    severity: issue.severity,
    category: issue.category,
    sectionId: issue.sectionId,
    nodeId: issue.nodeId,
    title: issue.category
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    explanation: issue.message,
    suggestedFix: issue.suggestedFix ?? "Review this issue and adjust the DesignSpec through the inspector.",
  };
}

function dedupeAuditIssues(issues: AuditIssue[]) {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.category}:${issue.nodeId ?? issue.sectionId ?? "page"}:${issue.title}:${issue.explanation}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function auditDesignSpecWithScore(spec: DesignSpec): { issues: AuditIssue[]; score: number } {
  const issues: AuditIssue[] = [];

  checkStructure(spec, issues);
  checkHierarchy(spec, issues);
  checkSpacing(spec, issues);
  checkContrast(spec, issues);
  checkButtons(spec, issues);
  checkTextBlocks(spec, issues);
  checkSurfaceConsistency(spec, issues);
  checkMobileLayout(spec, issues);

  const lintResult = lintDesignSpec(spec);
  const combinedIssues = dedupeAuditIssues([...issues, ...lintResult.issues.map(auditIssueFromLintIssue)]);

  return {
    issues: sortAuditIssues(combinedIssues).slice(0, 24),
    score: lintResult.score,
  };
}

export function auditDesignSpec(spec: DesignSpec): AuditIssue[] {
  return auditDesignSpecWithScore(spec).issues;
}

export function applyAuditFix(spec: DesignSpec, issue: AuditIssue): DesignSpec {
  const fix = issue.fix;
  if (!fix) return spec;

  if (fix.type === "text-style") {
    return updateResponsiveTextStyle(spec, fix.nodeId, fix.viewport, fix.patch);
  }

  if (fix.type === "button-style") {
    return updateResponsiveButtonStyle(spec, fix.nodeId, fix.viewport, fix.patch);
  }

  if (fix.type === "button-full-width") {
    return updateResponsiveButtonFullWidth(spec, fix.nodeId, fix.viewport, fix.fullWidth);
  }

  if (fix.type === "card-style") {
    return updateResponsiveCardStyle(spec, fix.nodeId, fix.viewport, fix.patch);
  }

  if (fix.type === "image-style") {
    return updateResponsiveImageStyle(spec, fix.nodeId, fix.viewport, fix.patch);
  }

  if (fix.type === "section-columns") {
    return updateResponsiveSectionColumns(spec, fix.sectionId, fix.viewport, fix.columns);
  }

  if (fix.type === "section-style") {
    return updateResponsiveSectionStyle(spec, fix.sectionId, fix.viewport, fix.patch);
  }

  return updateResponsiveStatStyle(spec, fix.nodeId, fix.viewport, fix.patch);
}

function summarizeElement(element: ElementNode) {
  if (element.type === "text") {
    const desktop = getTextStyle(element, "desktop");
    const mobile = getTextStyle(element, "mobile");
    return {
      id: element.id,
      type: element.type,
      role: element.role,
      content: summarizeText(element.content),
      desktopStyle: {
        fontSize: desktop.fontSize,
        fontWeight: desktop.fontWeight,
        lineHeight: desktop.lineHeight,
        color: desktop.color,
        align: desktop.align,
        maxWidth: desktop.maxWidth,
      },
      mobileStyle: {
        fontSize: mobile.fontSize,
        lineHeight: mobile.lineHeight,
        maxWidth: mobile.maxWidth,
      },
    };
  }

  if (element.type === "button") {
    const desktop = getButtonStyle(element, "desktop");
    return {
      id: element.id,
      type: element.type,
      label: element.label,
      variant: element.variant,
      desktopStyle: {
        backgroundColor: desktop.backgroundColor,
        textColor: desktop.textColor,
        radius: desktop.radius,
        fontSize: desktop.fontSize,
      },
      mobileFullWidth: getButtonFullWidth(element, "mobile"),
    };
  }

  if (element.type === "card") {
    const desktop = getCardStyle(element, "desktop");
    const mobile = getCardStyle(element, "mobile");
    return {
      id: element.id,
      type: element.type,
      title: element.title,
      body: summarizeText(element.body),
      imageId: element.image?.id,
      desktopStyle: {
        backgroundColor: desktop.backgroundColor,
        radius: desktop.radius,
        shadow: desktop.shadow,
        padding: desktop.padding,
        width: desktop.width,
        minHeight: desktop.minHeight,
      },
      mobileStyle: {
        width: mobile.width,
        minHeight: mobile.minHeight,
      },
    };
  }

  if (element.type === "image") {
    const desktop = getImageStyle(element, "desktop");
    const mobile = getImageStyle(element, "mobile");
    return {
      id: element.id,
      type: element.type,
      label: element.label,
      alt: element.alt,
      desktopStyle: {
        aspectRatio: desktop.aspectRatio,
        radius: desktop.radius,
        width: desktop.width,
        minHeight: desktop.minHeight,
      },
      mobileStyle: {
        width: mobile.width,
        minHeight: mobile.minHeight,
      },
    };
  }

  const desktop = getStatStyle(element, "desktop");
  return {
    id: element.id,
    type: element.type,
    value: element.value,
    label: element.label,
    desktopStyle: {
      color: desktop.color,
      labelColor: desktop.labelColor,
      align: desktop.align,
    },
  };
}

export function compactDesignAuditSummary(spec: DesignSpec) {
  return {
    id: spec.id,
    title: spec.title,
    description: spec.description,
    kind: spec.kind,
    theme: spec.theme,
    designSystem: {
      id: spec.designSystem.id,
      name: spec.designSystem.name,
      tokens: spec.designSystem.tokens,
      visualTone: spec.designSystem.rules.visualTone,
      accessibilityRules: spec.designSystem.rules.accessibilityRules,
      layoutRules: spec.designSystem.rules.layoutRules,
    },
    page: {
      backgroundColor: spec.page.style.backgroundColor,
      textColor: spec.page.style.textColor,
      maxWidth: spec.page.style.maxWidth,
    },
    sections: spec.page.sections.map((section, index) => {
      const desktop = getSectionStyle(section, "desktop");
      const mobile = getSectionStyle(section, "mobile");
      return {
        index,
        id: section.id,
        name: section.name,
        type: section.type,
        layout: section.layout,
        desktopStyle: {
          backgroundType: desktop.backgroundType,
          backgroundColor: desktop.backgroundColor,
          gradientFrom: desktop.gradientFrom,
          gradientTo: desktop.gradientTo,
          paddingTop: desktop.paddingTop,
          paddingBottom: desktop.paddingBottom,
          paddingX: desktop.paddingX,
          gap: desktop.gap,
          maxWidth: desktop.maxWidth,
          borderRadius: desktop.borderRadius,
          shadow: desktop.shadow,
          align: desktop.align,
        },
        mobileStyle: {
          paddingTop: mobile.paddingTop,
          paddingBottom: mobile.paddingBottom,
          paddingX: mobile.paddingX,
          gap: mobile.gap,
          columns: getSectionColumns(section, "mobile"),
          buttonLayout: getSectionButtonLayout(section, "mobile"),
        },
        elements: section.elements.map(summarizeElement),
      };
    }),
  };
}

export function normalizeAiAuditIssues(input: z.infer<typeof aiAuditResponseSchema>): AuditIssue[] {
  return input.issues.map((issue, index) => ({
    id: `ai-${slugify(issue.category)}-${slugify(issue.nodeId ?? issue.sectionId ?? issue.title)}-${index + 1}`,
    source: "ai",
    severity: issue.severity,
    category: issue.category,
    sectionId: issue.sectionId,
    nodeId: issue.nodeId,
    title: issue.title,
    explanation: issue.explanation,
    suggestedFix: issue.suggestedFix,
  }));
}
