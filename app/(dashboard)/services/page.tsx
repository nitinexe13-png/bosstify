import { ServiceList } from "@/components/services/ServiceList";
import { refreshServicesCache } from "@/lib/niva";
import { createAdminClient } from "@/lib/supabase/admin";
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
        Browse all available services, rates and limits.
      </p>
      <div className="mt-6">
        <ServiceList services={services} />
      </div>
    </div>
  );
}

async function fetchServices() {
  const supabase = createClient();
  const { data: cached, error } = await supabase
    .from("services_cache")
    .select("*")
    .order("category")
    .order("rate");

  if (error) {
    throw new Error(error.message);
  }

  if (cached && cached.length > 0) {
    return cached.map((s) => ({
      ...s,
      rate: toNumber(s.rate),
      min: toNumber(s.min),
      max: toNumber(s.max),
      refill: Boolean(s.refill),
      cancel: Boolean(s.cancel),
    }));
  }

  // Seed the cache from NivaMiner if it is empty.
  await refreshServicesCache();
  const admin = createAdminClient();
  const { data: fresh } = await admin
    .from("services_cache")
    .select("*")
    .order("category")
    .order("rate");

  return (fresh ?? []).map((s) => ({
    ...s,
    rate: toNumber(s.rate),
    min: toNumber(s.min),
    max: toNumber(s.max),
    refill: Boolean(s.refill),
    cancel: Boolean(s.cancel),
  }));
}
