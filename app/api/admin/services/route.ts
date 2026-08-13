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

function normalizeService(service: Record<string, unknown>) {
  return {
    ...service,
    rate: toNumber(service.rate),
    min: toNumber(service.min),
    max: toNumber(service.max),
    price_inr: toNumber(service.price_inr),
    min_qty: toNumber(service.min_qty),
    max_qty: toNumber(service.max_qty),
    is_active: Boolean(service.is_active),
    refill: Boolean(service.refill),
    cancel: Boolean(service.cancel),
  };
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("services_cache")
      .select("*")
      .order("category")
      .order("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ services: (data ?? []).map(normalizeService) });
  } catch (err) {
    console.error("admin/services GET error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim() || "Other";
    const description = String(body.description ?? "").trim();
    const pricePer1000 = toNumber(body.price_per_1000);
    const minQty = Number(body.min_qty);
    const maxQty = Number(body.max_qty);
    const isActive = body.is_active !== false;

    if (!name) {
      return NextResponse.json(
        { error: "Service name is required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(pricePer1000) || pricePer1000 <= 0) {
      return NextResponse.json(
        { error: "Price per 1000 must be greater than 0." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(minQty) || minQty <= 0) {
      return NextResponse.json(
        { error: "Minimum quantity must be a positive whole number." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(maxQty) || maxQty < minQty) {
      return NextResponse.json(
        { error: "Maximum quantity must be greater than or equal to minimum." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // services_cache.id is an integer PK without a sequence — pick the next id.
    const { data: maxRow } = await admin
      .from("services_cache")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextId = toNumber(maxRow?.id) + 1;

    const { data: service, error } = await admin
      .from("services_cache")
      .insert({
        id: nextId,
        name,
        category,
        description,
        rate: pricePer1000,
        min: minQty,
        max: maxQty,
        price_inr: round2(pricePer1000),
        min_qty: minQty,
        max_qty: maxQty,
        is_active: isActive,
      })
      .select()
      .single();

    if (error || !service) {
      return NextResponse.json(
        { error: "Failed to create service." },
        { status: 500 }
      );
    }

    return NextResponse.json({ service: normalizeService(service) }, { status: 201 });
  } catch (err) {
    console.error("admin/services POST error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}