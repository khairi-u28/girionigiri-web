"use client";

import { useMemo, useState } from "react";
import type { InventoryItem, MenuItem, Recipe } from "@/types";
import { IngredientCombobox } from "./IngredientCombobox";
import {
  addRecipeItem,
  deleteRecipeItem,
  listRecipes,
} from "@/app/admin/recipes/recipe-actions";
import { Plus, Trash2 } from "lucide-react";

interface RecipeManagerProps {
  menuItems: MenuItem[];
  inventoryItems: InventoryItem[];
}

export function RecipeManager({
  menuItems,
  inventoryItems,
}: RecipeManagerProps) {
  const [menuId, setMenuId] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredientId, setIngredientId] = useState("");
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const inventoryMap = useMemo(
    () => new Map(inventoryItems.map((item) => [item.id, item])),
    [inventoryItems]
  );

  const selectedMenu = menuItems.find((m) => m.id === menuId);

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
      setFeedback({ type: "error", text: result.error || "Terjadi kesalahan." });
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
      setFeedback({ type: "error", text: result.error || "Terjadi kesalahan." });
      return;
    }
    setFeedback({ type: "success", text: "Bahan resep berhasil dihapus." });
    setRecipes(await listRecipes(menuId));
  }

  return (
    <div className="space-y-4">
      {/* Feedback */}
      {feedback && (
        <div
          className={`border-4 p-3 font-bold ${
            feedback.type === "success"
              ? "border-giri-black bg-giri-yellow text-giri-black"
              : "border-giri-red bg-[#ffeded] text-giri-red"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Menu selector */}
      <div className="border-4 border-giri-black bg-giri-white p-4 shadow-brutal">
        <label className="mb-2 block text-sm font-black uppercase tracking-wider text-gray-500">
          Pilih Menu Item
        </label>
        <select
          value={menuId}
          onChange={(e) => loadRecipes(e.target.value)}
          className="brutal-input w-full border-4 border-giri-black bg-giri-white p-3 font-bold transition-shadow"
        >
          <option value="">— Pilih menu —</option>
          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recipe editor */}
      {selectedMenu && (
        <div className="border-4 border-giri-black bg-giri-white shadow-brutal-lg">
          {/* Header */}
          <div className="border-b-4 border-giri-black bg-giri-bg p-4">
            <h3 className="text-lg font-black uppercase">
              Resep untuk:{" "}
              <span className="text-giri-red">{selectedMenu.name}</span>
            </h3>
          </div>

          {/* Add ingredient row */}
          <div className="border-b-4 border-dashed border-giri-black p-4">
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
              <IngredientCombobox
                items={inventoryItems}
                value={ingredientId}
                onChange={setIngredientId}
              />
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                  Jumlah
                </label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="brutal-input w-full border-4 border-giri-black p-2 font-bold transition-shadow"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={add}
                  className="flex items-center gap-2 border-4 border-giri-black bg-giri-red px-4 py-2 font-black uppercase text-giri-white shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <Plus size={14} strokeWidth={3} />
                  Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Recipe table */}
          <div className="p-4">
            {recipes.length === 0 ? (
              <p className="py-6 text-center text-sm font-medium text-gray-400">
                Belum ada bahan. Tambahkan di atas.
              </p>
            ) : (
              <>
                {/* Header — desktop */}
                <div className="hidden border-b-4 border-giri-black pb-2 text-xs font-black uppercase tracking-widest text-gray-500 md:grid md:grid-cols-[2fr_1fr_1fr_auto]">
                  <span>Bahan</span>
                  <span>Satuan</span>
                  <span>Jumlah</span>
                  <span className="text-right">Aksi</span>
                </div>
                {recipes.map((recipe) => {
                  const inv = inventoryMap.get(recipe.inventory_id);
                  return (
                    <div
                      key={recipe.id}
                      className="grid grid-cols-1 items-center gap-2 border-b-2 border-dashed border-giri-black py-3 md:grid-cols-[2fr_1fr_1fr_auto]"
                    >
                      <span className="font-bold">
                        {inv?.name ?? "Bahan"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {inv?.unit ?? "—"}
                      </span>
                      <span>
                        <span className="inline-block border-2 border-giri-black bg-giri-yellow px-2 py-0.5 text-sm font-black">
                          {recipe.qty_needed}
                        </span>
                      </span>
                      <div className="flex md:justify-end">
                        <button
                          onClick={() => remove(recipe.id)}
                          className="flex h-8 items-center gap-1 border-2 border-giri-black bg-giri-red px-3 text-xs font-black uppercase text-giri-white shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                        >
                          <Trash2 size={12} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
