import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { round4, toNumber } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const id = Number(body.id);
    const action = String(body.action ?? "");

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Request id is required." }, { status: 400 });
    }
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: fundRequest } = await admin
      .from("fund_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!fundRequest) {
      return NextResponse.json({ error: "Fund request not found." }, { status: 404 });
    }

    if (fundRequest.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been processed." },
        { status: 409 }
      );
    }

    if (action === "reject") {
      const { data: updated, error } = await admin
        .from("fund_requests")
        .update({ status: "rejected" })
        .eq("id", id)
        .select()
        .single();

      if (error || !updated) {
        return NextResponse.json(
          { error: "Failed to update request status." },
          { status: 500 }
        );
      }
      return NextResponse.json({ request: updated });
    }

    // Approve: credit the balance, record the transaction, mark approved.
    const amount = round4(toNumber(fundRequest.amount));
    const userId = fundRequest.user_id;

    const { data: target } = await admin
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .maybeSingle();

    if (!target) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const { error: balanceError } = await admin
      .from("profiles")
      .update({ balance: round4(toNumber(target.balance) + amount) })
      .eq("id", userId);

    if (balanceError) {
      return NextResponse.json(
        { error: "Failed to credit user balance." },
        { status: 500 }
      );
    }

    const { error: transactionError } = await admin
      .from("transactions")
      .insert({
        user_id: userId,
        type: "credit",
        amount,
        description: `Fund request #${id} approved (${fundRequest.method}) — ref: ${fundRequest.reference ?? "n/a"}`,
      });

    if (transactionError) {
      console.error("admin/funds transaction error:", transactionError.message);
    }

    const { data: updated, error: updateError } = await admin
      .from("fund_requests")
      .update({ status: "approved" })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: "Request approved but could not be marked. Please verify balance." },
        { status: 500 }
      );
    }

    return NextResponse.json({ request: updated });
  } catch (err) {
    console.error("admin/funds error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
