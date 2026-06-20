import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/tailwind-utils";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function Panel({ title, description, actions, className, children, ...props }: PanelProps) {
  return (
    <section
      className={cx("rounded-lg border border-zinc-800 bg-zinc-950/75 shadow-panel", className)}
      {...props}
    >
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-black text-zinc-50">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
