"use client";

import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/types";
import { advanceOrderStatus } from "@/app/admin/dashboard/status-actions";
import { supabase } from "@/lib/supabase";

interface OrderStatusBoardProps {
  orders: Order[];
}

const nextStatus: Record<OrderStatus, OrderStatus> = {
  received: "processing",
  processing: "delivered",
  delivered: "delivered",
};

export function OrderStatusBoard({ orders }: OrderStatusBoardProps) {
  const [localOrders, setLocalOrders] = useState(orders);

  useEffect(() => {
    const channel = supabase
      .channel("admin-order-status-board")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const updated = payload.new as Order;
        setLocalOrders((prev) => prev.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const inserted = payload.new as Order;
        setLocalOrders((prev) => [inserted, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function onAdvance(orderId: string, current: OrderStatus) {
    const updated = await advanceOrderStatus(orderId, nextStatus[current]);
    if (!updated) return;
    setLocalOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, order_status: updated } : order)));
  }

  return (
    <div className="border-4 border-giri-black bg-giri-white p-4 shadow-[8px_8px_0px_0px_#2b2b2b]">
      <h2 className="mb-4 font-heading text-2xl font-bold text-giri-black">Pesanan Hari Ini</h2>
      <div className="space-y-2">
        {localOrders.map((order) => (
          <div key={order.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b-2 border-giri-black py-2">
            <span>#{order.id.slice(-8)}</span>
            <span>{order.customer_name}</span>
            <span>{order.order_status}</span>
            <button onClick={() => onAdvance(order.id, order.order_status)} className="border-2 border-giri-black bg-giri-yellow px-3 py-1 font-heading font-bold">
              →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
