import { createClient } from "@/lib/supabase/server";
import { refreshServicesCache } from "@/lib/niva";
import { NextResponse } from "next/server";

export async function GET() {
  return handleRefresh();
}

export async function POST() {
  return handleRefresh();
}

async function handleRefresh() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const services = await refreshServicesCache();

    return NextResponse.json({
      success: true,
      count: services.length,
    });
  } catch (err) {
    console.error("services/refresh error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to refresh services.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
