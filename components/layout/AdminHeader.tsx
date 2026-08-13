"use client";

import type { UserProfile } from "@/types";

export function AdminHeader({
  user,
  onMenuClick,
}: {
  user: UserProfile;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-btn p-2 text-black transition-colors hover:bg-surface lg:hidden"
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-lg font-bold tracking-tight lg:hidden">
          Bosstify
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold uppercase text-white md:block">
          Admin
        </span>
        <span className="hidden text-sm font-medium text-muted md:block">
          {user.email}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold uppercase text-white">
          A
        </div>
      </div>
    </header>
  );
}
