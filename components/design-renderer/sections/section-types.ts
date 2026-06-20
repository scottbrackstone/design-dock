import type { SectionNode, Viewport } from "@/lib/design-schema";

export type SectionRendererProps = {
  section: SectionNode;
  viewport: Viewport;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onHoverNode: (nodeId: string) => void;
  onClearHover: () => void;
};
