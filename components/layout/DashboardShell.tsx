"use client";

import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { Sidebar } from "@/components/layout/Sidebar";
import type { UserProfile } from "@/types";
import { useState } from "react";

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
      <main className="lg:pl-[220px]">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
