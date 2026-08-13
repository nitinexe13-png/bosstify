import { UsersTable } from "@/components/admin/UsersTable";
import { createAdminClient } from "@/lib/supabase/admin";
import { toNumber } from "@/lib/utils";
import type { AdminUser } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Users",
};

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const [{ data: profiles }, { data: orders }] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("orders").select("user_id, charge"),
  ]);

  const orderMap = new Map<string, { count: number; spent: number }>();
  for (const order of orders ?? []) {
    const entry = orderMap.get(order.user_id) ?? { count: 0, spent: 0 };
    entry.count += 1;
    entry.spent += toNumber(order.charge);
    orderMap.set(order.user_id, entry);
  }

  const users: AdminUser[] = (profiles ?? []).map((profile) => {
    const entry = orderMap.get(profile.id) ?? { count: 0, spent: 0 };
    return {
      ...profile,
      balance: toNumber(profile.balance),
      role: profile.role === "admin" ? "admin" : "user",
      orders_count: entry.count,
      total_spent: entry.spent,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-muted">
        {users.length} registered user{users.length === 1 ? "" : "s"}
      </p>
      <div className="mt-6">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
