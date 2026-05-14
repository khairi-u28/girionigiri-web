"use server";

import { revalidatePath } from "next/cache";
import type { StoreSettings } from "@/types";
import { supabase } from "@/lib/supabase";
import { storeSettingsSchema } from "@/lib/validations";

export async function saveStoreSettings(settings: StoreSettings) {
  const parsed = storeSettingsSchema.safeParse(settings);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Settings tidak valid." };

  const { error } = await supabase
    .from("store_settings")
    .upsert({ id: 1, ...parsed.data }, { onConflict: "id" });
  if (error) return { ok: false, error: "Gagal menyimpan settings." };

  revalidatePath("/admin/settings");
  revalidatePath("/guest");
  revalidatePath("/guest/order");
  return { ok: true };
}
