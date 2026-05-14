"use client";

import { useMemo, useState } from "react";
import type { InventoryItem, MenuItem, Recipe } from "@/types";
import { IngredientCombobox } from "./IngredientCombobox";
import { addRecipeItem, deleteRecipeItem, listRecipes } from "@/app/admin/recipes/recipe-actions";

interface RecipeManagerProps {
  menuItems: MenuItem[];
  inventoryItems: InventoryItem[];
}

export function RecipeManager({ menuItems, inventoryItems }: RecipeManagerProps) {
  const [menuId, setMenuId] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredientId, setIngredientId] = useState("");
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const inventoryMap = useMemo(() => new Map(inventoryItems.map((item) => [item.id, item])), [inventoryItems]);

  async function loadRecipes(nextMenuId: string) {
    setMenuId(nextMenuId);
    if (!nextMenuId) {
      setRecipes([]);
      return;
    }
    const data = await listRecipes(nextMenuId);
    setRecipes(data);
  }

  async function add() {
    if (!menuId || !ingredientId) return;
    const result = await addRecipeItem(menuId, ingredientId, qty);
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }
    setFeedback({ type: "success", text: "Bahan resep berhasil ditambahkan." });
    setRecipes(await listRecipes(menuId));
    setIngredientId("");
    setQty(1);
  }

  async function remove(id: string) {
    const result = await deleteRecipeItem(id);
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }
    setFeedback({ type: "success", text: "Bahan resep berhasil dihapus." });
    setRecipes(await listRecipes(menuId));
  }

  return (
    <div className="space-y-4 border-4 border-giri-black bg-giri-white p-4 shadow-[8px_8px_0px_0px_#2b2b2b]">
      <select value={menuId} onChange={(event) => loadRecipes(event.target.value)} className="w-full border-4 border-giri-black p-2">
        <option value="">Pilih menu item</option>
        {menuItems.map((menuItem) => (
          <option key={menuItem.id} value={menuItem.id}>
            {menuItem.name}
          </option>
        ))}
      </select>
      <div className="grid gap-2 md:grid-cols-[2fr_1fr_auto]">
        <IngredientCombobox items={inventoryItems} value={ingredientId} onChange={setIngredientId} />
        <input type="number" value={qty} onChange={(event) => setQty(Number(event.target.value))} className="border-4 border-giri-black p-2" />
        <button onClick={add} className="border-4 border-giri-black bg-giri-red px-4 py-2 font-heading font-bold text-giri-white">Tambah</button>
      </div>
      {feedback ? (
        <p className={`border-4 p-3 font-heading font-bold ${feedback.type === "success" ? "border-giri-black bg-giri-yellow text-giri-black" : "border-giri-red bg-giri-white text-giri-red"}`}>
          {feedback.text}
        </p>
      ) : null}
      <div className="space-y-2">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="grid grid-cols-[2fr_1fr_auto] items-center border-b-2 border-giri-black py-2">
            <span>{inventoryMap.get(recipe.inventory_id)?.name ?? "Bahan"}</span>
            <span>{recipe.qty_needed}</span>
            <button onClick={() => remove(recipe.id)} className="border-2 border-giri-black bg-giri-yellow px-3 py-1 font-heading font-bold">Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}
