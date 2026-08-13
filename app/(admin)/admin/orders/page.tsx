import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { createAdminClient } from "@/lib/supabase/admin";
import { toNumber } from "@/lib/utils";
import type { AdminOrder } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Orders",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { user_id?: string };
}) {
  const admin = createAdminClient();

  let query = admin
    .from("orders")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false });

  if (searchParams.user_id) {
    query = query.eq("user_id", searchParams.user_id);
  }

  const { data: rawOrders } = await query.limit(1000);

  const orders: AdminOrder[] = (rawOrders ?? []).map((order) => ({
    id: Number(order.id),
    user_id: order.user_id,
    niva_order_id: order.niva_order_id,
    service_id: Number(order.service_id),
    service_name: order.service_name,
    link: order.link,
    quantity: toNumber(order.quantity),
    charge: toNumber(order.charge),
    charge_inr: toNumber(order.charge_inr),
    status: order.status,
    start_count: toNumber(order.start_count),
    remains: toNumber(order.remains),
    created_at: order.created_at,
    user_email: order.profiles?.email ?? undefined,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-muted">
        {orders.length} order{orders.length === 1 ? "" : "s"} in view
      </p>
      <div className="mt-6">
        <AdminOrdersTable orders={orders} />
      </div>
    </div>
  );
}
