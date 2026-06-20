"use client";

import { cx } from "@/lib/tailwind-utils";

type TabsProps<T extends string> = {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ label, options, value, onChange }: TabsProps<T>) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase text-zinc-500">{label}</div>
      <div className="grid grid-cols-3 rounded-md border border-zinc-800 bg-zinc-950 p-1">
        {options.map((option) => (
          <button
            aria-pressed={value === option.value}
            className={cx(
              "rounded px-2 py-2 text-xs font-bold transition",
              value === option.value ? "bg-teal-500 text-zinc-950" : "text-zinc-400 hover:bg-zinc-800",
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
