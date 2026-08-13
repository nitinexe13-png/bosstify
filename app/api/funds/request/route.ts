import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { round4 } from "@/lib/utils";
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

    const body = await request.json();
    const amount = Number(body.amount);
    const method = String(body.method ?? "");
    const reference = String(body.reference ?? "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid amount greater than 0." },
        { status: 400 }
      );
    }
    if (method !== "upi" && method !== "bank") {
      return NextResponse.json(
        { error: "Payment method must be 'upi' or 'bank'." },
        { status: 400 }
      );
    }
    if (!reference) {
      return NextResponse.json(
        { error: "Please enter the payment reference / transaction id." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: requestRow, error } = await admin
      .from("fund_requests")
      .insert({
        user_id: user.id,
        amount: round4(amount),
        method,
        reference,
      })
      .select()
      .single();

    if (error || !requestRow) {
      return NextResponse.json(
        { error: "Failed to submit fund request." },
        { status: 500 }
      );
    }

    return NextResponse.json({ request: requestRow }, { status: 201 });
  } catch (err) {
    console.error("funds/request error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
