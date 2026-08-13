"use client";

import type { UserProfile } from "@/types";
import { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";

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
      <main className="lg:pl-60">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
