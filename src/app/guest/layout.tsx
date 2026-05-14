import type { ReactNode } from "react";
import { GuestHeader } from "@/components/layout/GuestHeader";
import { GuestFooter } from "@/components/layout/GuestFooter";

export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-giri-white text-giri-black">
      <GuestHeader />
      <main>{children}</main>
      <GuestFooter />
    </div>
  );
}
