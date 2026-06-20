import type { TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/tailwind-utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "w-full resize-none rounded-md border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm leading-6 text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20",
        className,
      )}
      {...props}
    />
  );
}
