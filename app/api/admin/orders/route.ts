import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { VALID_ORDER_STATUSES } from "@/lib/utils";
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
    const orderId = Number(body.orderId);
    const status = String(body.status ?? "");

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Order id is required." }, { status: 400 });
    }
    if (!VALID_ORDER_STATUSES.includes(status as (typeof VALID_ORDER_STATUSES)[number])) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_ORDER_STATUSES.join(", ")}.` },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: updated, error } = await admin
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: "Failed to update order status." },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error("admin/orders error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
