"use client";

import { Input } from "@/components/ui/Input";
import { ColorControl } from "@/components/inspector/ColorControl";
import { SelectControl } from "@/components/inspector/SelectControl";
import { SliderControl } from "@/components/inspector/SliderControl";
import type { ImageElement, ImageStyle } from "@/lib/design-schema";
import { updateImageElement, updateResponsiveImageStyle } from "@/lib/design-actions";
import { getImageStyle } from "@/lib/responsive-design";
import { useDesignStore } from "@/store/useDesignStore";

const aspectOptions: Array<{ value: ImageStyle["aspectRatio"]; label: string }> = [
  { value: "wide", label: "Wide" },
  { value: "video", label: "Video" },
  { value: "square", label: "Square" },
  { value: "portrait", label: "Portrait" },
];

export function ImageInspector({ element }: { element: ImageElement }) {
  const { updateCurrentSpec, viewport } = useDesignStore();
  const style = getImageStyle(element, viewport);
  const updateStyle = (patch: Partial<ImageStyle>) =>
    updateCurrentSpec((spec) => updateResponsiveImageStyle(spec, element.id, viewport, patch));

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="image-label">
          Image label
        </label>
        <Input
          className="mt-2"
          id="image-label"
          onChange={(event) =>
            updateCurrentSpec((spec) => updateImageElement(spec, element.id, { label: event.target.value }))
          }
          value={element.label ?? ""}
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="image-alt">
          Alt text
        </label>
        <Input
          className="mt-2"
          id="image-alt"
          onChange={(event) =>
            updateCurrentSpec((spec) => updateImageElement(spec, element.id, { alt: event.target.value }))
          }
          value={element.alt}
        />
      </div>
      <ColorControl
        label="Image tone"
        onChange={(backgroundColor) => updateStyle({ backgroundColor })}
        value={style.backgroundColor}
      />
      <SliderControl
        label="Radius"
        max={48}
        min={0}
        onChange={(radius) => updateStyle({ radius })}
        value={style.radius}
      />
      <SliderControl
        label="Width"
        max={1200}
        min={120}
        onChange={(width) => updateStyle({ width })}
        value={style.width ?? 420}
      />
      <SliderControl
        label="Minimum height"
        max={900}
        min={80}
        onChange={(minHeight) => updateStyle({ minHeight })}
        value={style.minHeight ?? 220}
      />
      <SelectControl
        label="Aspect ratio"
        onChange={(aspectRatio) => updateStyle({ aspectRatio })}
        options={aspectOptions}
        value={style.aspectRatio}
      />
    </div>
  );
}
