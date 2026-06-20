"use client";

import { Input } from "@/components/ui/Input";
import { ColorControl } from "@/components/inspector/ColorControl";
import { SelectControl } from "@/components/inspector/SelectControl";
import { SliderControl } from "@/components/inspector/SliderControl";
import type { ButtonElement, ButtonStyle, ButtonVariant } from "@/lib/design-schema";
import {
  updateButtonElement,
  updateResponsiveButtonFullWidth,
  updateResponsiveButtonStyle,
} from "@/lib/design-actions";
import { getButtonFullWidth, getButtonStyle } from "@/lib/responsive-design";
import { useDesignStore } from "@/store/useDesignStore";

const variantOptions: Array<{ value: ButtonVariant; label: string }> = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "ghost", label: "Ghost" },
  { value: "outline", label: "Outline" },
];

export function ButtonInspector({ element }: { element: ButtonElement }) {
  const { updateCurrentSpec, viewport } = useDesignStore();
  const style = getButtonStyle(element, viewport);
  const fullWidth = getButtonFullWidth(element, viewport);
  const updateStyle = (patch: Partial<ButtonStyle>) =>
    updateCurrentSpec((spec) => updateResponsiveButtonStyle(spec, element.id, viewport, patch));

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="button-label">
          Button label
        </label>
        <Input
          className="mt-2"
          id="button-label"
          onChange={(event) =>
            updateCurrentSpec((spec) => updateButtonElement(spec, element.id, { label: event.target.value }))
          }
          value={element.label}
        />
      </div>
      <SelectControl
        label="Variant"
        onChange={(variant) => updateCurrentSpec((spec) => updateButtonElement(spec, element.id, { variant }))}
        options={variantOptions}
        value={element.variant}
      />
      <label className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-200">
        Full width
        <input
          checked={fullWidth}
          className="h-4 w-4 accent-teal-400"
          onChange={(event) =>
            updateCurrentSpec((spec) =>
              updateResponsiveButtonFullWidth(spec, element.id, viewport, event.target.checked),
            )
          }
          type="checkbox"
        />
      </label>
      <ColorControl
        label="Background"
        onChange={(backgroundColor) => updateStyle({ backgroundColor })}
        value={style.backgroundColor}
      />
      <ColorControl
        label="Text colour"
        onChange={(textColor) => updateStyle({ textColor })}
        value={style.textColor}
      />
      <SliderControl
        label="Radius"
        max={999}
        min={0}
        onChange={(radius) => updateStyle({ radius })}
        value={style.radius}
      />
      <SliderControl
        label="Padding X"
        max={56}
        min={8}
        onChange={(paddingX) => updateStyle({ paddingX })}
        value={style.paddingX}
      />
      <SliderControl
        label="Padding Y"
        max={30}
        min={4}
        onChange={(paddingY) => updateStyle({ paddingY })}
        value={style.paddingY}
      />
      <SliderControl
        label="Font size"
        max={28}
        min={11}
        onChange={(fontSize) => updateStyle({ fontSize })}
        value={style.fontSize}
      />
      <SliderControl
        label="Font weight"
        max={900}
        min={100}
        onChange={(fontWeight) => updateStyle({ fontWeight })}
        step={50}
        value={style.fontWeight}
      />
    </div>
  );
}
