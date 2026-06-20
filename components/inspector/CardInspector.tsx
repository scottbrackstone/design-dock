"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ColorControl } from "@/components/inspector/ColorControl";
import { SelectControl } from "@/components/inspector/SelectControl";
import { SliderControl } from "@/components/inspector/SliderControl";
import type { CardElement, CardStyle, ShadowLevel } from "@/lib/design-schema";
import { updateCardElement, updateResponsiveCardStyle } from "@/lib/design-actions";
import { getCardStyle } from "@/lib/responsive-design";
import { useDesignStore } from "@/store/useDesignStore";

const shadowOptions: Array<{ value: ShadowLevel; label: string }> = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

export function CardInspector({ element }: { element: CardElement }) {
  const { updateCurrentSpec, viewport } = useDesignStore();
  const style = getCardStyle(element, viewport);
  const updateStyle = (patch: Partial<CardStyle>) =>
    updateCurrentSpec((spec) => updateResponsiveCardStyle(spec, element.id, viewport, patch));

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="card-title">
          Card title
        </label>
        <Input
          className="mt-2"
          id="card-title"
          onChange={(event) =>
            updateCurrentSpec((spec) => updateCardElement(spec, element.id, { title: event.target.value }))
          }
          value={element.title}
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="card-body">
          Card body
        </label>
        <Textarea
          className="mt-2"
          id="card-body"
          onChange={(event) =>
            updateCurrentSpec((spec) => updateCardElement(spec, element.id, { body: event.target.value }))
          }
          rows={4}
          value={element.body}
        />
      </div>
      <ColorControl
        label="Background"
        onChange={(backgroundColor) => updateStyle({ backgroundColor })}
        value={style.backgroundColor}
      />
      <ColorControl
        label="Border"
        onChange={(borderColor) => updateStyle({ borderColor })}
        value={style.borderColor ?? "#e4e4e7"}
      />
      <SliderControl
        label="Padding"
        max={64}
        min={8}
        onChange={(padding) => updateStyle({ padding })}
        value={style.padding}
      />
      <SliderControl
        label="Width"
        max={900}
        min={180}
        onChange={(width) => updateStyle({ width })}
        value={style.width ?? 320}
      />
      <SliderControl
        label="Minimum height"
        max={900}
        min={80}
        onChange={(minHeight) => updateStyle({ minHeight })}
        value={style.minHeight ?? 180}
      />
      <SliderControl
        label="Radius"
        max={48}
        min={0}
        onChange={(radius) => updateStyle({ radius })}
        value={style.radius}
      />
      <SelectControl
        label="Shadow"
        onChange={(shadow) => updateStyle({ shadow })}
        options={shadowOptions}
        value={style.shadow}
      />
    </div>
  );
}
