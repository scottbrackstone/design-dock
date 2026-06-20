"use client";

import { useId } from "react";
import { Input } from "@/components/ui/Input";

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

export function SliderControl({ label, value, min, max, step = 1, onChange }: SliderControlProps) {
  const id = useId();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-bold uppercase text-zinc-500" htmlFor={id}>
          {label}
        </label>
        <Input
          aria-label={`${label} value`}
          className="h-8 min-h-8 w-20 px-2 py-1 text-xs"
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          type="number"
          value={value}
        />
      </div>
      <input
        className="w-full accent-teal-400"
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </div>
  );
}
