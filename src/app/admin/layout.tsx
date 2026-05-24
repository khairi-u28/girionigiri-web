import type { ReactNode } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-giri-bg">
      <AdminHeader />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-8 md:py-10">
        <AdminSidebar />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
