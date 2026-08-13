"use client";

import { Badge, orderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PAGE_SIZE = 10;

export function OrderTable({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageOrders = orders.slice(start, start + PAGE_SIZE);

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      const response = await fetch("/api/orders/sync", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync orders.");
      }
      if (data.orders) {
        setOrders((prev) =>
          prev.map((o) => {
            const updated = data.orders.find(
              (u: Order) => u.id === o.id
            );
            return updated ?? o;
          })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync orders.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {orders.length} order{orders.length === 1 ? "" : "s"}
        </p>
        <Button variant="secondary" size="sm" onClick={handleSync} loading={syncing}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
            <path d="M21 12a9 9 0 11-2.6-6.4M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sync Status
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-btn border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <Card>
        <CardBody className="px-0 py-0">
          {orders.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted">
              No orders yet. Place your first order to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Order ID</th>
                    <th className="px-5 py-3 font-medium">Service</th>
                    <th className="px-5 py-3 font-medium">Link</th>
                    <th className="px-5 py-3 font-medium">Qty</th>
                    <th className="px-5 py-3 font-medium">Charge</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">
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
                      <td className="px-5 py-3 font-medium">#{order.id}</td>
                      <td className="max-w-[180px] truncate px-5 py-3">
                        {order.service_name}
                      </td>
                      <td className="max-w-[160px] truncate px-5 py-3 text-muted">
                        {order.link}
                      </td>
                      <td className="px-5 py-3">{order.quantity}</td>
                      <td className="px-5 py-3">
                        ${formatCurrency(order.charge)}
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
