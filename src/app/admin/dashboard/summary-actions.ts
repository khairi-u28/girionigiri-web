"use server";

import { supabase } from "@/lib/supabase";

export async function getKitchenSummary(targetDate: string): Promise<{ menu_name: string; quantity: number }[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select("menu_name, quantity, orders!inner(delivery_date, order_status)")
    .eq("orders.delivery_date", targetDate)
    .neq("orders.order_status", "delivered");

  if (error || !data) return [];
  const map = new Map<string, number>();
  for (const item of data) {
    map.set(item.menu_name, (map.get(item.menu_name) ?? 0) + item.quantity);
  }
  return Array.from(map.entries()).map(([menu_name, quantity]) => ({ menu_name, quantity }));
}
