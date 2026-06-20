import type { CardElement, Viewport } from "@/lib/design-schema";
import { getNodeDisplayName, getNodeTypeLabel } from "@/lib/design-actions";
import { getCardStyle } from "@/lib/responsive-design";
import { cx } from "@/lib/tailwind-utils";
import { shadowStyles } from "@/components/design-renderer/render-styles";
import { ImagePlaceholder } from "@/components/design-renderer/primitives/ImagePlaceholder";

type CardBlockProps = {
  element: CardElement;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onHoverNode: (nodeId: string) => void;
  onClearHover: () => void;
  viewport: Viewport;
};

export function CardBlock({
  element,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onClearHover,
  viewport,
}: CardBlockProps) {
  const style = getCardStyle(element, viewport);
  const darkCard = style.backgroundColor.toLowerCase() !== "#ffffff";
  const headingColor = darkCard ? "#f8fafc" : "#111827";
  const bodyColor = darkCard ? "#cbd5e1" : "#52525b";
  const imageSelected = selectedNodeId === element.image?.id;
  const imageHovered = hoveredNodeId === element.image?.id;
  const imageLabel = element.image ? `${getNodeTypeLabel(element.image)}: ${getNodeDisplayName(element.image)}` : "";

  return (
    <article
      className="h-full border"
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor ?? "transparent",
        borderRadius: style.radius,
        boxShadow: shadowStyles[style.shadow],
        maxWidth: "100%",
        minHeight: style.minHeight,
        padding: style.padding,
        width: style.width,
      }}
    >
      {element.image && (
        <div
          className={cx(
            "relative mb-5 rounded-md transition",
            imageSelected && "shadow-selected",
            !imageSelected && imageHovered && "outline outline-2 outline-teal-400/70",
          )}
          data-node-id={element.image.id}
          data-node-type={element.image.type}
          data-selectable-element="true"
          onClick={(event) => {
            event.stopPropagation();
            onSelectNode(element.image?.id ?? element.id);
          }}
          onMouseEnter={(event) => {
            event.stopPropagation();
            if (element.image) onHoverNode(element.image.id);
          }}
          onMouseLeave={(event) => {
            event.stopPropagation();
            onClearHover();
          }}
          onMouseMove={(event) => {
            event.stopPropagation();
            if (element.image) onHoverNode(element.image.id);
          }}
        >
          {(imageSelected || imageHovered) && (
            <span
              className={cx(
                "absolute -top-3 left-2 z-20 max-w-[min(20rem,calc(100vw-3rem))] truncate rounded px-2 py-0.5 text-[11px] font-black",
                imageSelected
                  ? "bg-teal-400 text-zinc-950"
                  : "bg-zinc-950/90 text-teal-200 ring-1 ring-teal-400/40",
              )}
            >
              {imageLabel}
            </span>
          )}
          <ImagePlaceholder element={element.image} viewport={viewport} />
        </div>
      )}
      <h3 className="text-xl font-black leading-tight" style={{ color: headingColor }}>
        {element.title}
      </h3>
      <p className="mt-3 text-sm leading-6" style={{ color: bodyColor }}>
        {element.body}
      </p>
    </article>
  );
}
