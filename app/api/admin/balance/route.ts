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
    const userId = String(body.userId ?? "");
    const amount = Number(body.amount);
    const action = String(body.action ?? "");

    if (!userId) {
      return NextResponse.json({ error: "User id is required." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a number greater than 0." },
        { status: 400 }
      );
    }
    if (action !== "add" && action !== "remove") {
      return NextResponse.json(
        { error: "Action must be 'add' or 'remove'." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: target } = await admin
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .maybeSingle();

    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const currentBalance = toNumber(target.balance);

    if (action === "remove" && amount > currentBalance) {
      return NextResponse.json(
        { error: "Cannot remove more than the user's current balance." },
        { status: 400 }
      );
    }

    const newBalance =
      action === "add"
        ? round4(currentBalance + amount)
        : round4(currentBalance - amount);

    const { data: updated, error: updateError } = await admin
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", userId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: "Failed to update balance." },
        { status: 500 }
      );
    }

    const { error: transactionError } = await admin
      .from("transactions")
      .insert({
        user_id: userId,
        type: action === "add" ? "credit" : "debit",
        amount,
        description:
          action === "add"
            ? `Manual credit by admin ${user.email}`
            : `Manual debit by admin ${user.email}`,
      });

    if (transactionError) {
      console.error("admin/balance transaction error:", transactionError.message);
    }

    return NextResponse.json({
      profile: { ...updated, balance: toNumber(updated.balance) },
    });
  } catch (err) {
    console.error("admin/balance error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
