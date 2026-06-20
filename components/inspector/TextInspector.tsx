"use client";

import { Textarea } from "@/components/ui/Textarea";
import { ColorControl } from "@/components/inspector/ColorControl";
import { FontControl } from "@/components/inspector/FontControl";
import { SelectControl } from "@/components/inspector/SelectControl";
import { SliderControl } from "@/components/inspector/SliderControl";
import type { Alignment, TextElement, TextStyle } from "@/lib/design-schema";
import { updateResponsiveTextStyle, updateTextElement } from "@/lib/design-actions";
import { getTextStyle } from "@/lib/responsive-design";
import { useDesignStore } from "@/store/useDesignStore";

const alignOptions: Array<{ value: Alignment; label: string }> = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export function TextInspector({ element }: { element: TextElement }) {
  const { updateCurrentSpec, viewport } = useDesignStore();
  const style = getTextStyle(element, viewport);
  const updateStyle = (patch: Partial<TextStyle>) =>
    updateCurrentSpec((spec) => updateResponsiveTextStyle(spec, element.id, viewport, patch));

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="text-content">
          Text content
        </label>
        <Textarea
          className="mt-2"
          id="text-content"
          onChange={(event) =>
            updateCurrentSpec((spec) => updateTextElement(spec, element.id, { content: event.target.value }))
          }
          rows={4}
          value={element.content}
        />
      </div>
      <FontControl
        onChange={(fontFamily) => updateStyle({ fontFamily })}
        value={style.fontFamily}
      />
      <SliderControl
        label="Font size"
        max={96}
        min={10}
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
      <SliderControl
        label="Line height"
        max={2.1}
        min={0.9}
        onChange={(lineHeight) => updateStyle({ lineHeight })}
        step={0.05}
        value={style.lineHeight}
      />
      <ColorControl
        label="Text colour"
        onChange={(color) => updateStyle({ color })}
        value={style.color}
      />
      <SelectControl
        label="Alignment"
        onChange={(align) => updateStyle({ align })}
        options={alignOptions}
        value={style.align}
      />
    </div>
  );
}
