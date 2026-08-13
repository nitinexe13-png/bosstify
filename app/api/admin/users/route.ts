import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const userId = String(body.userId ?? "");
    const role = String(body.role ?? "");

    if (!userId) {
      return NextResponse.json({ error: "User id is required." }, { status: 400 });
    }
    if (role !== "user" && role !== "admin") {
      return NextResponse.json(
        { error: "Role must be 'user' or 'admin'." },
        { status: 400 }
      );
    }
    if (userId === user.id && role !== "admin") {
      return NextResponse.json(
        { error: "You cannot demote your own admin role." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: updated, error } = await admin
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: "Failed to update user role." },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error("admin/users error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
