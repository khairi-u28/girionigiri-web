"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import type { OrderWithItems } from "@/types";
import { orderFormSchema, type OrderFormInput } from "@/lib/validations";
import { calculateOrderTotal } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export async function submitOrder(values: OrderFormInput): Promise<{ order: OrderWithItems } | { error: string }> {
  const parsed = orderFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Form tidak valid." };
  }

  const [{ data: settings }, { data: menuItems }] = await Promise.all([
    supabase.from("store_settings").select("*").eq("id", 1).single(),
    supabase.from("menu_items").select("*").eq("is_active", true),
  ]);

  if (!settings) return { error: "Pengaturan toko belum tersedia." };
  if (!menuItems) return { error: "Menu belum tersedia." };

  const deliveryDate = format(parsed.data.delivery_date, "yyyy-MM-dd");
  const orderCountResult = await supabase
    .from("order_items")
    .select("quantity, orders!inner(delivery_date)")
    .eq("orders.delivery_date", deliveryDate);
  if (orderCountResult.error) return { error: "Gagal cek kuota harian." };

  const currentQuantity = (orderCountResult.data ?? []).reduce((sum, item) => sum + item.quantity, 0);
  const selectedQuantity = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);
  if (currentQuantity + selectedQuantity > settings.daily_quota) {
    return { error: "Kuota tanggal tersebut sudah penuh." };
  }

  const selectedItems = parsed.data.items.filter((item) => item.quantity > 0);
  if (!selectedItems.length) return { error: "Silakan pilih minimal 1 menu." };
  const total = calculateOrderTotal(selectedItems, menuItems);
  if (total <= 0) return { error: "Total pesanan tidak valid." };
  const insertOrder = await supabase
    .from("orders")
    .insert({
      customer_name: parsed.data.customer_name,
      whatsapp_number: parsed.data.whatsapp_number,
      delivery_type: parsed.data.delivery_type,
      department: parsed.data.department || null,
      delivery_date: deliveryDate,
      payment_method: parsed.data.payment_method,
      notes: parsed.data.notes || null,
      payment_status: "pending",
      order_status: "received",
      total_price: total,
    } as Record<string, unknown>)
    .select()
    .single();
  if (insertOrder.error || !insertOrder.data) return { error: "Gagal menyimpan order." };

  const itemPayload = selectedItems
    .map((item) => {
      const menu = menuItems.find((menuItem) => menuItem.id === item.menu_id);
      if (!menu) return null;
      return {
        order_id: insertOrder.data.id,
        menu_id: menu.id,
        menu_name: item.variant === "pedas" ? `${menu.name} (Pedas)` : item.variant === "tidak" ? `${menu.name} (Tidak Pedas)` : menu.name,
        menu_price: menu.price,
        quantity: item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  if (!itemPayload.length) {
    await supabase.from("orders").delete().eq("id", insertOrder.data.id);
    return { error: "Menu yang dipilih tidak ditemukan." };
  }
  const insertItems = await supabase.from("order_items").insert(itemPayload as Record<string, unknown>[]).select("*");
  if (insertItems.error) return { error: "Gagal menyimpan item order." };

  const order: OrderWithItems = {
    ...insertOrder.data,
    order_items: insertItems.data ?? [],
  };

  revalidatePath("/guest");
  revalidatePath("/guest/order");
  return { order };
}
