import type { OrderStatus } from "@/types";

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export function round2(value: number): number {
  return Math.round(Number(value) * 100) / 100;
}

export function calculateChargeINR(quantity: number, pricePer1000: number): number {
  const charge = (Number(quantity) / 1000) * Number(pricePer1000);
  return round2(charge);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateCharge(quantity: number, rate: number): number {
  const charge = (Number(quantity) / 1000) * Number(rate);
  return Math.round(charge * 10000) / 10000;
}

export function round4(value: number): number {
  return Math.round(Number(value) * 10000) / 10000;
}

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "partial",
  "refunded",
];

export const ADMIN_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
