import { MenuManager } from "@/components/admin/MenuManager";
import { supabase } from "@/lib/supabase";

export default async function MenuPage() {
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return (
    <section className="space-y-6">
      <div className="border-b-4 border-giri-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-giri-black md:text-4xl">
          Menu Management
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-gray-500">
          Kelola menu aktif, unggulan, dan gambar
        </p>
      </div>

      <MenuManager menuItems={menuItems ?? []} />
    </section>
  );
}
