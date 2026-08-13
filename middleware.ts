import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  let redirectUrl: URL | null = null;

  if (isProtected && !user) {
    redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
  } else if (isAdminRoute) {
    if (!user) {
      redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", pathname);
    } else {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !profile || profile.role !== "admin") {
        redirectUrl = new URL("/dashboard", request.url);
      }
    }
  } else if (isAuthPage && user) {
    redirectUrl = new URL("/dashboard", request.url);
  }

  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
