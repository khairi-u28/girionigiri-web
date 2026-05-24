import type { ReactNode } from "react";
import { GuestHeader } from "@/components/layout/GuestHeader";
import { GuestFooter } from "@/components/layout/GuestFooter";
import { supabase } from "@/lib/supabase";

export default async function GuestLayout({ children }: { children: ReactNode }) {
  const { data: settings } = await supabase
    .from("store_settings")
    .select("marquee_text")
    .eq("id", 1)
    .single();

  return (
    <div className="flex min-h-screen flex-col bg-giri-bg text-giri-black antialiased selection:bg-giri-red selection:text-giri-white">
      <GuestHeader marqueeText={settings?.marquee_text || ""} />
      <main className="flex-grow w-full">{children}</main>
      <GuestFooter />
    </div>
  );
}
