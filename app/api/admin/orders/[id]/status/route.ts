import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ORDER_STATUSES } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const orderId = Number(params.id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const body = await request.json();
    const status = String(body.status ?? "");

    if (!(ADMIN_ORDER_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of: pending, processing, completed, cancelled." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Failed to update order status." },
        { status: 500 }
      );
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("admin/orders/[id]/status error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}