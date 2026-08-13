"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
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
    href: "/new-order",
    label: "New Order",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/orders",
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
    href: "/services",
    label: "Services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M21 8l-9-5-9 5 9 5 9-5z" strokeLinejoin="round" />
        <path d="M3 8v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/add-funds",
    label: "Add Funds",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M16 12h.01M3 10h18" strokeLinecap="round" />
        <circle cx="16" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar({
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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

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
          "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-[#f0f0f0] bg-white",
          "transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center px-5">
          <Link href="/dashboard" className="text-base font-bold tracking-tight text-black">
            Bosstify
          </Link>
        </div>

        <div className="mx-5 mb-4 flex items-center justify-between rounded-btn border border-[#f0f0f0] px-3 py-2">
          <span className="text-xs text-muted">Balance</span>
          <span className="text-[13px] font-semibold text-black">
            {formatINR(user.balance)}
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-colors duration-150",
                  active
                    ? "font-medium text-black"
                    : "font-normal text-gray-500 hover:bg-gray-50 hover:text-black"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-y-0 left-0 w-[2px] bg-black"
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                )}
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          {user.role === "admin" && (
            <Link
              href="/admin"
              onClick={onClose}
              className={cn(
                "relative mt-2 flex items-center gap-3 rounded-btn border-t border-[#f0f0f0] px-3 py-2.5 pt-3 text-sm transition-colors duration-150",
                isActive("/admin")
                  ? "font-medium text-black"
                  : "font-normal text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              {isActive("/admin") && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-0 left-0 w-[2px] bg-black"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
                <path d="M9.5 12l2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="border-t border-[#f0f0f0] p-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-normal text-gray-400 transition-colors duration-150 hover:bg-gray-50 hover:text-black disabled:opacity-50"
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
