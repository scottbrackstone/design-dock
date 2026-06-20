"use client";

import { useId } from "react";

type SelectControlProps<T extends string | number> = {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
};

export function SelectControl<T extends string | number>({ label, value, options, onChange }: SelectControlProps<T>) {
  const id = useId();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor={id}>
        {label}
      </label>
      <select
        className="min-h-10 w-full rounded-md border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
        id={id}
        onChange={(event) => {
          const selected = options.find((option) => String(option.value) === event.target.value);
          if (selected) onChange(selected.value);
        }}
        value={String(value)}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
