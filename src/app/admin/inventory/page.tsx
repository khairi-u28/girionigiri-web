import { InventoryTable } from "@/components/admin/InventoryTable";
import { supabase } from "@/lib/supabase";

export default async function InventoryPage() {
  const { data } = await supabase
    .from("inventory_items")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <section className="space-y-6">
      <div className="border-b-4 border-giri-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-giri-black md:text-4xl">
          Inventory
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-gray-500">
          Kelola bahan baku &amp; packaging
        </p>
      </div>
      <InventoryTable items={data ?? []} />
    </section>
  );
}
