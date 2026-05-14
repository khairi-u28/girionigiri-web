"use server";

import type { OrderStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function advanceOrderStatus(orderId: string, status: OrderStatus): Promise<OrderStatus | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId)
    .select("order_status")
    .single();

  if (error || !data) return null;
  revalidatePath("/admin/dashboard");
  return data.order_status;
}
