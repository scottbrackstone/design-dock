import { z } from "zod";
import {
  alignments,
  buttonVariants,
  designKinds,
  sectionButtonLayouts,
  sectionImagePositions,
  sectionLayouts,
  sectionTypes,
  shadowLevels,
  textRoles,
  themes,
  viewports,
} from "@/lib/design-schema";

const hexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
  message: "Expected a hex colour such as #0f172a.",
});

export const designTokensSchema = z
  .object({
    colors: z.object({
      background: hexColorSchema,
      foreground: hexColorSchema,
      muted: hexColorSchema,
      primary: hexColorSchema,
      secondary: hexColorSchema,
      accent: hexColorSchema,
      border: hexColorSchema,
      card: hexColorSchema,
    }),
    typography: z.object({
      headingFont: z.string().min(1),
      bodyFont: z.string().min(1),
      monoFont: z.string().min(1).optional(),
    }),
    radius: z.object({
      sm: z.number().min(0).max(80),
      md: z.number().min(0).max(80),
      lg: z.number().min(0).max(120),
      xl: z.number().min(0).max(160),
      full: z.number().min(0).max(999),
    }),
  })
  .strict();

export const designSystemRulesSchema = z
  .object({
    visualTone: z.string().min(1),
    layoutRules: z.array(z.string()),
    accessibilityRules: z.array(z.string()),
    avoid: z.array(z.string()),
    preferredPatterns: z.array(z.string()),
  })
  .strict();

export const designSystemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    tokens: designTokensSchema,
    rules: designSystemRulesSchema,
  })
  .strict();

export const pageStyleSchema = z
  .object({
    backgroundColor: hexColorSchema,
    textColor: hexColorSchema,
    fontFamily: z.string().min(1),
    maxWidth: z.number().min(320).max(1800),
  })
  .strict();

export const sectionStyleSchema = z
  .object({
    backgroundType: z.enum(["solid", "gradient", "image", "transparent"]),
    backgroundColor: hexColorSchema.optional(),
    gradientFrom: hexColorSchema.optional(),
    gradientTo: hexColorSchema.optional(),
    paddingTop: z.number().min(0).max(240),
    paddingBottom: z.number().min(0).max(240),
    paddingX: z.number().min(0).max(96),
    gap: z.number().min(0).max(96),
    maxWidth: z.number().min(320).max(1800),
    borderRadius: z.number().min(0).max(80),
    shadow: z.enum(shadowLevels),
    borderColor: hexColorSchema.optional(),
    align: z.enum(alignments),
  })
  .strict();

export const textStyleSchema = z
  .object({
    fontFamily: z.string().min(1),
    fontSize: z.number().min(10).max(96),
    fontWeight: z.number().min(100).max(900),
    lineHeight: z.number().min(0.8).max(2.2),
    letterSpacing: z.number().min(0).max(2),
    color: hexColorSchema,
    align: z.enum(alignments),
    maxWidth: z.number().min(160).max(1200).optional(),
  })
  .strict();

export const buttonStyleSchema = z
  .object({
    backgroundColor: hexColorSchema,
    textColor: hexColorSchema,
    borderColor: hexColorSchema.optional(),
    radius: z.number().min(0).max(999),
    paddingX: z.number().min(6).max(80),
    paddingY: z.number().min(4).max(40),
    fontSize: z.number().min(11).max(28),
    fontWeight: z.number().min(100).max(900),
  })
  .strict();

export const cardStyleSchema = z
  .object({
    backgroundColor: hexColorSchema,
    borderColor: hexColorSchema.optional(),
    radius: z.number().min(0).max(80),
    shadow: z.enum(shadowLevels),
    padding: z.number().min(8).max(80),
    width: z.number().min(180).max(900).optional(),
    minHeight: z.number().min(80).max(900).optional(),
  })
  .strict();

export const imageStyleSchema = z
  .object({
    backgroundColor: hexColorSchema,
    radius: z.number().min(0).max(80),
    aspectRatio: z.enum(["square", "video", "wide", "portrait"]),
    width: z.number().min(120).max(1200).optional(),
    minHeight: z.number().min(80).max(900).optional(),
  })
  .strict();

export const statStyleSchema = z
  .object({
    color: hexColorSchema,
    labelColor: hexColorSchema,
    align: z.enum(alignments),
  })
  .strict();

function responsiveOverridesSchema<T extends z.ZodTypeAny>(overrideSchema: T) {
  return z
    .object({
      desktop: overrideSchema.optional(),
      tablet: overrideSchema.optional(),
      mobile: overrideSchema.optional(),
    })
    .strict();
}

const sectionResponsiveOverrideSchema = z
  .object({
    layout: z.enum(sectionLayouts).optional(),
    style: sectionStyleSchema.partial().optional(),
    columns: z.number().int().min(1).max(4).optional(),
    imagePosition: z.enum(sectionImagePositions).optional(),
    buttonLayout: z.enum(sectionButtonLayouts).optional(),
  })
  .strict();

const textResponsiveOverrideSchema = z
  .object({
    style: textStyleSchema.partial().optional(),
  })
  .strict();

const buttonResponsiveOverrideSchema = z
  .object({
    style: buttonStyleSchema.partial().optional(),
    fullWidth: z.boolean().optional(),
  })
  .strict();

const cardResponsiveOverrideSchema = z
  .object({
    style: cardStyleSchema.partial().optional(),
  })
  .strict();

const imageResponsiveOverrideSchema = z
  .object({
    style: imageStyleSchema.partial().optional(),
  })
  .strict();

const statResponsiveOverrideSchema = z
  .object({
    style: statStyleSchema.partial().optional(),
  })
  .strict();

export const textElementSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal("text"),
    role: z.enum(textRoles),
    content: z.string(),
    style: textStyleSchema,
    responsive: responsiveOverridesSchema(textResponsiveOverrideSchema).optional(),
  })
  .strict();

export const buttonElementSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal("button"),
    label: z.string(),
    href: z.string().optional(),
    variant: z.enum(buttonVariants),
    style: buttonStyleSchema,
    responsive: responsiveOverridesSchema(buttonResponsiveOverrideSchema).optional(),
  })
  .strict();

export const imageElementSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal("image"),
    alt: z.string(),
    label: z.string().optional(),
    style: imageStyleSchema,
    responsive: responsiveOverridesSchema(imageResponsiveOverrideSchema).optional(),
  })
  .strict();

export const cardElementSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal("card"),
    title: z.string(),
    body: z.string(),
    image: imageElementSchema.optional(),
    style: cardStyleSchema,
    responsive: responsiveOverridesSchema(cardResponsiveOverrideSchema).optional(),
  })
  .strict();

export const statElementSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal("stat"),
    value: z.string(),
    label: z.string(),
    style: statStyleSchema,
    responsive: responsiveOverridesSchema(statResponsiveOverrideSchema).optional(),
  })
  .strict();

export const elementNodeSchema = z.discriminatedUnion("type", [
  textElementSchema,
  buttonElementSchema,
  cardElementSchema,
  imageElementSchema,
  statElementSchema,
]);

export const sectionNodeSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(sectionTypes),
    name: z.string().min(1),
    layout: z.enum(sectionLayouts),
    style: sectionStyleSchema,
    responsive: responsiveOverridesSchema(sectionResponsiveOverrideSchema).optional(),
    elements: z.array(elementNodeSchema),
  })
  .strict();

export const pageNodeSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal("page"),
    name: z.string().min(1),
    style: pageStyleSchema,
    sections: z.array(sectionNodeSchema).min(1),
  })
  .strict();

export const designSpecSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    kind: z.enum(designKinds),
    theme: z.enum(themes),
    viewport: z.enum(viewports),
    designSystem: designSystemSchema,
    page: pageNodeSchema,
  })
  .strict();

export const designVersionSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    createdAt: z.string().min(1),
    prompt: z.string(),
    refinementPrompt: z.string().optional(),
    spec: designSpecSchema,
    notes: z.string().optional(),
  })
  .strict();

export const designProjectSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    designSystemId: z.string().optional(),
    versions: z.array(designVersionSchema),
    activeVersionId: z.string().min(1),
  })
  .strict();

export type DesignSpecInput = z.infer<typeof designSpecSchema>;
