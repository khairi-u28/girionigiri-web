import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { logoutAction } from "@/app/admin/actions";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const role = (cookieStore.get("admin_role")?.value ?? "operator") as
    | "owner"
    | "operator";

  return (
    <div className="min-h-screen bg-giri-bg">
      <AdminHeader role={role} logoutAction={logoutAction} />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-8 md:py-10">
        <AdminSidebar role={role} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
