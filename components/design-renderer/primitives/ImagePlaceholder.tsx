import type { ImageElement, Viewport } from "@/lib/design-schema";
import { getImageStyle } from "@/lib/responsive-design";

const aspectRatios = {
  square: "1 / 1",
  video: "16 / 10",
  wide: "21 / 9",
  portrait: "4 / 5",
};

export function ImagePlaceholder({ element, viewport }: { element: ImageElement; viewport: Viewport }) {
  const style = getImageStyle(element, viewport);

  return (
    <div
      aria-label={element.alt}
      className="relative flex min-h-48 overflow-hidden border border-white/50 p-5"
      role="img"
      style={{
        aspectRatio: aspectRatios[style.aspectRatio],
        background:
          style.backgroundColor === "#ffffff"
            ? "linear-gradient(135deg, #ffffff, #e2e8f0)"
            : `linear-gradient(135deg, ${style.backgroundColor}, #0f766e)`,
        borderRadius: style.radius,
        maxWidth: "100%",
        minHeight: style.minHeight,
        width: style.width,
      }}
    >
      <div className="absolute inset-5 rounded-md border border-white/35" />
      <div className="mt-auto rounded-full bg-white/85 px-3 py-1 text-xs font-black text-zinc-950">
        {element.label ?? element.alt}
      </div>
    </div>
  );
}
