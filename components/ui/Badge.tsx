import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import type { HTMLAttributes } from "react";

export type BadgeVariant = "gray" | "black" | "green" | "red" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  gray: "border border-line bg-transparent text-muted",
  black: "bg-gray-900 text-white",
  green: "border border-black bg-transparent text-black",
  red: "border border-gray-300 bg-transparent text-gray-400",
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
