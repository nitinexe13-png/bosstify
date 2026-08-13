import { OrderTable } from "@/components/orders/OrderTable";
import { createClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function OrdersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  const normalized = (orders ?? []).map((o) => ({
    ...o,
    charge: toNumber(o.charge),
    charge_inr: toNumber(o.charge_inr),
    quantity: toNumber(o.quantity),
    start_count: toNumber(o.start_count),
    remains: toNumber(o.remains),
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-muted">
        Track the status of all your orders.
      </p>
      <div className="mt-6">
        <OrderTable initialOrders={normalized} />
      </div>
    </div>
  );
}
