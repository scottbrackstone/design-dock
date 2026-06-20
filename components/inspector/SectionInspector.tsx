"use client";

import { Button } from "@/components/ui/Button";
import { ColorControl } from "@/components/inspector/ColorControl";
import { SelectControl } from "@/components/inspector/SelectControl";
import { SliderControl } from "@/components/inspector/SliderControl";
import type {
  Alignment,
  SectionButtonLayout,
  SectionImagePosition,
  SectionLayout,
  SectionNode,
  SectionStyle,
  ShadowLevel,
} from "@/lib/design-schema";
import {
  updateResponsiveSectionButtonLayout,
  updateResponsiveSectionColumns,
  updateResponsiveSectionImagePosition,
  updateResponsiveSectionLayout,
  updateResponsiveSectionStyle,
} from "@/lib/design-actions";
import {
  getSectionButtonLayout,
  getSectionColumns,
  getSectionImagePosition,
  getSectionLayout,
  getSectionStyle,
} from "@/lib/responsive-design";
import { useDesignStore } from "@/store/useDesignStore";

const layoutOptions: Array<{ value: SectionLayout; label: string }> = [
  { value: "stack", label: "Stack" },
  { value: "split", label: "Split" },
  { value: "grid", label: "Grid" },
  { value: "cards", label: "Cards" },
  { value: "centered", label: "Centered" },
  { value: "inline", label: "Inline" },
  { value: "footer-columns", label: "Footer columns" },
];

const backgroundOptions: Array<{ value: SectionStyle["backgroundType"]; label: string }> = [
  { value: "transparent", label: "Transparent" },
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Image tone" },
];

const shadowOptions: Array<{ value: ShadowLevel; label: string }> = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

const alignOptions: Array<{ value: Alignment; label: string }> = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const buttonLayoutOptions: Array<{ value: SectionButtonLayout; label: string }> = [
  { value: "inline", label: "Inline" },
  { value: "stack", label: "Stack" },
];

const imagePositionOptions: Array<{ value: SectionImagePosition; label: string }> = [
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
];

export function SectionInspector({ section }: { section: SectionNode }) {
  const { moveSelectedSection, updateCurrentSpec, viewport } = useDesignStore();
  const style = getSectionStyle(section, viewport);
  const layout = getSectionLayout(section, viewport);
  const columns = getSectionColumns(section, viewport);
  const buttonLayout = getSectionButtonLayout(section, viewport);
  const imagePosition = getSectionImagePosition(section, viewport);
  const updateStyle = (patch: Partial<SectionStyle>) =>
    updateCurrentSpec((spec) => updateResponsiveSectionStyle(spec, section.id, viewport, patch));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase text-zinc-500">Section</p>
        <h3 className="mt-1 text-base font-black text-zinc-50">{section.name}</h3>
      </div>
      <SelectControl
        label="Layout"
        onChange={(nextLayout) =>
          updateCurrentSpec((spec) => updateResponsiveSectionLayout(spec, section.id, viewport, nextLayout))
        }
        options={layoutOptions}
        value={layout}
      />
      <SliderControl
        label="Grid columns"
        max={4}
        min={1}
        onChange={(nextColumns) =>
          updateCurrentSpec((spec) => updateResponsiveSectionColumns(spec, section.id, viewport, nextColumns))
        }
        value={columns}
      />
      <SelectControl
        label="Button layout"
        onChange={(nextButtonLayout) =>
          updateCurrentSpec((spec) =>
            updateResponsiveSectionButtonLayout(spec, section.id, viewport, nextButtonLayout),
          )
        }
        options={buttonLayoutOptions}
        value={buttonLayout}
      />
      <SelectControl
        label="Image position"
        onChange={(nextImagePosition) =>
          updateCurrentSpec((spec) =>
            updateResponsiveSectionImagePosition(spec, section.id, viewport, nextImagePosition),
          )
        }
        options={imagePositionOptions}
        value={imagePosition}
      />
      <SelectControl
        label="Background"
        onChange={(backgroundType) => updateStyle({ backgroundType })}
        options={backgroundOptions}
        value={style.backgroundType}
      />
      <ColorControl
        label="Background colour"
        onChange={(backgroundColor) => updateStyle({ backgroundColor })}
        value={style.backgroundColor ?? "#ffffff"}
      />
      {style.backgroundType === "gradient" && (
        <>
          <ColorControl
            label="Gradient from"
            onChange={(gradientFrom) => updateStyle({ gradientFrom })}
            value={style.gradientFrom ?? "#ffffff"}
          />
          <ColorControl
            label="Gradient to"
            onChange={(gradientTo) => updateStyle({ gradientTo })}
            value={style.gradientTo ?? "#ccfbf1"}
          />
        </>
      )}
      <SelectControl
        label="Alignment"
        onChange={(align) => updateStyle({ align })}
        options={alignOptions}
        value={style.align}
      />
      <SliderControl
        label="Padding top"
        max={180}
        min={0}
        onChange={(paddingTop) => updateStyle({ paddingTop })}
        value={style.paddingTop}
      />
      <SliderControl
        label="Padding bottom"
        max={180}
        min={0}
        onChange={(paddingBottom) => updateStyle({ paddingBottom })}
        value={style.paddingBottom}
      />
      <SliderControl
        label="Padding X"
        max={80}
        min={0}
        onChange={(paddingX) => updateStyle({ paddingX })}
        value={style.paddingX}
      />
      <SliderControl
        label="Gap"
        max={80}
        min={0}
        onChange={(gap) => updateStyle({ gap })}
        value={style.gap}
      />
      <SliderControl
        label="Radius"
        max={64}
        min={0}
        onChange={(borderRadius) => updateStyle({ borderRadius })}
        value={style.borderRadius}
      />
      <SelectControl
        label="Shadow"
        onChange={(shadow) => updateStyle({ shadow })}
        options={shadowOptions}
        value={style.shadow}
      />
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => moveSelectedSection("up")}>Move up</Button>
        <Button onClick={() => moveSelectedSection("down")}>Move down</Button>
      </div>
    </div>
  );
}
