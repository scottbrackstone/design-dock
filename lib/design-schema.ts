export const viewports = ["desktop", "tablet", "mobile"] as const;
export const themes = ["light", "dark"] as const;
export const designKinds = [
  "landing-page",
  "dashboard",
  "form",
  "gallery",
  "settings",
  "app-screen",
] as const;
export const sectionTypes = [
  "header",
  "hero",
  "features",
  "gallery",
  "stats",
  "cta",
  "footer",
  "custom",
] as const;
export const sectionLayouts = [
  "stack",
  "split",
  "grid",
  "cards",
  "centered",
  "inline",
  "footer-columns",
] as const;
export const shadowLevels = ["none", "sm", "md", "lg", "xl"] as const;
export const alignments = ["left", "center", "right"] as const;
export const buttonVariants = ["primary", "secondary", "ghost", "outline"] as const;
export const textRoles = ["eyebrow", "heading", "subheading", "body", "caption"] as const;
export const sectionButtonLayouts = ["inline", "stack"] as const;
export const sectionImagePositions = ["left", "right", "top", "bottom"] as const;

export type Viewport = (typeof viewports)[number];
export type Theme = (typeof themes)[number];
export type DesignKind = (typeof designKinds)[number];
export type SectionType = (typeof sectionTypes)[number];
export type SectionLayout = (typeof sectionLayouts)[number];
export type ShadowLevel = (typeof shadowLevels)[number];
export type Alignment = (typeof alignments)[number];
export type ButtonVariant = (typeof buttonVariants)[number];
export type TextRole = (typeof textRoles)[number];
export type SectionButtonLayout = (typeof sectionButtonLayouts)[number];
export type SectionImagePosition = (typeof sectionImagePositions)[number];
export type ResponsiveOverrides<T> = Partial<Record<Viewport, T>>;

export type DesignProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  designSystemId?: string;
  versions: DesignVersion[];
  activeVersionId: string;
};

export type DesignVersion = {
  id: string;
  name: string;
  createdAt: string;
  prompt: string;
  refinementPrompt?: string;
  spec: DesignSpec;
  notes?: string;
};

export type DesignSpec = {
  id: string;
  title: string;
  description: string;
  kind: DesignKind;
  theme: Theme;
  viewport: Viewport;
  designSystem: DesignSystemSnapshot;
  page: PageNode;
};

export type DesignSystemSnapshot = {
  id: string;
  name: string;
  tokens: DesignTokens;
  rules: DesignSystemRules;
};

export type DesignTokens = {
  colors: {
    background: string;
    foreground: string;
    muted: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    card: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont?: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
};

export type DesignSystemRules = {
  visualTone: string;
  layoutRules: string[];
  accessibilityRules: string[];
  avoid: string[];
  preferredPatterns: string[];
};

export type PageNode = {
  id: string;
  type: "page";
  name: string;
  style: PageStyle;
  sections: SectionNode[];
};

export type SectionNode = {
  id: string;
  type: SectionType;
  name: string;
  layout: SectionLayout;
  style: SectionStyle;
  responsive?: ResponsiveOverrides<SectionResponsiveOverride>;
  elements: ElementNode[];
};

export type ElementNode =
  | TextElement
  | ButtonElement
  | CardElement
  | ImageElement
  | StatElement;

export type PageStyle = {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  maxWidth: number;
};

export type SectionStyle = {
  backgroundType: "solid" | "gradient" | "image" | "transparent";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  paddingTop: number;
  paddingBottom: number;
  paddingX: number;
  gap: number;
  maxWidth: number;
  borderRadius: number;
  shadow: ShadowLevel;
  borderColor?: string;
  align: Alignment;
};

export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  align: Alignment;
  maxWidth?: number;
};

export type ButtonStyle = {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  radius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  fontWeight: number;
};

export type CardStyle = {
  backgroundColor: string;
  borderColor?: string;
  radius: number;
  shadow: ShadowLevel;
  padding: number;
  width?: number;
  minHeight?: number;
};

export type ImageStyle = {
  backgroundColor: string;
  radius: number;
  aspectRatio: "square" | "video" | "wide" | "portrait";
  width?: number;
  minHeight?: number;
};

export type StatStyle = {
  color: string;
  labelColor: string;
  align: Alignment;
};

export type SectionResponsiveOverride = {
  layout?: SectionLayout;
  style?: Partial<SectionStyle>;
  columns?: number;
  imagePosition?: SectionImagePosition;
  buttonLayout?: SectionButtonLayout;
};

export type TextResponsiveOverride = {
  style?: Partial<TextStyle>;
};

export type ButtonResponsiveOverride = {
  style?: Partial<ButtonStyle>;
  fullWidth?: boolean;
};

export type CardResponsiveOverride = {
  style?: Partial<CardStyle>;
};

export type ImageResponsiveOverride = {
  style?: Partial<ImageStyle>;
};

export type StatResponsiveOverride = {
  style?: Partial<StatStyle>;
};

export type TextElement = {
  id: string;
  type: "text";
  role: TextRole;
  content: string;
  style: TextStyle;
  responsive?: ResponsiveOverrides<TextResponsiveOverride>;
};

export type ButtonElement = {
  id: string;
  type: "button";
  label: string;
  href?: string;
  variant: ButtonVariant;
  style: ButtonStyle;
  responsive?: ResponsiveOverrides<ButtonResponsiveOverride>;
};

export type CardElement = {
  id: string;
  type: "card";
  title: string;
  body: string;
  image?: ImageElement;
  style: CardStyle;
  responsive?: ResponsiveOverrides<CardResponsiveOverride>;
};

export type ImageElement = {
  id: string;
  type: "image";
  alt: string;
  label?: string;
  style: ImageStyle;
  responsive?: ResponsiveOverrides<ImageResponsiveOverride>;
};

export type StatElement = {
  id: string;
  type: "stat";
  value: string;
  label: string;
  style: StatStyle;
  responsive?: ResponsiveOverrides<StatResponsiveOverride>;
};

export type DesignNode = PageNode | SectionNode | ElementNode;
