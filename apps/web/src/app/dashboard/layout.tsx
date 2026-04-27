"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/20">
        <Sidebar />
        <div className="md:pl-64">
          <Header />
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
