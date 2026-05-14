import { InventoryTable } from "@/components/admin/InventoryTable";
import { supabase } from "@/lib/supabase";

export default async function InventoryPage() {
  const { data } = await supabase.from("inventory_items").select("*").order("updated_at", { ascending: false });
  return (
    <section className="space-y-4">
      <h1 className="font-heading text-4xl font-black">Inventory</h1>
      <InventoryTable items={data ?? []} />
    </section>
  );
}
