"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" strokeLinecap="round" />
        <path d="M16 5.5a3.5 3.5 0 010 6.5M18 14.5c2 .8 3.5 2.4 3.5 5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M8 6h13M8 12h13M8 18h13" strokeLinecap="round" />
        <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/admin/services",
    label: "Services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M21 8l-9-5-9 5 9 5 9-5z" strokeLinejoin="round" />
        <path d="M3 8v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/funds",
    label: "Fund Requests",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M16 12h.01M3 10h18" strokeLinecap="round" />
        <circle cx="16" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function AdminSidebar({
  user,
  open,
  onClose,
}: {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabaseClient().auth.signOut();
    } catch {
      // Ignore — session is cleared client-side regardless.
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-black text-white",
          "transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            Bosstify
          </Link>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-xs text-white/60">Signed in as Admin</p>
          <p className="mt-1 truncate text-sm font-semibold">
            {user.email ?? "Admin"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <Link
            href="/dashboard"
            onClick={onClose}
            className="mt-2 flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
              <path d="M15 21v-8h4v8M3 21V11h4v10M7 21h4v-6h2v6M9 3l12 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </Link>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
