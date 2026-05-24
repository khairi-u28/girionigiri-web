import { AnnouncementBanner } from "@/components/customer/AnnouncementBanner";
import { HeroSection } from "@/components/customer/HeroSection";

import { MenuGrid } from "@/components/customer/MenuGrid";
import { supabase } from "@/lib/supabase";

export default async function GuestLandingPage() {
  const [{ data: settings }, { data: menuItems }] = await Promise.all([
    supabase.from("store_settings").select("*").eq("id", 1).single(),
    supabase.from("menu_items").select("*").eq("is_active", true).order("category"),
  ]);

  return (
    <div className="mb-24 w-full space-y-16 lg:space-y-24">
      <AnnouncementBanner
        title={settings?.announcement_title ?? ""}
        body={settings?.announcement_body ?? ""}
        active={settings?.announcement_active ?? false}
      />
      <HeroSection />
      <MenuGrid items={menuItems ?? []} />
    </div>
  );
}
