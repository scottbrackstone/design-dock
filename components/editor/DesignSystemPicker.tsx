"use client";

import { ColorControl } from "@/components/inspector/ColorControl";
import { SelectControl } from "@/components/inspector/SelectControl";
import { SliderControl } from "@/components/inspector/SliderControl";
import type { ColorTokenName, RadiusTokenName, TypographyTokenName } from "@/lib/design-systems";
import { useDesignStore } from "@/store/useDesignStore";

const colorControls: Array<{ key: ColorTokenName; label: string }> = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "card", label: "Card" },
  { key: "border", label: "Border" },
  { key: "muted", label: "Muted" },
];

const radiusControls: Array<{ key: RadiusTokenName; label: string; max: number }> = [
  { key: "sm", label: "Radius sm", max: 80 },
  { key: "md", label: "Radius md", max: 80 },
  { key: "lg", label: "Radius lg", max: 120 },
  { key: "xl", label: "Radius xl", max: 160 },
];

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "SF Pro Display", label: "SF Pro Display" },
  { value: "SF Pro Text", label: "SF Pro Text" },
  { value: "ui-serif", label: "Serif" },
  { value: "ui-monospace", label: "Mono" },
];

const typographyControls: Array<{ key: TypographyTokenName; label: string }> = [
  { key: "headingFont", label: "Heading font" },
  { key: "bodyFont", label: "Body font" },
];

export function DesignSystemPicker() {
  const {
    currentSpec,
    designSystems,
    selectedDesignSystem,
    selectDesignSystem,
    updateSelectedDesignSystemColor,
    updateSelectedDesignSystemRadius,
    updateSelectedDesignSystemTypography,
  } = useDesignStore();
  const designSystemOptions = designSystems.map((system) => ({ value: system.id, label: system.name }));

  return (
    <div className="space-y-4 rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
      <div>
        <p className="text-xs font-bold uppercase text-zinc-500">Design system</p>
        <p className="mt-1 text-sm font-bold text-zinc-100">{selectedDesignSystem.name}</p>
        {currentSpec ? (
          <p className="mt-1 text-xs leading-5 text-zinc-500">Current canvas: {currentSpec.designSystem.name}</p>
        ) : null}
      </div>

      <SelectControl
        label="Preset"
        onChange={selectDesignSystem}
        options={designSystemOptions}
        value={selectedDesignSystem.id}
      />

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase text-zinc-500">Colours</p>
        <div className="grid gap-3">
          {colorControls.map((control) => (
            <ColorControl
              key={control.key}
              label={control.label}
              onChange={(value) => updateSelectedDesignSystemColor(control.key, value)}
              value={selectedDesignSystem.tokens.colors[control.key]}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase text-zinc-500">Radius</p>
        <div className="grid gap-3">
          {radiusControls.map((control) => (
            <SliderControl
              key={control.key}
              label={control.label}
              max={control.max}
              min={0}
              onChange={(value) => updateSelectedDesignSystemRadius(control.key, value)}
              value={selectedDesignSystem.tokens.radius[control.key]}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase text-zinc-500">Fonts</p>
        <div className="grid gap-3">
          {typographyControls.map((control) => (
            <SelectControl
              key={control.key}
              label={control.label}
              onChange={(value) => updateSelectedDesignSystemTypography(control.key, value)}
              options={fontOptions}
              value={selectedDesignSystem.tokens.typography[control.key] ?? "Inter"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
