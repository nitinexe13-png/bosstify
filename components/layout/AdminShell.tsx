"use client";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageTransition } from "@/components/layout/PageTransition";
import type { UserProfile } from "@/types";
import { useState } from "react";

export function AdminShell({
  user,
  children,
}: {
  user: UserProfile;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <AdminHeader user={user} onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:pl-[220px]">
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
