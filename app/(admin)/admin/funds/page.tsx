import { FundsTable } from "@/components/admin/FundsTable";
import { createAdminClient } from "@/lib/supabase/admin";
import { toNumber } from "@/lib/utils";
import type { AdminFundRequest } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Fund Requests",
};

export default async function AdminFundsPage() {
  const admin = createAdminClient();

  const { data: rawRequests } = await admin
    .from("fund_requests")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false });

  const requests: AdminFundRequest[] = (rawRequests ?? []).map((request) => ({
    id: Number(request.id),
    user_id: request.user_id,
    amount: toNumber(request.amount),
    method: request.method,
    reference: request.reference,
    status: request.status,
    created_at: request.created_at,
    user_email: request.profiles?.email ?? undefined,
  }));

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Fund Requests</h1>
      <p className="mt-1 text-sm text-muted">
        {pendingCount} pending request{pendingCount === 1 ? "" : "s"} awaiting
        approval
      </p>
      <div className="mt-6">
        <FundsTable requests={requests} />
      </div>
    </div>
  );
}
