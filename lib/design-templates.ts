import type {
  ButtonElement,
  CardElement,
  DesignKind,
  DesignSpec,
  DesignSystemSnapshot,
  ImageElement,
  SectionNode,
  StatElement,
  TextElement,
  TextRole,
} from "@/lib/design-schema";
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
import { createId } from "@/lib/ids";

export type DesignTemplateId =
  | "saas-landing"
  | "mobile-app-landing"
  | "dashboard"
  | "admin-panel"
  | "portfolio-homepage"
  | "event-photo-app"
  | "ai-tool-landing"
  | "settings-page"
  | "gallery-page"
  | "pricing-page";

export type DesignTemplateSummary = {
  id: DesignTemplateId;
  name: string;
  description: string;
  prompt: string;
};

export type SamplePrompt = {
  label: string;
  prompt: string;
};

type TextSpec = {
  fontSize?: number;
  maxWidth?: number;
};

type FeatureSpec = {
  title: string;
  body: string;
};

type StatSpec = {
  value: string;
  label: string;
};

type TemplateBlueprint = DesignTemplateSummary & {
  title: string;
  kind: DesignKind;
  nav: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryAction: string;
  secondaryAction: string;
  heroImageLabel: string;
  featureTitle: string;
  featureIntro: string;
  features: FeatureSpec[];
  galleryTitle: string;
  galleryItems: string[];
  stats: StatSpec[];
  ctaTitle: string;
  ctaBody: string;
};

export const samplePrompts: SamplePrompt[] = [
  {
    label: "Wedding Photos",
    prompt: "Design a landing page for a wedding photo sharing app.",
  },
  {
    label: "Clipboard App",
    prompt: "Design a landing page for a cross-device clipboard app.",
  },
  {
    label: "Voice Notes",
    prompt: "Design a mobile app landing page for a voice note app.",
  },
  {
    label: "AI Cost Dashboard",
    prompt: "Design a dashboard for tracking AI usage costs.",
  },
  {
    label: "Event Gallery",
    prompt: "Design a gallery page for reviewing event photos.",
  },
];

const templateBlueprints: TemplateBlueprint[] = [
  {
    id: "saas-landing",
    name: "SaaS landing page",
    description: "A conversion-focused product page with proof, features, and CTA.",
    prompt: "Create a premium SaaS landing page for a B2B workflow product.",
    title: "OrbitOps",
    kind: "landing-page",
    nav: "Product, Customers, Pricing",
    eyebrow: "SaaS launch system",
    heading: "A cleaner operating rhythm for growing teams",
    subheading:
      "Turn scattered work into one polished product narrative with clear sections, proof points, and conversion-focused actions.",
    primaryAction: "Start free",
    secondaryAction: "View demo",
    heroImageLabel: "Product workspace",
    featureTitle: "Built for repeatable growth",
    featureIntro: "Every section is structured, editable, and ready for implementation handoff.",
    features: [
      { title: "Unified pipeline", body: "Bring tasks, accounts, launches, and approvals into one calm source of truth." },
      { title: "Smart prioritisation", body: "Highlight the work that moves revenue, retention, and delivery confidence." },
      { title: "Executive reporting", body: "Share crisp status snapshots without rebuilding decks every week." },
    ],
    galleryTitle: "Product moments",
    galleryItems: ["Command centre", "Launch board", "Weekly report"],
    stats: [
      { value: "31%", label: "Faster planning cycles" },
      { value: "12k", label: "Tasks organised" },
      { value: "4.9", label: "Average team rating" },
    ],
    ctaTitle: "Launch with a design your team can trust",
    ctaBody: "Start from a polished structure, edit locally, then export the implementation brief.",
  },
  {
    id: "mobile-app-landing",
    name: "Mobile app landing page",
    description: "A product-led app page with phone previews and benefit cards.",
    prompt: "Create a mobile app landing page for a consumer habit tracking app.",
    title: "Daylight",
    kind: "app-screen",
    nav: "Features, Reviews, Download",
    eyebrow: "Mobile habit companion",
    heading: "Small daily wins, beautifully tracked",
    subheading:
      "A focused landing page for a mobile app with clear benefits, screenshot placeholders, and app-store style calls to action.",
    primaryAction: "Download app",
    secondaryAction: "See screens",
    heroImageLabel: "Mobile app preview",
    featureTitle: "Designed for daily use",
    featureIntro: "Keep the flow simple, tactile, and easy to scan from mobile through desktop.",
    features: [
      { title: "Gentle reminders", body: "Nudge users at the right moment without turning goals into noise." },
      { title: "Progress streaks", body: "Show momentum with friendly stats and visual feedback." },
      { title: "Private by default", body: "Make trust visible with simple privacy and sync messaging." },
    ],
    galleryTitle: "App screens",
    galleryItems: ["Today view", "Habit detail", "Progress recap"],
    stats: [
      { value: "8 min", label: "Average daily focus" },
      { value: "92%", label: "Weekly return rate" },
      { value: "1 tap", label: "Fast check-in" },
    ],
    ctaTitle: "Make the first week feel easy",
    ctaBody: "Use the template as a polished visual direction, then tune copy and screens locally.",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "An operational dashboard concept with metrics, panels, and charts.",
    prompt: "Create an analytics dashboard for a revenue operations team.",
    title: "SignalBoard",
    kind: "dashboard",
    nav: "Overview, Reports, Alerts",
    eyebrow: "Revenue command centre",
    heading: "Every metric, risk, and next move in one view",
    subheading:
      "A dashboard starter with KPI bands, analysis cards, and chart placeholders that still render through editable DesignSpec nodes.",
    primaryAction: "Review report",
    secondaryAction: "Share update",
    heroImageLabel: "Live KPI board",
    featureTitle: "Decision panels",
    featureIntro: "Use cards for modules, image placeholders for charts, and stats for quick executive scanning.",
    features: [
      { title: "Pipeline health", body: "Track qualified revenue, coverage, and stage movement." },
      { title: "Retention watchlist", body: "Spot accounts that need attention before the renewal window." },
      { title: "Forecast notes", body: "Summarise what changed and what the team should do next." },
    ],
    galleryTitle: "Dashboard views",
    galleryItems: ["Pipeline chart", "Account table", "Forecast model"],
    stats: [
      { value: "$2.4M", label: "Open pipeline" },
      { value: "87%", label: "Forecast confidence" },
      { value: "18", label: "Accounts at risk" },
    ],
    ctaTitle: "Turn this into your team dashboard",
    ctaBody: "Edit the cards, metrics, and chart placeholders before exporting the implementation handoff.",
  },
  {
    id: "admin-panel",
    name: "Admin panel",
    description: "A structured admin interface for moderation, roles, and system status.",
    prompt: "Create an admin panel for managing users, roles, content, and system health.",
    title: "ControlRoom",
    kind: "dashboard",
    nav: "Users, Roles, Activity",
    eyebrow: "Admin operations",
    heading: "A quiet control surface for high-stakes workflows",
    subheading:
      "A focused admin starter with status metrics, task cards, and operational views without drifting into a freeform canvas.",
    primaryAction: "Open queue",
    secondaryAction: "Audit changes",
    heroImageLabel: "Admin activity queue",
    featureTitle: "Core admin workflows",
    featureIntro: "Keep the interface dense enough for work while preserving hierarchy and clarity.",
    features: [
      { title: "User management", body: "Review access, roles, verification state, and recent account activity." },
      { title: "Moderation queue", body: "Prioritise flagged items with clear status and owner context." },
      { title: "System health", body: "Surface incidents, sync jobs, and background processing status." },
    ],
    galleryTitle: "Admin surfaces",
    galleryItems: ["User table", "Audit timeline", "Health monitor"],
    stats: [
      { value: "248", label: "Active users" },
      { value: "9", label: "Pending reviews" },
      { value: "99.9%", label: "Service uptime" },
    ],
    ctaTitle: "Shape the admin flow before buildout",
    ctaBody: "Use local controls to tune density, hierarchy, and role-specific messaging.",
  },
  {
    id: "portfolio-homepage",
    name: "Portfolio homepage",
    description: "An editorial homepage for projects, services, and contact.",
    prompt: "Create a portfolio homepage for a senior product designer.",
    title: "Mira Cole",
    kind: "landing-page",
    nav: "Work, Services, Contact",
    eyebrow: "Product design portfolio",
    heading: "Designing calm products for complex teams",
    subheading:
      "A portfolio starter with strong opening copy, project cards, service positioning, and a confident contact section.",
    primaryAction: "View work",
    secondaryAction: "Book intro",
    heroImageLabel: "Selected work preview",
    featureTitle: "Selected case studies",
    featureIntro: "Use cards for project summaries, outcomes, and the story you want clients to remember.",
    features: [
      { title: "B2B onboarding", body: "Reduced setup friction with a guided first-run experience." },
      { title: "Analytics redesign", body: "Created a clearer hierarchy for daily operators and executives." },
      { title: "Design systems", body: "Built reusable patterns for faster product delivery." },
    ],
    galleryTitle: "Visual direction",
    galleryItems: ["Dashboard case study", "Mobile concept", "Brand system"],
    stats: [
      { value: "14", label: "Products shipped" },
      { value: "6", label: "Design systems" },
      { value: "10 yrs", label: "Product experience" },
    ],
    ctaTitle: "Have a product worth sharpening?",
    ctaBody: "Turn this starter into a portfolio direction, then export the build prompt.",
  },
  {
    id: "event-photo-app",
    name: "Event/wedding photo app",
    description: "A guest-friendly photo sharing app with gallery and upload flows.",
    prompt: "Create a wedding photo sharing app landing page for guests and hosts.",
    title: "VowVault",
    kind: "gallery",
    nav: "Albums, Upload, Privacy",
    eyebrow: "Event photo sharing",
    heading: "Collect every guest photo in one beautiful place",
    subheading:
      "A warm, polished starter for wedding and event galleries with upload CTAs, album previews, and privacy reassurance.",
    primaryAction: "Create album",
    secondaryAction: "Join event",
    heroImageLabel: "Shared event album",
    featureTitle: "Made for guests and hosts",
    featureIntro: "Blend emotional gallery moments with practical upload and sharing controls.",
    features: [
      { title: "QR code uploads", body: "Guests add photos without downloading an app or creating an account." },
      { title: "Curated albums", body: "Hosts can organise moments by ceremony, reception, and favourites." },
      { title: "Private links", body: "Keep memories shared with the people who were actually there." },
    ],
    galleryTitle: "Album moments",
    galleryItems: ["Ceremony", "Reception", "Guest candids"],
    stats: [
      { value: "1 link", label: "For every guest" },
      { value: "400+", label: "Photos per event" },
      { value: "24h", label: "Fast album recap" },
    ],
    ctaTitle: "Start with the memories, not the setup",
    ctaBody: "Use this template to shape the app, then refine colours and copy for the event brand.",
  },
  {
    id: "ai-tool-landing",
    name: "AI tool landing page",
    description: "A crisp AI product page with trust, workflow, and output proof.",
    prompt: "Create an AI tool landing page for a product research assistant.",
    title: "PromptLens",
    kind: "landing-page",
    nav: "Workflow, Security, Pricing",
    eyebrow: "AI research workspace",
    heading: "Turn messy prompts into confident product decisions",
    subheading:
      "A structured AI landing page with workflow cards, trustworthy output framing, and a clear trial path.",
    primaryAction: "Try the workspace",
    secondaryAction: "See output",
    heroImageLabel: "AI workflow preview",
    featureTitle: "AI where it actually helps",
    featureIntro: "Keep model work bounded to generation and refinement while local controls stay deterministic.",
    features: [
      { title: "Structured outputs", body: "Capture AI results as clear objects that can be reviewed and edited." },
      { title: "Reviewable reasoning", body: "Summarise assumptions, evidence, and suggested next actions." },
      { title: "Team handoff", body: "Export concise prompts and implementation notes for builders." },
    ],
    galleryTitle: "AI output examples",
    galleryItems: ["Research synthesis", "Prompt variant", "Handoff brief"],
    stats: [
      { value: "5 min", label: "To first draft" },
      { value: "3x", label: "More review coverage" },
      { value: "0", label: "Arbitrary code executed" },
    ],
    ctaTitle: "Give the AI a safer shape to work inside",
    ctaBody: "Start from this layout, then tune the proof points and security language.",
  },
  {
    id: "settings-page",
    name: "Settings page",
    description: "A product settings screen for profile, security, billing, and notifications.",
    prompt: "Create a settings page for a SaaS account management area.",
    title: "Account Settings",
    kind: "settings",
    nav: "Profile, Security, Billing",
    eyebrow: "Workspace preferences",
    heading: "A settings surface that feels calm and predictable",
    subheading:
      "A settings starter with editable groups for account details, security, notifications, billing, and team preferences.",
    primaryAction: "Save changes",
    secondaryAction: "Review security",
    heroImageLabel: "Settings overview",
    featureTitle: "Settings groups",
    featureIntro: "Use cards to organise dense controls into clear sections before implementation.",
    features: [
      { title: "Profile details", body: "Manage names, avatars, timezone, and workspace identity." },
      { title: "Security controls", body: "Surface password, sessions, two-factor auth, and trusted devices." },
      { title: "Billing preferences", body: "Clarify plan, invoices, seats, and payment ownership." },
      { title: "Notifications", body: "Let users tune product, account, and team alerts." },
    ],
    galleryTitle: "Settings states",
    galleryItems: ["Profile form", "Security state", "Billing summary"],
    stats: [
      { value: "4", label: "Primary groups" },
      { value: "2FA", label: "Security ready" },
      { value: "Auto", label: "Save pattern" },
    ],
    ctaTitle: "Make account management feel composed",
    ctaBody: "Edit the groups and labels locally, then export the implementation brief.",
  },
  {
    id: "gallery-page",
    name: "Gallery page",
    description: "A visual gallery page for albums, collections, and featured media.",
    prompt: "Create a gallery page for a creative studio with featured collections.",
    title: "Northstar Gallery",
    kind: "gallery",
    nav: "Collections, Featured, Archive",
    eyebrow: "Curated visual archive",
    heading: "A gallery layout with rhythm, focus, and room to breathe",
    subheading:
      "A polished gallery page with collection cards, visual placeholders, and a simple CTA for exploring or uploading.",
    primaryAction: "Explore collection",
    secondaryAction: "Submit work",
    heroImageLabel: "Featured collection",
    featureTitle: "Collection structure",
    featureIntro: "Shape how visitors scan collections, featured stories, and archive categories.",
    features: [
      { title: "Featured story", body: "Lead with one memorable collection and a clear curatorial note." },
      { title: "Album groups", body: "Organise visual work into scannable themes and time periods." },
      { title: "Submission path", body: "Give contributors a calm route to share new material." },
    ],
    galleryTitle: "Gallery highlights",
    galleryItems: ["Editorial set", "Studio archive", "Member picks"],
    stats: [
      { value: "36", label: "Collections" },
      { value: "1.8k", label: "Assets tagged" },
      { value: "12", label: "Featured stories" },
    ],
    ctaTitle: "Create a gallery that guides the eye",
    ctaBody: "Use this as a structure, then tune spacing and cards for the collection.",
  },
  {
    id: "pricing-page",
    name: "Pricing page",
    description: "A pricing-focused page with plan cards, proof, and conversion CTA.",
    prompt: "Create a pricing page for a SaaS product with three plans and enterprise CTA.",
    title: "ClearPlans",
    kind: "landing-page",
    nav: "Plans, Compare, FAQ",
    eyebrow: "Simple SaaS pricing",
    heading: "Plans that make the next step obvious",
    subheading:
      "A pricing starter with plan cards, trust metrics, and a CTA that can be tuned for your business model.",
    primaryAction: "Choose plan",
    secondaryAction: "Talk to sales",
    heroImageLabel: "Pricing comparison",
    featureTitle: "Plan cards",
    featureIntro: "Use the editable cards for plan names, benefits, pricing notes, and buyer fit.",
    features: [
      { title: "Starter", body: "$19 per seat. Best for solo builders validating their first workflow." },
      { title: "Team", body: "$49 per seat. Collaboration, approvals, shared exports, and version history." },
      { title: "Enterprise", body: "Custom. Governance, procurement support, advanced security, and onboarding." },
    ],
    galleryTitle: "Comparison helpers",
    galleryItems: ["Plan table", "Usage summary", "FAQ preview"],
    stats: [
      { value: "3", label: "Clear plan tiers" },
      { value: "14d", label: "Trial period" },
      { value: "0", label: "Setup fees" },
    ],
    ctaTitle: "Make pricing easier to say yes to",
    ctaBody: "Refine the plan cards, add proof, and export a build-ready pricing page.",
  },
];

export const designTemplates: DesignTemplateSummary[] = templateBlueprints.map(
  ({ id, name, description, prompt }) => ({ id, name, description, prompt }),
);

function getTemplateBlueprint(templateId: DesignTemplateId) {
  return templateBlueprints.find((template) => template.id === templateId) ?? templateBlueprints[0];
}

export function getDesignTemplateById(templateId: DesignTemplateId) {
  return designTemplates.find((template) => template.id === templateId) ?? designTemplates[0];
}

function createText(
  role: TextRole,
  content: string,
  designSystem: DesignSystemSnapshot,
  overrides: TextSpec = {},
): TextElement {
  return {
    id: createId("text"),
    type: "text",
    role,
    content,
    style: createTextStyle(
      role,
      {
        color: designSystem.tokens.colors.foreground,
        fontSize: overrides.fontSize,
        maxWidth: overrides.maxWidth,
      },
      designSystem,
    ),
  };
}

function createButton(
  label: string,
  variant: ButtonElement["variant"],
  designSystem: DesignSystemSnapshot,
  emphasis: "primary" | "secondary" = "primary",
): ButtonElement {
  const { colors } = designSystem.tokens;
  const backgroundColor = emphasis === "primary" ? colors.primary : colors.card;
  const textColor = emphasis === "primary" ? getReadableTextColor(colors.primary) : colors.foreground;

  return {
    id: createId("button"),
    type: "button",
    label,
    variant,
    style: createButtonStyle(
      {
        backgroundColor,
        borderColor: emphasis === "primary" ? colors.primary : colors.border,
        textColor,
      },
      designSystem,
    ),
  };
}

function createCard(feature: FeatureSpec, designSystem: DesignSystemSnapshot): CardElement {
  const { colors } = designSystem.tokens;
  const dark = isDarkHexColor(colors.background);

  return {
    id: createId("card"),
    type: "card",
    title: feature.title,
    body: feature.body,
    style: createCardStyle(
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadow: dark ? "none" : "md",
      },
      designSystem,
    ),
  };
}

function createImage(label: string, designSystem: DesignSystemSnapshot, aspectRatio: ImageElement["style"]["aspectRatio"]): ImageElement {
  const { colors, radius } = designSystem.tokens;
  const dark = isDarkHexColor(colors.background);

  return {
    id: createId("image"),
    type: "image",
    alt: `${label} preview placeholder`,
    label,
    style: createImageStyle(
      {
        aspectRatio,
        backgroundColor: dark ? colors.secondary : colors.border,
        radius: radius.lg,
      },
      designSystem,
    ),
  };
}

function createStat(stat: StatSpec, designSystem: DesignSystemSnapshot): StatElement {
  const { colors } = designSystem.tokens;
  const onPrimary = getReadableTextColor(colors.primary);

  return {
    id: createId("stat"),
    type: "stat",
    value: stat.value,
    label: stat.label,
    style: createStatStyle(
      {
        color: onPrimary,
        labelColor: onPrimary,
      },
      designSystem,
    ),
  };
}

function createHeader(template: TemplateBlueprint, designSystem: DesignSystemSnapshot): SectionNode {
  const { colors } = designSystem.tokens;

  return {
    id: createId("section"),
    type: "header",
    name: "Header",
    layout: "inline",
    style: createSectionStyle(
      {
        backgroundType: "solid",
        backgroundColor: colors.card,
        borderColor: colors.border,
        paddingTop: 20,
        paddingBottom: 20,
        paddingX: 28,
        align: "center",
      },
      designSystem,
    ),
    elements: [
      createText("heading", template.title, designSystem, { fontSize: 20, maxWidth: 280 }),
      createText("body", template.nav, designSystem, { fontSize: 14, maxWidth: 420 }),
      createButton(template.primaryAction, "primary", designSystem),
    ],
  };
}

function createHero(template: TemplateBlueprint, designSystem: DesignSystemSnapshot): SectionNode {
  const { colors, radius } = designSystem.tokens;

  return {
    id: createId("section"),
    type: "hero",
    name: "Hero",
    layout: "split",
    style: createSectionStyle(
      {
        backgroundType: "gradient",
        gradientFrom: colors.background,
        gradientTo: colors.secondary,
        paddingTop: 92,
        paddingBottom: 98,
        gap: 42,
        align: "left",
      },
      designSystem,
    ),
    elements: [
      createText("eyebrow", template.eyebrow, designSystem, { fontSize: 13 }),
      createText("heading", template.heading, designSystem, { fontSize: 56, maxWidth: 780 }),
      createText("subheading", template.subheading, designSystem, {
        fontSize: 21,
        maxWidth: 700,
      }),
      createButton(template.primaryAction, "primary", designSystem),
      createButton(template.secondaryAction, "outline", designSystem, "secondary"),
      {
        ...createImage(template.heroImageLabel, designSystem, template.kind === "app-screen" ? "portrait" : "wide"),
        style: createImageStyle(
          {
            aspectRatio: template.kind === "app-screen" ? "portrait" : "wide",
            backgroundColor: isDarkHexColor(colors.background) ? colors.secondary : colors.border,
            minHeight: template.kind === "app-screen" ? 420 : 260,
            radius: radius.xl,
          },
          designSystem,
        ),
      },
    ],
  };
}

function createFeatures(template: TemplateBlueprint, designSystem: DesignSystemSnapshot): SectionNode {
  const { colors } = designSystem.tokens;

  return {
    id: createId("section"),
    type: "features",
    name: template.id === "pricing-page" ? "Plans" : "Features",
    layout: "cards",
    style: createSectionStyle(
      {
        backgroundType: "solid",
        backgroundColor: colors.background,
        gap: 28,
        align: "center",
      },
      designSystem,
    ),
    elements: [
      createText("heading", template.featureTitle, designSystem, {
        fontSize: 40,
        maxWidth: 760,
      }),
      createText("body", template.featureIntro, designSystem, {
        fontSize: 16,
        maxWidth: 720,
      }),
      ...template.features.map((feature) => createCard(feature, designSystem)),
    ],
  };
}

function createGallery(template: TemplateBlueprint, designSystem: DesignSystemSnapshot): SectionNode {
  const { colors, radius } = designSystem.tokens;

  return {
    id: createId("section"),
    type: "gallery",
    name: "Gallery",
    layout: "grid",
    style: createSectionStyle(
      {
        backgroundType: "solid",
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: radius.xl,
        gap: 24,
        shadow: isDarkHexColor(colors.background) ? "none" : "sm",
        align: "center",
      },
      designSystem,
    ),
    elements: [
      createText("heading", template.galleryTitle, designSystem, {
        fontSize: 36,
        maxWidth: 760,
      }),
      ...template.galleryItems.map((item, index) => createImage(item, designSystem, index === 0 ? "video" : "square")),
    ],
  };
}

function createStats(template: TemplateBlueprint, designSystem: DesignSystemSnapshot): SectionNode {
  const { colors, radius } = designSystem.tokens;

  return {
    id: createId("section"),
    type: "stats",
    name: "Stats",
    layout: "grid",
    style: createSectionStyle(
      {
        backgroundType: "solid",
        backgroundColor: colors.primary,
        borderRadius: radius.xl,
        paddingTop: 58,
        paddingBottom: 58,
        gap: 20,
      },
      designSystem,
    ),
    elements: template.stats.map((stat) => createStat(stat, designSystem)),
  };
}

function createCta(template: TemplateBlueprint, designSystem: DesignSystemSnapshot): SectionNode {
  const { colors, radius } = designSystem.tokens;
  const onForeground = getReadableTextColor(colors.foreground);

  return {
    id: createId("section"),
    type: "cta",
    name: "CTA",
    layout: "centered",
    style: createSectionStyle(
      {
        backgroundType: "solid",
        backgroundColor: colors.foreground,
        borderRadius: radius.xl,
        paddingTop: 76,
        paddingBottom: 76,
        align: "center",
      },
      designSystem,
    ),
    elements: [
      {
        ...createText("heading", template.ctaTitle, designSystem, {
          fontSize: 42,
          maxWidth: 760,
        }),
        style: createTextStyle("heading", { align: "center", color: onForeground, fontSize: 42, maxWidth: 760 }, designSystem),
      },
      {
        ...createText("body", template.ctaBody, designSystem, {
          maxWidth: 680,
        }),
        style: createTextStyle("body", { align: "center", color: onForeground, maxWidth: 680 }, designSystem),
      },
      createButton(template.primaryAction, "secondary", designSystem),
    ],
  };
}

function createFooter(template: TemplateBlueprint, designSystem: DesignSystemSnapshot): SectionNode {
  const { colors } = designSystem.tokens;

  return {
    id: createId("section"),
    type: "footer",
    name: "Footer",
    layout: "footer-columns",
    style: createSectionStyle(
      {
        backgroundType: "solid",
        backgroundColor: colors.card,
        borderColor: colors.border,
        paddingTop: 42,
        paddingBottom: 42,
      },
      designSystem,
    ),
    elements: [
      createText("heading", template.title, designSystem, { fontSize: 20, maxWidth: 320 }),
      createText("body", `Template: ${template.name}`, designSystem, {
        fontSize: 14,
        maxWidth: 420,
      }),
    ],
  };
}

export function generateBlankDesignSpec(designSystem: DesignSystemSnapshot = defaultDesignSystem): DesignSpec {
  const activeDesignSystem = cloneDesignSystem(designSystem);
  const { colors } = activeDesignSystem.tokens;
  const theme = isDarkHexColor(colors.background) ? "dark" : "light";

  return {
    id: createId("spec"),
    title: "Untitled Design",
    description: "Blank DesignDock project.",
    kind: "landing-page",
    theme,
    viewport: "desktop",
    designSystem: activeDesignSystem,
    page: {
      id: createId("page"),
      type: "page",
      name: "Untitled page",
      style: createPageStyle(theme, activeDesignSystem),
      sections: [
        {
          id: createId("section"),
          type: "custom",
          name: "Blank section",
          layout: "centered",
          style: createSectionStyle(
            {
              backgroundType: "solid",
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: activeDesignSystem.tokens.radius.xl,
              paddingTop: 96,
              paddingBottom: 96,
              align: "center",
            },
            activeDesignSystem,
          ),
          elements: [
            {
              ...createText("heading", "Untitled section", activeDesignSystem, {
                fontSize: 42,
                maxWidth: 680,
              }),
              style: createTextStyle("heading", { align: "center", fontSize: 42, maxWidth: 680 }, activeDesignSystem),
            },
            {
              ...createText("body", "Replace this starter content or generate from a prompt when you are ready.", activeDesignSystem, {
                maxWidth: 620,
              }),
              style: createTextStyle("body", { align: "center", maxWidth: 620 }, activeDesignSystem),
            },
          ],
        },
      ],
    },
  };
}

export function generateTemplateDesignSpec(
  templateId: DesignTemplateId,
  designSystem: DesignSystemSnapshot = defaultDesignSystem,
): DesignSpec {
  const template = getTemplateBlueprint(templateId);
  const activeDesignSystem = cloneDesignSystem(designSystem);
  const theme = isDarkHexColor(activeDesignSystem.tokens.colors.background) ? "dark" : "light";
  const sections: SectionNode[] = [
    createHeader(template, activeDesignSystem),
    createHero(template, activeDesignSystem),
    createStats(template, activeDesignSystem),
    createFeatures(template, activeDesignSystem),
    createGallery(template, activeDesignSystem),
    createCta(template, activeDesignSystem),
    createFooter(template, activeDesignSystem),
  ];

  return {
    id: createId("spec"),
    title: template.title,
    description: template.prompt,
    kind: template.kind,
    theme,
    viewport: "desktop",
    designSystem: activeDesignSystem,
    page: {
      id: createId("page"),
      type: "page",
      name: `${template.title} page`,
      style: createPageStyle(theme, activeDesignSystem),
      sections,
    },
  };
}
