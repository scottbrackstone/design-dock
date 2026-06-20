"use client";

import { ColorControl } from "@/components/inspector/ColorControl";
import { FontControl } from "@/components/inspector/FontControl";
import { SelectControl } from "@/components/inspector/SelectControl";
import { SliderControl } from "@/components/inspector/SliderControl";
import type { Theme } from "@/lib/design-schema";
import { updatePageStyle, updateTheme } from "@/lib/design-actions";
import { useDesignStore } from "@/store/useDesignStore";

const themeOptions: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function PageInspector() {
  const { currentSpec, updateCurrentSpec } = useDesignStore();

  if (!currentSpec) {
    return <p className="text-sm leading-6 text-zinc-500">Generate a design to edit page settings.</p>;
  }

  return (
    <div className="space-y-5">
      <SelectControl
        label="Theme"
        onChange={(theme) => updateCurrentSpec((spec) => updateTheme(spec, theme))}
        options={themeOptions}
        value={currentSpec.theme}
      />
      <ColorControl
        label="Page background"
        onChange={(backgroundColor) =>
          updateCurrentSpec((spec) => updatePageStyle(spec, { backgroundColor }))
        }
        value={currentSpec.page.style.backgroundColor}
      />
      <ColorControl
        label="Page text"
        onChange={(textColor) => updateCurrentSpec((spec) => updatePageStyle(spec, { textColor }))}
        value={currentSpec.page.style.textColor}
      />
      <FontControl
        onChange={(fontFamily) => updateCurrentSpec((spec) => updatePageStyle(spec, { fontFamily }))}
        value={currentSpec.page.style.fontFamily}
      />
      <SliderControl
        label="Max width"
        max={1600}
        min={720}
        onChange={(maxWidth) => updateCurrentSpec((spec) => updatePageStyle(spec, { maxWidth }))}
        step={20}
        value={currentSpec.page.style.maxWidth}
      />
    </div>
  );
}
