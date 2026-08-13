"use client";

import { Badge, orderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatINR, formatDate } from "@/lib/utils";
import type { Order } from "@/types";
import { useState } from "react";

const PAGE_SIZE = 10;

export function OrderTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageOrders = orders.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {orders.length} order{orders.length === 1 ? "" : "s"} — status is
        updated manually by our team.
      </p>

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
                      className="border-b border-line transition-colors duration-150 last:border-0 hover:bg-gray-50"
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
                        {formatINR(order.charge_inr)}
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
