"use client";

import type { ReactNode } from "react";
import type { Viewport } from "@/lib/design-schema";
import { cx } from "@/lib/tailwind-utils";

const viewportClasses: Record<Viewport, string> = {
  desktop: "w-[1100px]",
  tablet: "w-[760px]",
  mobile: "w-[390px]",
};

export function CanvasViewport({ children, viewport }: { children: ReactNode; viewport: Viewport }) {
  return (
    <div
      className={cx(
        "min-h-[640px] overflow-hidden rounded-lg bg-white text-zinc-950 shadow-2xl transition-all",
        viewportClasses[viewport],
      )}
    >
      {children}
    </div>
  );
}
