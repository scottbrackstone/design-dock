import type { InputHTMLAttributes } from "react";
import { cx } from "@/lib/tailwind-utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "min-h-10 w-full rounded-md border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20",
        className,
      )}
      {...props}
    />
  );
}
