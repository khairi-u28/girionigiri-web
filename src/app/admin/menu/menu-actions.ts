"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { menuItemSchema } from "@/lib/validations";

export type MenuActionResult = {
  ok: boolean;
  error?: string;
};

export async function upsertMenuItem(payload: {
  id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  category: "onigiri" | "side_dish" | "drink";
  image_url?: string | null;
  is_active: boolean;
  is_highlighted: boolean;
}): Promise<MenuActionResult> {
  const parsed = menuItemSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data menu tidak valid.",
    };
  }

  const normalizedDescription = parsed.data.description?.trim() || null;
  const normalizedImageUrl = parsed.data.image_url?.trim() || null;

  if (payload.id) {
    const { error } = await supabase
      .from("menu_items")
      .update({
        name: parsed.data.name,
        description: normalizedDescription,
        price: parsed.data.price,
        category: parsed.data.category,
        image_url: normalizedImageUrl,
        is_active: parsed.data.is_active,
        is_highlighted: parsed.data.is_highlighted,
      })
      .eq("id", payload.id);

    if (error) {
      return { ok: false, error: "Gagal memperbarui menu." };
    }
  } else {
    const { error } = await supabase.from("menu_items").insert({
      name: parsed.data.name,
      description: normalizedDescription,
      price: parsed.data.price,
      category: parsed.data.category,
      image_url: normalizedImageUrl,
      is_active: parsed.data.is_active,
      is_highlighted: parsed.data.is_highlighted,
    });

    if (error) {
      return { ok: false, error: "Gagal menambah menu." };
    }
  }

  revalidatePath("/admin/menu");
  revalidatePath("/guest");
  return { ok: true };
}

export async function toggleMenuItemActive(
  id: string,
  is_active: boolean,
): Promise<MenuActionResult> {
  const { error } = await supabase
    .from("menu_items")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Gagal memperbarui status aktif." };
  }

  revalidatePath("/admin/menu");
  revalidatePath("/guest");
  return { ok: true };
}

export async function toggleMenuItemHighlighted(
  id: string,
  is_highlighted: boolean,
): Promise<MenuActionResult> {
  const { error } = await supabase
    .from("menu_items")
    .update({ is_highlighted })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Gagal memperbarui status unggulan." };
  }

  revalidatePath("/admin/menu");
  revalidatePath("/guest");
  return { ok: true };
}

export async function deleteMenuItem(id: string): Promise<MenuActionResult> {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  if (error) {
    return { ok: false, error: "Gagal menghapus menu." };
  }

  revalidatePath("/admin/menu");
  revalidatePath("/guest");
  return { ok: true };
}
