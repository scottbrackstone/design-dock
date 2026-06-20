"use client";

import { Input } from "@/components/ui/Input";
import { ColorControl } from "@/components/inspector/ColorControl";
import { SelectControl } from "@/components/inspector/SelectControl";
import type { Alignment, StatElement, StatStyle } from "@/lib/design-schema";
import { updateResponsiveStatStyle, updateStatElement } from "@/lib/design-actions";
import { getStatStyle } from "@/lib/responsive-design";
import { useDesignStore } from "@/store/useDesignStore";

const alignOptions: Array<{ value: Alignment; label: string }> = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export function StatInspector({ element }: { element: StatElement }) {
  const { updateCurrentSpec, viewport } = useDesignStore();
  const style = getStatStyle(element, viewport);
  const updateStyle = (patch: Partial<StatStyle>) =>
    updateCurrentSpec((spec) => updateResponsiveStatStyle(spec, element.id, viewport, patch));

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="stat-value">
          Stat value
        </label>
        <Input
          className="mt-2"
          id="stat-value"
          onChange={(event) =>
            updateCurrentSpec((spec) => updateStatElement(spec, element.id, { value: event.target.value }))
          }
          value={element.value}
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="stat-label">
          Stat label
        </label>
        <Input
          className="mt-2"
          id="stat-label"
          onChange={(event) =>
            updateCurrentSpec((spec) => updateStatElement(spec, element.id, { label: event.target.value }))
          }
          value={element.label}
        />
      </div>
      <ColorControl
        label="Value colour"
        onChange={(color) => updateStyle({ color })}
        value={style.color}
      />
      <ColorControl
        label="Label colour"
        onChange={(labelColor) => updateStyle({ labelColor })}
        value={style.labelColor}
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
