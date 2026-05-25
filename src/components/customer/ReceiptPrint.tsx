import type { OrderWithItems } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface ReceiptPrintProps {
  order: OrderWithItems;
}

function formatReceiptDate(date: string) {
  const parsed = new Date(date);
  const datePart = parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${datePart} ${hours}:${minutes}`;
}

export function ReceiptPrint({ order }: ReceiptPrintProps) {
  const statusLabel = order.payment_status === "paid" ? "Sudah Bayar" : "Belum Bayar";

  return (
    <div className="receipt-printable hidden">
      <div className="mx-auto w-full max-w-[72mm] whitespace-pre-wrap break-words px-2 py-2">
        <p className="text-center text-[11px] font-bold uppercase">GIRI-GIRI ONIGIRI</p>
        <p className="text-center text-[11px] font-bold uppercase">Cipayung, Jakarta Timur</p>
        <p className="mt-2 text-[11px] font-bold">Order: #{order.id.slice(-8).toUpperCase()}</p>
        <p className="text-[11px] font-bold">Tgl: {formatReceiptDate(order.created_at || new Date().toISOString())}</p>
        <div className="mt-2 border-t border-b border-black py-1">
          {order.order_items.map((item) => {
            const subtotal = item.menu_price * item.quantity;
            const left = `${item.quantity} x ${formatRupiah(item.menu_price)}`;
            return (
              <div key={item.id} className="text-[11px]">
                <p className="font-bold">{item.menu_name}</p>
                <p className="font-bold">{left.padEnd(24, " ")}{formatRupiah(subtotal)}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] font-bold">TOTAL:{"".padStart(10, " ")}{formatRupiah(order.total_price)}</p>
        <p className="text-[11px] font-bold">Pembayaran: {order.payment_method === "qris" ? "QRIS" : "COD"}</p>
        <p className="text-[11px] font-bold">Status: {statusLabel}</p>
        <p className="mt-2 text-[11px] font-bold">Nama: {order.customer_name}</p>
        <p className="mt-2 text-[11px] font-bold">Terima kasih!</p>
        <p className="text-[11px] font-bold">Pesan lagi: giri-giri.vercel.app</p>
      </div>
    </div>
  );
}
