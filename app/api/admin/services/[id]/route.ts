import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { round2, toNumber } from "@/lib/utils";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return null;
  }

  return supabase;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const serviceId = Number(params.id);
    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json(
          { error: "Service name is required." },
          { status: 400 }
        );
      }
      updates.name = name;
    }
    if (typeof body.category === "string") {
      updates.category = body.category.trim() || "Other";
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }
    if (body.price_per_1000 !== undefined) {
      const pricePer1000 = toNumber(body.price_per_1000);
      if (!Number.isFinite(pricePer1000) || pricePer1000 <= 0) {
        return NextResponse.json(
          { error: "Price per 1000 must be greater than 0." },
          { status: 400 }
        );
      }
      updates.price_inr = round2(pricePer1000);
      updates.rate = round2(pricePer1000);
    }
    if (body.min_qty !== undefined) {
      const minQty = Number(body.min_qty);
      if (!Number.isInteger(minQty) || minQty <= 0) {
        return NextResponse.json(
          { error: "Minimum quantity must be a positive whole number." },
          { status: 400 }
        );
      }
      updates.min_qty = minQty;
      updates.min = minQty;
    }
    if (body.max_qty !== undefined) {
      const maxQty = Number(body.max_qty);
      if (!Number.isInteger(maxQty) || maxQty <= 0) {
        return NextResponse.json(
          { error: "Maximum quantity must be a positive whole number." },
          { status: 400 }
        );
      }
      updates.max_qty = maxQty;
      updates.max = maxQty;
    }
    if (typeof body.is_active === "boolean") {
      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    if (
      typeof updates.min_qty === "number" &&
      typeof updates.max_qty === "number" &&
      updates.max_qty < updates.min_qty
    ) {
      return NextResponse.json(
        { error: "Maximum quantity must be greater than or equal to minimum." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: service, error } = await admin
      .from("services_cache")
      .update(updates)
      .eq("id", serviceId)
      .select()
      .single();

    if (error || !service) {
      return NextResponse.json(
        { error: "Failed to update service." },
        { status: 500 }
      );
    }

    return NextResponse.json({ service });
  } catch (err) {
    console.error("admin/services PATCH error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const serviceId = Number(params.id);
    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("services_cache")
      .delete()
      .eq("id", serviceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("admin/services DELETE error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}