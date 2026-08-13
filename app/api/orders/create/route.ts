import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { calculateChargeINR, formatINR, isValidUrl, round2, toNumber } from "@/lib/utils";
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
    const serviceId = Number(body.serviceId);
    const link = String(body.link ?? "").trim();
    const quantity = Number(body.quantity);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return NextResponse.json(
        { error: "Please select a valid service." },
        { status: 400 }
      );
    }
    if (!isValidUrl(link)) {
      return NextResponse.json(
        { error: "Please enter a valid link starting with http:// or https://." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive whole number." },
        { status: 400 }
      );
    }

    const { data: service, error: serviceError } = await supabase
      .from("services_cache")
      .select("*")
      .eq("id", serviceId)
      .eq("is_active", true)
      .maybeSingle();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    const min = toNumber(service.min_qty) || toNumber(service.min) || 10;
    const max = toNumber(service.max_qty) || toNumber(service.max) || 10000;
    if (quantity < min || quantity > max) {
      return NextResponse.json(
        {
          error: `Quantity must be between ${min} and ${max} for this service.`,
        },
        { status: 400 }
      );
    }

    const pricePer1000 = toNumber(service.price_inr);
    const charge = calculateChargeINR(quantity, pricePer1000);
    if (charge <= 0) {
      return NextResponse.json(
        { error: "Could not calculate the order charge." },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .maybeSingle();

    const balance = toNumber(profile?.balance);
    if (balance < charge) {
      return NextResponse.json(
        {
          error: `Insufficient balance. This order costs ${formatINR(
            charge
          )} but your balance is ${formatINR(balance)}.`,
        },
        { status: 409 }
      );
    }

    const admin = createAdminClient();

    // Atomically deduct the charge — fails if the balance changed.
    const { data: deducted, error: deductError } = await admin
      .from("profiles")
      .update({ balance: round2(balance - charge) })
      .eq("id", user.id)
      .gte("balance", charge)
      .select("balance")
      .single();

    if (deductError || !deducted) {
      return NextResponse.json(
        { error: "Insufficient balance. Please add funds and try again." },
        { status: 409 }
      );
    }

    // Manual order — no external provider. Assigned for manual processing.
    const nivaOrderId = `BST-${Date.now()}`;

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        niva_order_id: nivaOrderId,
        service_id: serviceId,
        service_name: service.name,
        link,
        quantity,
        charge,
        charge_inr: charge,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      // Order was not saved — refund the user.
      await admin
        .from("profiles")
        .update({ balance: round2(toNumber(deducted.balance) + charge) })
        .eq("id", user.id);
      return NextResponse.json(
        { error: "Order could not be saved. Refund issued. Contact support." },
        { status: 500 }
      );
    }

    const { error: transactionError } = await admin
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "debit",
        amount: charge,
        description: `Order #${order.id} — ${service.name} (${quantity} units)`,
      });

    if (transactionError) {
      console.error("Failed to record debit transaction:", transactionError.message);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("orders/create error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}