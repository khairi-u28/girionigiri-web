import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { OrderWithItems } from "@/types";
import { formatRupiah } from "./utils";

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  auto2000: "Auto2000 (Antar ke kantor)",
  cipayung_pickup: "Ambil di Cipayung",
  external: "Pengiriman Umum",
};

const PAYMENT_LABELS: Record<string, string> = {
  qris: "QRIS (Transfer)",
  cod: "COD (Bayar di tempat)",
};

export function formatWhatsAppMessage(
  order: OrderWithItems,
  baseUrl?: string,
): string {
  const resolvedBaseUrl =
    baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const trackingUrl = `${resolvedBaseUrl}/guest/order-history/${order.id}`;
  const deliveryDateFormatted = format(new Date(order.delivery_date), "EEEE, dd MMMM yyyy", {
    locale: localeId,
  });

  const departmentLine = order.department ? `Departemen    : ${order.department}\n` : "";
  const notesLine = order.notes ? `\n📝 Catatan: ${order.notes}` : "";

  const itemList = order.order_items
    .map((item) => `• ${item.menu_name} x${item.quantity} — ${formatRupiah(item.menu_price * item.quantity)}`)
    .join("\n");

  return `🍙 *PESANAN BARU — GIRI-GIRI ONIGIRI*

Halo, saya ingin memesan:

📋 *Detail Pesanan*
Nama        : ${order.customer_name}
No. WA      : ${order.whatsapp_number}
Tipe        : ${DELIVERY_TYPE_LABELS[order.delivery_type]}
${departmentLine}Tanggal     : ${deliveryDateFormatted}
Pembayaran  : ${PAYMENT_LABELS[order.payment_method]}

🛒 *Item Pesanan*
${itemList}

💰 Total: ${formatRupiah(order.total_price)}

🔗 Tracking: ${trackingUrl}${notesLine}`;
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  const normalized = cleaned.startsWith("0") ? `62${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
