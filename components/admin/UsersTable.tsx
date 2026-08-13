"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatINR, formatDateShort } from "@/lib/utils";
import type { AdminUser } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [balanceUser, setBalanceUser] = useState<AdminUser | null>(null);
  const [balanceMode, setBalanceMode] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roleLoadingId, setRoleLoadingId] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      (u.email ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (u.username ?? "").toLowerCase().includes(query.toLowerCase())
  );

  function openModal(user: AdminUser, mode: "add" | "remove") {
    setBalanceUser(user);
    setBalanceMode(mode);
    setAmount("");
    setError(null);
  }

  async function handleAdjustBalance() {
    if (!balanceUser) return;
    const value = Number(amount);
    if (!amount || !Number.isFinite(value) || value <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    if (balanceMode === "remove" && value > balanceUser.balance) {
      setError("Cannot remove more than the user's current balance.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: balanceUser.id,
          amount: value,
          action: balanceMode,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update balance.");
      }
      setBalanceUser(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update balance.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setRoleLoadingId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update role.");
      }
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setRoleLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by email or username…"
        className="h-10 w-full max-w-sm rounded-btn border border-line bg-white px-3 text-sm text-black placeholder:text-muted focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
      />

      <Card>
        <CardBody className="px-0 py-0">
          {filtered.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted">
              No users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Balance</th>
                    <th className="px-5 py-3 font-medium">Orders</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">
                      Total Spent
                    </th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">
                      Joined
                    </th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium">{user.username ?? "—"}</p>
                        <p className="text-xs text-muted">{user.email ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3 font-semibold">
                        {formatINR(user.balance)}
                      </td>
                      <td className="px-5 py-3">{user.orders_count}</td>
                      <td className="hidden px-5 py-3 md:table-cell">
                        {formatINR(user.total_spent)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === "admin" ? "black" : "gray"}>
                            {user.role}
                          </Badge>
                          <select
                            value={user.role}
                            disabled={roleLoadingId === user.id}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            className="h-8 rounded-btn border border-line bg-white px-2 text-xs text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 text-muted lg:table-cell">
                        {formatDateShort(user.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openModal(user, "add")}
                          >
                            + Add
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openModal(user, "remove")}
                          >
                            − Remove
                          </Button>
                          <Link
                            href={`/admin/orders?user_id=${user.id}`}
                            className="text-xs font-medium text-black underline"
                          >
                            Orders
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {balanceUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-card border border-line bg-white p-6">
            <h3 className="text-lg font-semibold">
              {balanceMode === "add" ? "Add" : "Remove"} Balance
            </h3>
            <p className="mt-1 text-sm text-muted">
              {balanceUser.email ?? balanceUser.username}
            </p>
            <div className="mt-4 space-y-4">
              <Input
                id="amount"
                type="number"
                min="0.0001"
                step="any"
                label="Amount (₹)"
                placeholder="e.g. 1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                hint={
                  balanceMode === "remove"
                    ? `Current balance: ${formatINR(balanceUser.balance)}`
                    : undefined
                }
              />
              {error && (
                <p
                  role="alert"
                  className="rounded-btn border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-600"
                >
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setBalanceUser(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleAdjustBalance} loading={loading}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
