import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getMultipleOrderStatus } from "@/lib/niva";
import { toNumber } from "@/lib/utils";
import { NextResponse } from "next/server";

const SYNCABLE_STATUSES = ["pending", "processing", "partial", "refunded"];
const CHUNK_SIZE = 100;

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: orders } = await supabase
      .from("orders")
      .select("id, niva_order_id, status")
      .eq("user_id", user.id)
      .in("status", SYNCABLE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(500);

    const pending = (orders ?? []).filter(
      (order) => order.niva_order_id != null
    );

    if (pending.length === 0) {
      return NextResponse.json({ orders: [], updated: 0 });
    }

    const admin = createAdminClient();
    const updated: Array<{ id: number; status: string }> = [];

    for (let i = 0; i < pending.length; i += CHUNK_SIZE) {
      const chunk = pending.slice(i, i + CHUNK_SIZE);
      const nivaIds = chunk.map((order) => Number(order.niva_order_id));

      let entries;
      try {
        entries = await getMultipleOrderStatus(nivaIds);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "NivaMiner API error.";
        return NextResponse.json(
          { error: `Status sync failed: ${message}` },
          { status: 502 }
        );
      }

      const entryMap = new Map(
        entries.map((entry) => [entry.order, entry])
      );

      for (const order of chunk) {
        const entry = entryMap.get(Number(order.niva_order_id));
        if (!entry) continue;

        const { error } = await admin
          .from("orders")
          .update({
            status: entry.status,
            start_count: entry.start_count,
            remains: entry.remains,
          })
          .eq("id", order.id)
          .eq("user_id", user.id);

        if (!error) {
          updated.push({
            id: toNumber(order.id),
            status: entry.status,
          });
        }
      }
    }

    return NextResponse.json({ orders: updated, updated: updated.length });
  } catch (err) {
    console.error("orders/sync error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
