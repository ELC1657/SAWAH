"use client";

import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { fast } from "@/lib/motion";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-soft disabled:bg-faint shadow-rest hover:shadow-lift",
  secondary:
    "bg-surface text-ink border border-hairline-strong hover:border-ink hover:bg-paper-sunk",
  ghost: "text-muted hover:text-ink hover:bg-paper-sunk",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-11 px-5 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <motion.button
      whileHover={props.disabled ? undefined : { y: -1 }}
      whileTap={props.disabled ? undefined : { y: 0, scale: 0.985 }}
      transition={fast}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[2px]",
        "font-medium tracking-[-0.01em] transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...(props as ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
