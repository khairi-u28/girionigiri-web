import { RecipeManager } from "@/components/admin/RecipeManager";
import { supabase } from "@/lib/supabase";

export default async function RecipesPage() {
  const [menuResult, inventoryResult] = await Promise.all([
    supabase.from("menu_items").select("*").order("name"),
    supabase.from("inventory_items").select("*").order("name"),
  ]);

  return (
    <section className="space-y-6">
      <div className="border-b-4 border-giri-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-giri-black md:text-4xl">
          Recipe Management
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-gray-500">
          Komposisi bahan per menu item
        </p>
      </div>
      <RecipeManager
        menuItems={menuResult.data ?? []}
        inventoryItems={inventoryResult.data ?? []}
      />
    </section>
  );
}
