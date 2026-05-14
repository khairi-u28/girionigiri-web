"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { calculateOrderTotal } from "@/lib/utils";

export async function processPosOrder(
  items: { menu_id: string; quantity: number }[],
  paymentMethod: "qris" | "cod",
): Promise<{ ok: true } | { error: string }> {
  if (!items.length) return { error: "Keranjang kosong." };
  if (items.some((item) => item.quantity < 1)) return { error: "Jumlah item tidak valid." };
  const { data: menuItems, error: menuError } = await supabase.from("menu_items").select("*").eq("is_active", true);
  if (menuError || !menuItems) return { error: "Gagal memuat menu." };

  const total = calculateOrderTotal(items, menuItems);
  const today = new Date().toISOString().slice(0, 10);
  const orderResult = await supabase
    .from("orders")
    .insert({
      customer_name: "Walk-in Customer",
      whatsapp_number: "000000000000",
      delivery_type: "cipayung_pickup",
      delivery_date: today,
      total_price: total,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "qris" ? "paid" : "pending",
      order_status: "received",
      notes: null,
      department: null,
    })
    .select()
    .single();

  if (orderResult.error || !orderResult.data) return { error: "Gagal membuat order POS." };

  const orderItems = items
    .map((item) => {
      const menu = menuItems.find((menuItem) => menuItem.id === item.menu_id);
      if (!menu || item.quantity < 1) return null;
      return {
        order_id: orderResult.data.id,
        menu_id: item.menu_id,
        menu_name: menu.name,
        menu_price: menu.price,
        quantity: item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const itemResult = await supabase.from("order_items").insert(orderItems);
  if (itemResult.error) return { error: "Gagal menyimpan item POS." };

  revalidatePath("/admin/dashboard");
  return { ok: true };
}
