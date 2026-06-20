export type DesignQualityScore = {
  clarity: number;
  hierarchy: number;
  spacing: number;
  typography: number;
  colourDiscipline: number;
  accessibility: number;
  responsiveness: number;
  productRelevance: number;
  designSystemConsistency: number;
  originality: number;
  copyQuality: number;
};

export const designQualityRubric: Record<keyof DesignQualityScore, string> = {
  clarity: "Is the value, task, or page purpose immediately understandable?",
  hierarchy: "Does the eye know what to read and do first?",
  spacing: "Is the rhythm intentional without cramped or excessive gaps?",
  typography: "Is the type scale readable, specific, and coherent?",
  colourDiscipline: "Is color strategic, restrained, and legible?",
  accessibility: "Are text, buttons, states, and labels readable and operable?",
  responsiveness: "Does the design collapse cleanly across desktop, tablet, and mobile?",
  productRelevance: "Does the design feel specific to this product and audience?",
  designSystemConsistency: "Does it honor the selected design system tokens and rules?",
  originality: "Does it avoid common AI tells while staying practical?",
  copyQuality: "Is the copy direct, concrete, and product-specific?",
};

export const qualityScoreMeaning = {
  low: [
    "unclear value prop",
    "generic copy",
    "inconsistent layout",
    "poor contrast",
    "overused AI patterns",
    "weak mobile behavior",
    "design system ignored",
  ],
  high: [
    "specific to product",
    "visually disciplined",
    "clear section purpose",
    "responsive",
    "accessible",
    "polished without over-decoration",
    "exportable into clean code",
  ],
};

export function emptyDesignQualityScore(value = 7): DesignQualityScore {
  return {
    clarity: value,
    hierarchy: value,
    spacing: value,
    typography: value,
    colourDiscipline: value,
    accessibility: value,
    responsiveness: value,
    productRelevance: value,
    designSystemConsistency: value,
    originality: value,
    copyQuality: value,
  };
}
