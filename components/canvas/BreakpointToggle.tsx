"use client";

import type { Viewport } from "@/lib/design-schema";
import { Tabs } from "@/components/ui/Tabs";
import { useDesignStore } from "@/store/useDesignStore";

const options: Array<{ value: Viewport; label: string }> = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

export function BreakpointToggle() {
  const { setViewport, viewport } = useDesignStore();
  return <Tabs label="Preview/edit" onChange={setViewport} options={options} value={viewport} />;
}
