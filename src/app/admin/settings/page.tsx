import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { supabase } from "@/lib/supabase";

export default async function SettingsPage() {
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).single();
  return (
    <section className="space-y-4">
      <h1 className="font-heading text-4xl font-black">Settings</h1>
      <SettingsPanel initialSettings={data} />
    </section>
  );
}
