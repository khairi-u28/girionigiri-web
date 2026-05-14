import { RecipeManager } from "@/components/admin/RecipeManager";
import { supabase } from "@/lib/supabase";

export default async function RecipesPage() {
  const [menuResult, inventoryResult] = await Promise.all([
    supabase.from("menu_items").select("*").order("name"),
    supabase.from("inventory_items").select("*").order("name"),
  ]);

  return (
    <section className="space-y-4">
      <h1 className="font-heading text-4xl font-black">Recipe Management</h1>
      <RecipeManager menuItems={menuResult.data ?? []} inventoryItems={inventoryResult.data ?? []} />
    </section>
  );
}
