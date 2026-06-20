import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/tailwind-utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "border-teal-500 bg-teal-500 text-zinc-950 hover:bg-teal-400",
  secondary: "border-zinc-600 bg-zinc-800 text-zinc-50 hover:bg-zinc-700",
  ghost: "border-transparent bg-transparent text-zinc-300 hover:bg-zinc-800",
  danger: "border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25",
};

export function Button({ className, variant = "secondary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex min-h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
