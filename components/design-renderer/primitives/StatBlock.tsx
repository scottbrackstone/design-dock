import type { StatElement, Viewport } from "@/lib/design-schema";
import { getStatStyle } from "@/lib/responsive-design";

export function StatBlock({ element, viewport }: { element: StatElement; viewport: Viewport }) {
  const style = getStatStyle(element, viewport);

  return (
    <div style={{ textAlign: style.align }}>
      <div style={{ color: style.color, fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
        {element.value}
      </div>
      <div style={{ color: style.labelColor, fontSize: 14, fontWeight: 700, marginTop: 10 }}>
        {element.label}
      </div>
    </div>
  );
}
