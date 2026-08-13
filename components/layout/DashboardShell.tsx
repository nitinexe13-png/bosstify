"use client";

import type { UserProfile } from "@/types";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardShell({
  user,
  children,
}: {
  user: UserProfile;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:pl-60">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
