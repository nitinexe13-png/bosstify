import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { FundRequestForm } from "@/components/funds/FundRequestForm";
import { createClient } from "@/lib/supabase/server";
import { formatINR, formatDate, toNumber } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Add Funds",
};

export default async function AddFundsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: transactions }, { data: requests }] =
    await Promise.all([
      supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle(),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("fund_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const balance = toNumber(profile?.balance);
  const requestBadge =
    requests && requests.length > 0
      ? requests[0].status === "pending"
        ? "gray"
        : requests[0].status === "approved"
        ? "green"
        : "red"
      : "gray";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Funds</h1>
        <p className="mt-1 text-sm text-muted">
          Request funds and they will be credited once approved by an admin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-semibold tracking-tight">
              {formatINR(balance)}
            </p>
            {requests && requests[0] && (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                Latest request:
                <Badge variant={requestBadge}>{requests[0].status}</Badge>
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-muted">
            <p>
              <span className="font-medium text-black">UPI:</span>{" "}
              bosstify@upi — please include your reference id.
            </p>
            <p>
              <span className="font-medium text-black">Bank (IMPS/NEFT):</span>{" "}
              Bosstify Payments, Account 0000 0000 0000, IFSC: XXXXX0000000.
            </p>
            <p>
              After transferring, submit a request below with the reference
              number. Funds are credited after manual verification.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Funds</CardTitle>
        </CardHeader>
        <CardBody>
          <FundRequestForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardBody className="px-0 py-0">
          {!transactions || transactions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No transactions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(transactions ?? []).map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-5 py-3">
                        <Badge variant={tx.type === "credit" ? "green" : "gray"}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td
                        className={`px-5 py-3 font-semibold ${
                          tx.type === "credit" ? "text-green-600" : "text-black"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}
                        {formatINR(toNumber(tx.amount))}
                      </td>
                      <td className="px-5 py-3">{tx.description}</td>
                      <td className="hidden px-5 py-3 text-muted md:table-cell">
                        {formatDate(tx.created_at)}
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
