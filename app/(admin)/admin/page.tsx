import { Card, CardBody } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import { buttonClasses } from "@/components/ui/Button";
import { formatCurrency, toNumber } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [{ count: userCount }, { count: orderCount }, { data: orders }, { data: todayOrders }] =
    await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("orders").select("*", { count: "exact", head: true }),
      admin.from("orders").select("charge"),
      admin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfToday()),
    ]);

  const totalRevenue = (orders ?? []).reduce(
    (sum, order) => sum + toNumber(order.charge),
    0
  );

  const stats = [
    { label: "Total Users", value: String(userCount ?? 0) },
    { label: "Total Orders", value: String(orderCount ?? 0) },
    { label: "Total Revenue", value: `$${formatCurrency(totalRevenue)}` },
    { label: "Today's Orders", value: String(todayOrders?.length ?? 0) },
  ];

  const links = [
    {
      href: "/admin/users",
      title: "Manage Users",
      description: "View users, adjust balances and roles.",
    },
    {
      href: "/admin/orders",
      title: "Manage Orders",
      description: "Review all orders and update statuses.",
    },
    {
      href: "/admin/funds",
      title: "Fund Requests",
      description: "Approve or reject fund addition requests.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Platform overview and management tools.
        </p>
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

      <div className="grid gap-4 md:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-card border border-line bg-white p-6 transition-colors hover:bg-surface"
          >
            <h3 className="text-lg font-semibold">{link.title}</h3>
            <p className="mt-2 text-sm text-muted">{link.description}</p>
            <span className={`${buttonClasses({ size: "sm", className: "mt-4" })}`}>
              Open
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function startOfToday(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}
