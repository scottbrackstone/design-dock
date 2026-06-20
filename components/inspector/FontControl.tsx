"use client";

import { SelectControl } from "@/components/inspector/SelectControl";

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "ui-serif", label: "Serif" },
  { value: "ui-monospace", label: "Mono" },
];

export function FontControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <SelectControl label="Font family" onChange={onChange} options={fontOptions} value={value} />;
}
