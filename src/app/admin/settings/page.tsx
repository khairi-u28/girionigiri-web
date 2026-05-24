import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { supabase } from "@/lib/supabase";

export default async function SettingsPage() {
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <section className="space-y-6">
      <div className="border-b-4 border-giri-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-giri-black md:text-4xl">
          Settings
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-gray-500">
          Kontrol operasional toko
        </p>
      </div>
      <SettingsPanel initialSettings={data} />
    </section>
  );
}
