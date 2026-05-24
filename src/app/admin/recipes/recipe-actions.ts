"use server";

import { revalidatePath } from "next/cache";
import type { Recipe } from "@/types";
import { supabase } from "@/lib/supabase";
import { recipeItemSchema } from "@/lib/validations";

export async function listRecipes(menuId: string): Promise<Recipe[]> {
  const { data, error } = await supabase.from("recipes").select("*").eq("menu_id", menuId).order("id");
  if (error || !data) return [];
  return data;
}

export async function addRecipeItem(menuId: string, inventoryId: string, qtyNeeded: number) {
  const parsed = recipeItemSchema.safeParse({
    menu_id: menuId,
    inventory_id: inventoryId,
    qty_needed: qtyNeeded,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Data resep tidak valid." };

  const { error } = await supabase.from("recipes").insert({
    menu_id: menuId,
    inventory_id: inventoryId,
    qty_needed: qtyNeeded,
  } as Record<string, unknown>);
  if (error) return { ok: false, error: "Gagal menambah resep." };
  revalidatePath("/admin/recipes");
  return { ok: true };
}

export async function deleteRecipeItem(id: string) {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) return { ok: false, error: "Gagal menghapus resep." };
  revalidatePath("/admin/recipes");
  return { ok: true };
}
