"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminFundRequest } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FundsTable({ requests }: { requests: AdminFundRequest[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(request: AdminFundRequest, action: "approve" | "reject") {
    setLoadingId(request.id);
    setError(null);
    try {
      const response = await fetch("/api/admin/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process request.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process request.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
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
          {requests.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted">
              No fund requests yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Method</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">
                      Reference
                    </th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">
                      Date
                    </th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-5 py-3">{request.user_email ?? request.user_id.slice(0, 8)}</td>
                      <td className="px-5 py-3 font-semibold">
                        ${formatCurrency(request.amount)}
                      </td>
                      <td className="px-5 py-3 uppercase">{request.method}</td>
                      <td className="hidden max-w-[160px] truncate px-5 py-3 text-muted md:table-cell">
                        {request.reference ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "green"
                              : request.status === "rejected"
                              ? "red"
                              : "gray"
                          }
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td className="hidden px-5 py-3 text-muted lg:table-cell">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        {request.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              loading={loadingId === request.id}
                              disabled={loadingId !== null && loadingId !== request.id}
                              onClick={() => handleAction(request, "approve")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              loading={loadingId === request.id}
                              disabled={loadingId !== null && loadingId !== request.id}
                              onClick={() => handleAction(request, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="block text-right text-xs text-muted">
                            Processed
                          </span>
                        )}
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
