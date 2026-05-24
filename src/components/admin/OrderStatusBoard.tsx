"use client";

import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/types";
import { advanceOrderStatus } from "@/app/admin/dashboard/status-actions";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Clock, Flame, CheckCircle2 } from "lucide-react";

interface OrderStatusBoardProps {
  orders: Order[];
}

const nextStatus: Record<OrderStatus, OrderStatus> = {
  received: "processing",
  processing: "delivered",
  delivered: "delivered",
};

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; icon: typeof Clock }
> = {
  received: {
    label: "Received",
    bg: "bg-giri-yellow text-giri-black",
    icon: Clock,
  },
  processing: {
    label: "Cooking",
    bg: "bg-giri-blue text-giri-black",
    icon: Flame,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-giri-black text-giri-white",
    icon: CheckCircle2,
  },
};

const deliveryLabels: Record<string, string> = {
  auto2000: "Auto2000",
  cipayung_pickup: "Cipayung",
  external: "External",
};

export function OrderStatusBoard({ orders }: OrderStatusBoardProps) {
  const [localOrders, setLocalOrders] = useState(orders);

  useEffect(() => {
    const channel = supabase
      .channel("admin-order-status-board")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as Order;
          setLocalOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const inserted = payload.new as Order;
          setLocalOrders((prev) => [inserted, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function onAdvance(orderId: string, current: OrderStatus) {
    if (current === "delivered") return;
    const updated = await advanceOrderStatus(orderId, nextStatus[current]);
    if (!updated) return;
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, order_status: updated } : o
      )
    );
  }

  return (
    <div className="border-4 border-giri-black bg-giri-white shadow-brutal-lg">
      {/* Header */}
      <div className="border-b-4 border-giri-black bg-giri-bg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Pesanan Hari Ini
          </h2>
          <span className="border-2 border-giri-black bg-giri-yellow px-3 py-1 text-xs font-black">
            {localOrders.length} pesanan
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-4">
        {localOrders.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-gray-400">
            Belum ada pesanan hari ini
          </p>
        ) : (
          <div className="space-y-2">
            {/* Header row — desktop */}
            <div className="hidden border-b-4 border-giri-black pb-2 text-xs font-black uppercase tracking-widest text-gray-500 md:grid md:grid-cols-[100px_1fr_120px_120px_60px]">
              <span>ID</span>
              <span>Nama</span>
              <span>Tipe</span>
              <span>Status</span>
              <span className="text-center">Aksi</span>
            </div>

            {localOrders.map((order) => {
              const config = statusConfig[order.order_status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.id}
                  className="grid grid-cols-1 items-center gap-2 border-b-2 border-dashed border-giri-black py-3 md:grid-cols-[100px_1fr_120px_120px_60px]"
                >
                  {/* ID */}
                  <span className="text-sm font-black text-gray-600">
                    <span className="text-xs font-bold text-gray-400 md:hidden">
                      ID:{" "}
                    </span>
                    #{order.id.slice(-8)}
                  </span>

                  {/* Name */}
                  <span className="truncate font-medium">
                    {order.customer_name}
                  </span>

                  {/* Type */}
                  <span className="text-sm font-bold uppercase text-gray-600">
                    <span className="text-xs font-bold text-gray-400 md:hidden">
                      Tipe:{" "}
                    </span>
                    {deliveryLabels[order.delivery_type] ?? order.delivery_type}
                  </span>

                  {/* Status badge */}
                  <span>
                    <span
                      className={`inline-flex items-center gap-1 border-2 border-giri-black px-2 py-1 text-xs font-black uppercase ${config.bg}`}
                    >
                      <StatusIcon size={12} strokeWidth={3} />
                      {config.label}
                    </span>
                  </span>

                  {/* Advance button */}
                  <div className="flex justify-start md:justify-center">
                    {order.order_status !== "delivered" ? (
                      <button
                        onClick={() =>
                          onAdvance(order.id, order.order_status)
                        }
                        className="flex h-9 w-9 items-center justify-center border-2 border-giri-black bg-giri-yellow font-black shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      >
                        <ArrowRight size={14} strokeWidth={3} />
                      </button>
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center text-green-600">
                        <CheckCircle2 size={16} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
