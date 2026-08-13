import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createClient } from "@/lib/supabase/server";
import { formatINR, formatDate, toNumber } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your account details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-muted">Balance</p>
            <p className="mt-1 text-xl font-semibold">
              {formatINR(toNumber(profile.balance))}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted">Role</p>
            <p className="mt-1 text-xl font-semibold capitalize">
              {profile.role}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted">Member Since</p>
            <p className="mt-1 text-xl font-semibold">
              {formatDate(profile.created_at)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardBody>
          <ProfileForm
            username={profile.username ?? ""}
            email={user.email ?? ""}
          />
        </CardBody>
      </Card>
    </div>
  );
}
