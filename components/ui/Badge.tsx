import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import type { HTMLAttributes } from "react";

export type BadgeVariant = "gray" | "black" | "green" | "red" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  gray: "bg-surface text-muted border border-line",
  black: "bg-black text-white",
  green: "bg-green-600 text-white",
  red: "bg-red-600 text-white",
  outline: "bg-white text-black border border-line",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export function orderStatusBadge(status: OrderStatus): BadgeVariant {
  switch (status) {
    case "processing":
      return "black";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
}
