import type { DesignRegister } from "@/lib/design-guidance/design-register";

export type DesignDials = {
  designVariance: number;
  motionIntensity: number;
  visualDensity: number;
};

function clampDial(value: number) {
  return Math.min(Math.max(Math.round(value), 1), 10);
}

function dials(designVariance: number, motionIntensity: number, visualDensity: number): DesignDials {
  return {
    designVariance: clampDial(designVariance),
    motionIntensity: clampDial(motionIntensity),
    visualDensity: clampDial(visualDensity),
  };
}

export function inferDesignDials(input: {
  prompt: string;
  register: DesignRegister;
  pageKind?: string;
  designSystemName?: string;
}): DesignDials {
  const haystack = [input.prompt, input.pageKind, input.designSystemName].filter(Boolean).join(" ").toLowerCase();

  if (input.register === "product" || /dashboard|admin|settings|tool|table|console/.test(haystack)) {
    return dials(4, 2, 7);
  }

  if (/gallery|media|photo|image|portfolio/.test(haystack)) {
    return dials(7, 4, 5);
  }

  if (/linear|minimal|calm|vercel/.test(haystack)) {
    return dials(5, 3, 3);
  }

  if (/premium saas|saas/.test(haystack)) {
    return dials(6, 4, 4);
  }

  if (/bold|startup|launch|conversion/.test(haystack)) {
    return dials(8, 6, 5);
  }

  if (/apple|minimal/.test(haystack)) {
    return dials(6, 5, 3);
  }

  if (/warm|creator|human|friendly/.test(haystack)) {
    return dials(7, 4, 4);
  }

  return input.register === "brand" ? dials(6, 4, 4) : dials(4, 2, 7);
}

export function formatDesignDials(dialValues: DesignDials) {
  return `variance ${dialValues.designVariance}/10, motion ${dialValues.motionIntensity}/10, density ${dialValues.visualDensity}/10`;
}
