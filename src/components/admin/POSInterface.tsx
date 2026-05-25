"use client";

import { useMemo, useState } from "react";
import type { MenuItem, OrderWithItems } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { processPosOrder } from "@/app/admin/dashboard/pos-actions";
import { ShoppingCart, Trash2 } from "lucide-react";
import { ReceiptPrint } from "@/components/customer/ReceiptPrint";

interface POSInterfaceProps {
  menuItems: MenuItem[];
}

export function POSInterface({ menuItems }: POSInterfaceProps) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "cod">("qris");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [completedOrder, setCompletedOrder] = useState<OrderWithItems | null>(null);

  const cartItems = useMemo(
    () =>
      menuItems
        .map((item) => ({ ...item, quantity: cart[item.id] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [cart, menuItems]
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function buildCompletedOrder(): OrderWithItems {
    const now = new Date();
    const id = `POS-${now.getTime()}`;

    return {
      id,
      customer_name: "Walk-in Customer",
      whatsapp_number: "000000000000",
      delivery_type: "cipayung_pickup",
      department: null,
      delivery_date: now.toISOString().slice(0, 10),
      total_price: total,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "qris" ? "paid" : "pending",
      order_status: "received",
      notes: null,
      created_at: now.toISOString(),
      order_items: cartItems.map((item) => ({
        id: `${id}-${item.id}`,
        order_id: id,
        menu_id: item.id,
        menu_name: item.name,
        menu_price: item.price,
        quantity: item.quantity,
      })),
    };
  }

  function resetSession() {
    setCart({});
    setCompletedOrder(null);
    setMessage("");
    setMessageType("success");
  }

  async function submit() {
    if (cartItems.length === 0) {
      setMessage("Tambahkan minimal 1 item ke keranjang.");
      setMessageType("error");
      return;
    }

    const items = cartItems.map((item) => ({
      menu_id: item.id,
      quantity: item.quantity,
    }));

    const result = await processPosOrder(items, paymentMethod);
    if ("error" in result) {
      setMessage(result.error);
      setMessageType("error");
      setCompletedOrder(null);
      return;
    }

    const nextOrder = buildCompletedOrder();
    setCompletedOrder(nextOrder);
    setMessage("✅ Pesanan POS berhasil diproses!");
    setMessageType("success");
    setCart({});
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* ── Menu buttons grid ── */}
      <div>
        <h3 className="mb-3 text-lg font-black uppercase tracking-wider text-gray-500">
          Ketuk untuk tambah →
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {menuItems.map((item) => {
            const qty = cart[item.id] ?? 0;
            return (
              <button
                key={item.id}
                onClick={() =>
                  setCart((prev) => ({
                    ...prev,
                    [item.id]: (prev[item.id] ?? 0) + 1,
                  }))
                }
                className="relative min-h-24 border-4 border-giri-black bg-giri-yellow p-3 text-left shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
              >
                <p className="text-sm font-black uppercase leading-tight text-giri-black">
                  {item.name}
                </p>
                <p className="mt-1 text-sm font-bold text-giri-red">
                  {formatRupiah(item.price)}
                </p>
                {qty > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center border-2 border-giri-black bg-giri-red text-xs font-black text-giri-white">
                    {qty}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cart sidebar ── */}
      <aside className="h-fit border-4 border-giri-black bg-giri-white p-4 shadow-brutal-lg">
        <div className="mb-4 flex items-center gap-2 border-b-4 border-giri-black pb-3">
          <ShoppingCart size={20} strokeWidth={3} />
          <h2 className="text-xl font-black uppercase">Cart</h2>
          <span className="ml-auto border-2 border-giri-black bg-giri-bg px-2 py-0.5 text-xs font-black">
            {cartItems.length} item
          </span>
        </div>

        {cartItems.length === 0 ? (
          <p className="py-6 text-center text-sm font-medium text-gray-400">
            Belum ada item dipilih
          </p>
        ) : (
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b-2 border-dashed border-giri-black pb-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatRupiah(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCart((prev) => ({
                        ...prev,
                        [item.id]: Math.max((prev[item.id] ?? 0) - 1, 0),
                      }))
                    }
                    className="flex h-7 w-7 items-center justify-center border-2 border-giri-black bg-giri-bg text-sm font-black hover:bg-giri-red hover:text-giri-white"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-black">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      setCart((prev) => ({
                        ...prev,
                        [item.id]: (prev[item.id] ?? 0) + 1,
                      }))
                    }
                    className="flex h-7 w-7 items-center justify-center border-2 border-giri-black bg-giri-bg text-sm font-black hover:bg-giri-black hover:text-giri-white"
                  >
                    +
                  </button>
                  <button
                    onClick={() =>
                      setCart((prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      })
                    }
                    className="ml-1 flex h-7 w-7 items-center justify-center border-2 border-giri-black bg-giri-red text-giri-white hover:bg-giri-black"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="mt-4 border-t-4 border-giri-black pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-widest">
              Total
            </span>
            <span className="text-2xl font-black text-giri-red">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Payment method */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setPaymentMethod("qris")}
            className={`border-4 border-giri-black px-3 py-2 text-sm font-black uppercase transition-all ${
              paymentMethod === "qris"
                ? "bg-giri-blue text-giri-black shadow-brutal-sm"
                : "bg-giri-white text-giri-black hover:bg-giri-bg"
            }`}
          >
            📱 QRIS
          </button>
          <button
            onClick={() => setPaymentMethod("cod")}
            className={`border-4 border-giri-black px-3 py-2 text-sm font-black uppercase transition-all ${
              paymentMethod === "cod"
                ? "bg-giri-blue text-giri-black shadow-brutal-sm"
                : "bg-giri-white text-giri-black hover:bg-giri-bg"
            }`}
          >
            💵 Tunai
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          className="mt-4 w-full border-4 border-giri-black bg-giri-red px-4 py-3 font-black uppercase text-giri-white shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Proses Pesanan
        </button>

        {completedOrder && (
          <div className="mt-4 space-y-3">
            <div className="border-4 border-giri-black bg-giri-yellow p-3">
              <p className="text-sm font-black uppercase">✅ Pesanan POS berhasil diproses!</p>
              <p className="mt-2 text-sm font-bold">Order: #{completedOrder.id.slice(-8).toUpperCase()}</p>
              <p className="text-sm font-bold">Total: {formatRupiah(completedOrder.total_price)}</p>
              <p className="text-sm font-bold">Pembayaran: {completedOrder.payment_method.toUpperCase()}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print flex-1 border-4 border-giri-black bg-giri-yellow px-3 py-2 text-sm font-black uppercase shadow-brutal-sm"
              >
                🖨️ Cetak Struk
              </button>
              <button
                type="button"
                onClick={resetSession}
                className="no-print flex-1 border-4 border-giri-black bg-giri-white px-3 py-2 text-sm font-black uppercase shadow-brutal-sm"
              >
                Transaksi Baru
              </button>
            </div>
            <ReceiptPrint order={completedOrder} />
          </div>
        )}

        {/* Feedback */}
        {message && !completedOrder && (
          <div
            className={`mt-3 border-4 p-3 text-sm font-bold ${
              messageType === "success"
                ? "border-giri-black bg-giri-yellow text-giri-black"
                : "border-giri-red bg-[#ffeded] text-giri-red"
            }`}
          >
            {message}
          </div>
        )}
      </aside>
    </div>
  );
}
