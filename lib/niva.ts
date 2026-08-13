import type { NivaOrderStatusEntry, OrderStatus, Service } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { toNumber } from "@/lib/utils";

const NIVA_API_URL =
  process.env.NIVA_API_URL?.replace(/\/+$/, "") ??
  "https://niva-miners.com/api/v1";
const NIVA_API_KEY = process.env.NIVA_API_KEY ?? "";

export class NivaApiError extends Error {
  constructor(message: string, public code?: string | number) {
    super(message);
    this.name = "NivaApiError";
  }
}

interface NivaResponse {
  error: number | string;
  message?: string;
  [key: string]: unknown;
}

interface NivaServiceRaw {
  service: number | string;
  name: string;
  type: string;
  category: string;
  rate: number | string;
  min: number | string;
  max: number | string;
  refill?: boolean | number | string;
  cancel?: boolean | number | string;
}

interface NivaStatusEntryRaw {
  order: number | string;
  status: string;
  start_count?: number | string;
  remains?: number | string;
}

interface NivaAddResponse extends NivaResponse {
  order?: number | string;
}

interface NivaBalanceResponse extends NivaResponse {
  balance?: number | string;
}

interface NivaServicesResponse extends NivaResponse {
  services?: NivaServiceRaw[];
}

interface NivaStatusResponse extends NivaResponse {
  status?: string | NivaStatusEntryRaw[];
  start_count?: number | string;
  remains?: number | string;
}

async function request<T extends NivaResponse>(
  params: Record<string, string | number>
): Promise<T> {
  const response = await fetch(`${NIVA_API_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: NIVA_API_KEY,
      ...params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new NivaApiError(
      `NivaMiner API request failed with HTTP ${response.status}.`,
      response.status
    );
  }

  const json = (await response.json()) as T;

  const errorValue = json.error;
  const hasError = errorValue !== 0 && errorValue !== "0" && errorValue != null;
  if (hasError) {
    throw new NivaApiError(
      json.message || `NivaMiner API error (code: ${errorValue}).`,
      String(errorValue)
    );
  }

  return json;
}

function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }
  return false;
}

export function normalizeOrderStatus(status: string): OrderStatus {
  const s = (status || "").toLowerCase();
  if (s.includes("complete") || s.includes("done")) return "completed";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("process") || s.includes("active")) return "processing";
  if (s.includes("partial")) return "partial";
  if (s.includes("refund")) return "refunded";
  return "pending";
}

function toStatusEntry(
  order: string | number,
  raw: NivaStatusEntryRaw | string,
  startCount?: number | string,
  remains?: number | string
): NivaOrderStatusEntry {
  if (typeof raw === "string") {
    return {
      order: toNumber(order),
      status: normalizeOrderStatus(raw),
      rawStatus: raw,
      start_count: toNumber(startCount),
      remains: toNumber(remains),
    };
  }
  return {
    order: toNumber(raw.order),
    status: normalizeOrderStatus(raw.status),
    rawStatus: raw.status,
    start_count: toNumber(raw.start_count),
    remains: toNumber(raw.remains),
  };
}

export async function getServices(): Promise<Service[]> {
  const json = await request<NivaServicesResponse>({ action: "services" });
  const raw = json.services ?? [];
  return raw.map((s) => ({
    id: toNumber(s.service),
    name: s.name,
    type: s.type,
    category: s.category,
    rate: toNumber(s.rate),
    min: toNumber(s.min),
    max: toNumber(s.max),
    refill: toBool(s.refill),
    cancel: toBool(s.cancel),
  }));
}

export async function addOrder(
  serviceId: number,
  link: string,
  quantity: number
): Promise<number> {
  const json = await request<NivaAddResponse>({
    action: "add",
    service: serviceId,
    link,
    quantity,
  });
  const orderId = json.order;
  if (orderId == null) {
    throw new NivaApiError(
      "NivaMiner API did not return an order id for the placed order."
    );
  }
  return toNumber(orderId);
}

export async function getOrderStatus(
  orderId: number
): Promise<NivaOrderStatusEntry> {
  const json = await request<NivaStatusResponse>({
    action: "status",
    order: orderId,
  });
  if (typeof json.status === "string") {
    return toStatusEntry(orderId, json.status, json.start_count, json.remains);
  }
  const first = (json.status ?? [])[0] as NivaStatusEntryRaw | undefined;
  if (!first) {
    throw new NivaApiError("NivaMiner API returned no status for this order.");
  }
  return toStatusEntry(first.order, first);
}

export async function getMultipleOrderStatus(
  orderIds: number[]
): Promise<NivaOrderStatusEntry[]> {
  const results: NivaOrderStatusEntry[] = [];
  const CHUNK_SIZE = 100;

  for (let i = 0; i < orderIds.length; i += CHUNK_SIZE) {
    const chunk = orderIds.slice(i, i + CHUNK_SIZE);
    const json = await request<NivaStatusResponse>({
      action: "status",
      orders: chunk.join(","),
    });

    if (Array.isArray(json.status)) {
      for (const entry of json.status as NivaStatusEntryRaw[]) {
        results.push(toStatusEntry(entry.order, entry));
      }
    } else if (typeof json.status === "string") {
      results.push(toStatusEntry(chunk[0], json.status));
    }
  }

  return results;
}

export async function getBalance(): Promise<number> {
  const json = await request<NivaBalanceResponse>({ action: "balance" });
  return toNumber(json.balance);
}

export async function refreshServicesCache(): Promise<Service[]> {
  const services = await getServices();
  const admin = createAdminClient();

  const rows = services.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    category: s.category,
    rate: s.rate,
    min: s.min,
    max: s.max,
    refill: s.refill,
    cancel: s.cancel,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await admin
    .from("services_cache")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    throw new NivaApiError(`Failed to save services: ${error.message}`);
  }

  return services;
}
