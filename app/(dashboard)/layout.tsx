import { DashboardShell } from "@/components/layout/DashboardShell";
import { createClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/utils";
import type { UserProfile } from "@/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/login");
  }

  const userProfile: UserProfile = {
    ...profile,
    balance: toNumber(profile.balance),
    role: profile.role === "admin" ? "admin" : "user",
  };

  return <DashboardShell user={userProfile}>{children}</DashboardShell>;
}
