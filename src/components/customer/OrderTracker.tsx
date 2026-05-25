"use client";

import { useEffect, useState } from "react";
import { formatDateIndonesian, formatRupiah } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { OrderWithItems } from "@/types";
import { ReceiptPrint } from "./ReceiptPrint";

interface OrderTrackerProps {
  order: OrderWithItems;
}

const DELIVERY_TYPE_LABELS: Record<OrderWithItems["delivery_type"], string> = {
  auto2000: "Kantor (Auto2000)",
  cipayung_pickup: "Area Cipayung",
  external: "Pengiriman Umum",
};

const PAYMENT_METHOD_LABELS: Record<OrderWithItems["payment_method"], string> = {
  cod: "COD",
  qris: "QRIS",
};

const STATUS_STEPS = ["Diterima", "Dimasak", "Dikirim"] as const;

export function OrderTracker({ order }: OrderTrackerProps) {
  const [localOrder, setLocalOrder] = useState<OrderWithItems>(order);

  useEffect(() => {
    const channel = supabase
      .channel(`order-tracker-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setLocalOrder((prev) => ({
            ...prev,
            order_status: payload.new.order_status as OrderWithItems["order_status"],
            payment_status: payload.new.payment_status as OrderWithItems["payment_status"],
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  const stepStates = [
    true,
    localOrder.order_status === "processing" || localOrder.order_status === "delivered",
    localOrder.order_status === "delivered",
  ];

  const paymentBadgeClass =
    localOrder.payment_status === "paid"
      ? "bg-green-600 text-giri-white"
      : "bg-giri-yellow text-giri-black";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 md:py-16">
      <section className="border-4 border-giri-black bg-giri-white p-6 shadow-brutal md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4 border-b-4 border-dashed border-giri-black pb-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
              Status Pesanan
            </p>
            <h1 className="mt-2 text-2xl font-black uppercase text-giri-black md:text-3xl">
              {localOrder.order_status === "received"
                ? "Pesanan Diterima"
                : localOrder.order_status === "processing"
                  ? "Pesanan Dimasak"
                  : localOrder.order_status === "delivered"
                    ? "Pesanan Dikirim"
                    : "Status Pesanan"}
            </h1>
          </div>
          <div className="border-2 border-giri-black bg-giri-yellow px-3 py-1 text-xs font-black uppercase">
            #{localOrder.id.slice(-8).toUpperCase()}
          </div>
        </div>

        <div className="flex items-start gap-3">
          {STATUS_STEPS.map((step, index) => (
            <div key={step} className="flex flex-1 items-start gap-3">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center border-4 border-giri-black text-sm font-black ${
                    stepStates[index]
                      ? "bg-giri-black text-giri-white"
                      : "bg-giri-white text-giri-black"
                  }`}
                >
                  {stepStates[index] ? "✓" : index + 1}
                </div>
                <p className="mt-2 text-[11px] font-black uppercase leading-tight text-giri-black">
                  {step}
                </p>
              </div>
              {index < STATUS_STEPS.length - 1 && (
                <div className="mt-4 h-0 flex-1 border-t-4 border-giri-black" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print border-4 border-giri-black bg-giri-yellow px-4 py-2 font-black uppercase shadow-brutal-sm"
          >
            🖨️ Cetak Struk
          </button>
          <ReceiptPrint order={localOrder} />
        </div>
      </section>

      <section className="border-4 border-giri-black bg-giri-white p-6 shadow-brutal md:p-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-gray-300 pb-3">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
              Order ID
            </span>
            <span className="font-black text-giri-black">
              #{localOrder.id.slice(-8).toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-gray-300 pb-3">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
              Pelanggan
            </span>
            <span className="font-bold text-giri-black">{localOrder.customer_name}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-gray-300 pb-3">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
              Tanggal Kirim
            </span>
            <span className="font-bold text-giri-black">
              {formatDateIndonesian(localOrder.delivery_date)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-gray-300 pb-3">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
              Tipe Pengiriman
            </span>
            <span className="font-bold text-giri-black">
              {DELIVERY_TYPE_LABELS[localOrder.delivery_type]}
            </span>
          </div>

          {localOrder.delivery_type === "auto2000" && localOrder.department && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-gray-300 pb-3">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
                Departemen
              </span>
              <span className="font-bold text-giri-black">{localOrder.department}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-gray-300 pb-3">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
              Pembayaran
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase text-giri-black">
                {PAYMENT_METHOD_LABELS[localOrder.payment_method]}
              </span>
              <span
                className={`rounded-none border-2 border-giri-black px-2 py-1 text-[11px] font-black uppercase ${paymentBadgeClass}`}
              >
                {localOrder.payment_status}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-4 border-giri-black bg-giri-white p-6 shadow-brutal md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase text-giri-black">Item Pesanan</h2>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
            {localOrder.order_items.length} item
          </p>
        </div>

        <div className="space-y-3">
          {localOrder.order_items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-gray-200 pb-3 last:border-0"
            >
              <div>
                <p className="font-black uppercase text-giri-black">{item.menu_name}</p>
                <p className="text-sm font-bold text-gray-500">
                  {item.quantity} × {formatRupiah(item.menu_price)}
                </p>
              </div>
              <p className="font-black text-giri-black">
                {formatRupiah(item.menu_price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t-4 border-giri-black pt-4">
          <span className="text-lg font-black uppercase text-giri-black">Total</span>
          <span className="text-2xl font-black text-giri-red">
            {formatRupiah(localOrder.total_price)}
          </span>
        </div>
      </section>
    </div>
  );
}
