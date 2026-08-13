import { NewOrderForm } from "@/components/orders/NewOrderForm";
import { createClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "New Order",
};

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: { service_id?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let services: Awaited<ReturnType<typeof fetchServices>> = [];

  try {
    services = await fetchServices();
  } catch {
    // Fall through with empty list; the form will show an error state.
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle();

  const initialServiceId = searchParams.service_id
    ? Number(searchParams.service_id)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">New Order</h1>
      <p className="mt-1 text-sm text-muted">
        Select a service and place your order in a few steps.
      </p>
      <div className="mt-6">
        <NewOrderForm
          services={services}
          initialServiceId={initialServiceId}
          balance={toNumber(profile?.balance)}
        />
      </div>
    </div>
  );
}

async function fetchServices() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services_cache")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((s) => ({
    ...s,
    rate: toNumber(s.rate),
    min: toNumber(s.min),
    max: toNumber(s.max),
    price_inr: toNumber(s.price_inr),
    min_qty: toNumber(s.min_qty),
    max_qty: toNumber(s.max_qty),
    is_active: Boolean(s.is_active),
    refill: Boolean(s.refill),
    cancel: Boolean(s.cancel),
  }));
}
