"use client";

import { Badge, orderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ADMIN_ORDER_STATUSES, formatINR, formatDate } from "@/lib/utils";
import type { AdminOrder } from "@/types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const PAGE_SIZE = 15;

export function AdminOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (dateFilter && new Date(order.created_at) < new Date(dateFilter)) {
        return false;
      }
      if (q) {
        const haystack = [
          order.service_name,
          order.link,
          order.user_email ?? "",
          String(order.id),
          order.niva_order_id ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, query, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageOrders = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleStatusChange(order: AdminOrder, status: string) {
    setUpdatingId(order.id);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status.");
      }
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="status-filter" className="mb-1 block text-xs font-medium text-muted">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-btn border border-line bg-white px-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All statuses</option>
            {ADMIN_ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search order, user, link…"
          className="h-9 w-full max-w-xs rounded-btn border border-line bg-white px-3 text-sm text-black placeholder:text-muted focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-btn border border-line bg-white px-3 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <Card>
        <CardBody className="px-0 py-0">
          {pageOrders.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted">
              No orders match your filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Service</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">
                      Link
                    </th>
                    <th className="px-5 py-3 font-medium">Qty</th>
                    <th className="px-5 py-3 font-medium">Charge</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="hidden px-5 py-3 font-medium xl:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium">#{order.id}</p>
                        {order.niva_order_id && (
                          <p className="text-xs text-muted">
                            Ref: {order.niva_order_id}
                          </p>
                        )}
                      </td>
                      <td className="max-w-[160px] truncate px-5 py-3">
                        {order.user_email ?? order.user_id.slice(0, 8)}
                      </td>
                      <td className="max-w-[180px] truncate px-5 py-3">
                        {order.service_name}
                      </td>
                      <td className="hidden max-w-[140px] truncate px-5 py-3 text-muted lg:table-cell">
                        {order.link}
                      </td>
                      <td className="px-5 py-3">{order.quantity}</td>
                      <td className="px-5 py-3 font-semibold">
                        {formatINR(order.charge_inr)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={orderStatusBadge(order.status)}>
                            {order.status}
                          </Badge>
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              handleStatusChange(order, e.target.value)
                            }
                            className="h-8 rounded-btn border border-line bg-white px-2 text-xs text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            {ADMIN_ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 text-muted xl:table-cell">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            Previous
          </Button>
          <p className="text-sm text-muted">
            Page {safePage} of {totalPages}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
