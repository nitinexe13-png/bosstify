import { ServiceList } from "@/components/services/ServiceList";
import { createClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage() {
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
    // The list component will show an empty state.
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
      <p className="mt-1 text-sm text-muted">
        Browse all available services, prices and limits.
      </p>
      <div className="mt-6">
        <ServiceList services={services} />
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
    .order("price_inr");

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
