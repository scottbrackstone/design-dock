"use client";

import { useId } from "react";
import { Input } from "@/components/ui/Input";

type ColorControlProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function ColorControl({ label, value, onChange }: ColorControlProps) {
  const id = useId();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor={id}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          aria-label={`${label} swatch`}
          className="h-10 w-12 rounded-md border border-zinc-700 bg-transparent p-1"
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={value}
        />
        <Input id={id} onChange={(event) => onChange(event.target.value)} value={value} />
      </div>
    </div>
  );
}
