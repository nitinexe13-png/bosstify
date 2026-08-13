import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { orderStatusBadge, Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const balance = toNumber(profile?.balance);
  const allOrders = orders ?? [];
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
  const completedOrders = allOrders.filter(
    (o) => o.status === "completed"
  ).length;
  const recentOrders = allOrders.slice(0, 5);

  const stats = [
    { label: "Balance", value: `$${formatCurrency(balance)}` },
    { label: "Total Orders", value: String(totalOrders) },
    { label: "Pending", value: String(pendingOrders) },
    { label: "Completed", value: String(completedOrders) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back! Here&apos;s an overview of your account.
          </p>
        </div>
        <Link href="/new-order">
          <Button>+ New Order</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <Link
            href="/orders"
            className="text-sm font-medium text-black underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardBody className="px-0 py-0">
          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No orders yet.{" "}
              <Link href="/new-order" className="text-black underline">
                Place your first order
              </Link>
              .
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Service</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">
                      Qty
                    </th>
                    <th className="hidden px-5 py-3 font-medium sm:table-cell">
                      Charge
                    </th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-5 py-3 font-medium">#{order.id}</td>
                      <td className="max-w-[200px] truncate px-5 py-3">
                        {order.service_name}
                      </td>
                      <td className="hidden px-5 py-3 md:table-cell">
                        {order.quantity}
                      </td>
                      <td className="hidden px-5 py-3 sm:table-cell">
                        ${formatCurrency(toNumber(order.charge))}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={orderStatusBadge(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="hidden px-5 py-3 text-muted lg:table-cell">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
