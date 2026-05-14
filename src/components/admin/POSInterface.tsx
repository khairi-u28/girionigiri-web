"use client";

import { useMemo, useState } from "react";
import type { MenuItem } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { processPosOrder } from "@/app/admin/dashboard/pos-actions";

interface POSInterfaceProps {
  menuItems: MenuItem[];
}

export function POSInterface({ menuItems }: POSInterfaceProps) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "cod">("qris");
  const [message, setMessage] = useState<string>("");

  const cartItems = useMemo(
    () =>
      menuItems
        .map((item) => ({ ...item, quantity: cart[item.id] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [cart, menuItems],
  );

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function submit() {
    const items = cartItems.map((item) => ({ menu_id: item.id, quantity: item.quantity }));
    const result = await processPosOrder(items, paymentMethod);
    if ("error" in result) {
      setMessage(result.error);
      return;
    }
    setMessage("Pesanan POS berhasil diproses.");
    setCart({});
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }))}
            className="min-h-24 border-4 border-giri-black bg-giri-yellow p-3 text-left shadow-[4px_4px_0px_0px_#2b2b2b]"
          >
            <p className="font-heading font-bold text-giri-black">{item.name}</p>
            <p className="text-giri-black">{formatRupiah(item.price)}</p>
          </button>
        ))}
      </div>
      <aside className="border-4 border-giri-black bg-giri-white p-4 shadow-[8px_8px_0px_0px_#2b2b2b]">
        <h2 className="font-heading text-2xl font-bold text-giri-black">Cart</h2>
        <div className="mt-3 space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>{item.name} x{item.quantity}</span>
              <button
                onClick={() => setCart((prev) => ({ ...prev, [item.id]: Math.max((prev[item.id] ?? 0) - 1, 0) }))}
                className="border-2 border-giri-black bg-giri-white px-2"
              >
                -
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 font-heading text-xl font-bold text-giri-red">Total: {formatRupiah(total)}</p>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setPaymentMethod("qris")} className="border-4 border-giri-black bg-giri-blue px-3 py-2 font-heading font-bold">QRIS</button>
          <button onClick={() => setPaymentMethod("cod")} className="border-4 border-giri-black bg-giri-white px-3 py-2 font-heading font-bold">Tunai</button>
        </div>
        <button onClick={submit} className="mt-4 w-full border-4 border-giri-black bg-giri-red px-4 py-3 font-heading font-bold text-giri-white">
          Proses Pesanan
        </button>
        {message ? <p className="mt-2 text-sm text-giri-black">{message}</p> : null}
      </aside>
    </div>
  );
}
