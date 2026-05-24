"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { inventoryItemSchema } from "@/lib/validations";

export async function upsertInventoryItem(payload: { id: string | null; name: string; unit: string; stock_qty: number }) {
  const parsed = inventoryItemSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Data inventory tidak valid." };

  if (payload.id) {
    const { error } = await supabase
      .from("inventory_items")
      .update({ name: payload.name, unit: payload.unit || null, stock_qty: payload.stock_qty } as Record<string, unknown>)
      .eq("id", payload.id);
    if (error) return { ok: false, error: "Gagal memperbarui inventory." };
  } else {
    const { error } = await supabase.from("inventory_items").insert({
      name: payload.name,
      unit: payload.unit || null,
      stock_qty: payload.stock_qty,
    } as Record<string, unknown>);
    if (error) return { ok: false, error: "Gagal menambah inventory." };
  }
  revalidatePath("/admin/inventory");
  return { ok: true };
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) return { ok: false, error: "Gagal menghapus inventory." };
  revalidatePath("/admin/inventory");
  return { ok: true };
}
