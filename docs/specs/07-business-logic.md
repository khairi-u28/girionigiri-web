# Spec 08 — Business Logic & Utilities

---

## 1. Phone Number Normalization

Phone number is the customer's tracking key. Must be normalized consistently
before storage and before querying.

### Rules

```
Input           → Stored as
081234567890    → 6281234567890
+6281234567890  → 6281234567890
6281234567890   → 6281234567890
```

### Implementation — `src/lib/utils.ts`

```typescript
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, ""); // strip non-digits
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits; // fallback: store as-is
}
```

### Usage

- Call `normalizePhone()` in `submitOrder()` server action before inserting to DB
- Call `normalizePhone()` in `processPosOrder()` when phone is provided
- The tracking URL is `/guest/order-history/${normalizePhone(phone)}`
- The query in the tracking page uses the normalized phone from the URL param

---

## 2. Cut-off Time Logic

All time calculations use **WIB timezone (UTC+7)**.

### Rule

```
IF   currentTimeWIB  < store_settings.cut_off_time
THEN min_delivery_date = tomorrow (today + 1)

IF   currentTimeWIB  >= store_settings.cut_off_time
THEN min_delivery_date = day after tomorrow (today + 2)
```

### Implementation — `src/lib/utils.ts`

```typescript
import { addDays, isAfter, set, startOfDay, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Jakarta";

export function getNowWIB(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function getMinDeliveryDate(cutOffTime: string): Date {
  const now = getNowWIB();
  const [hours, minutes] = cutOffTime.split(":").map(Number);
  const cutoff = set(now, { hours, minutes, seconds: 0, milliseconds: 0 });
  return addDays(now, isAfter(now, cutoff) ? 2 : 1);
}

export function getMinDeliveryDateStr(cutOffTime: string): string {
  return format(getMinDeliveryDate(cutOffTime), "yyyy-MM-dd");
}
```

### Usage in `OrderForm.tsx`

```typescript
// Passed from server (settings.cut_off_time) to client component as prop
const minDateStr = getMinDeliveryDateStr(settings.cut_off_time)

// Apply to date input
<input
  type="date"
  min={minDateStr}
  defaultValue={minDateStr}   // auto-fill with the minimum valid date
  {...register('delivery_date', { valueAsDate: true })}
/>
```

---

## 3. Daily Quota Check

Run this check inside the `submitOrder()` server action, BEFORE inserting.

### Rule

```
GET SUM(order_items.quantity)
WHERE orders.delivery_date = selected_date
AND   orders.order_status  != 'cancelled' (if you add this in future)

IF sum + new_order_qty > store_settings.daily_quota
THEN return { error: 'Kuota untuk tanggal ini sudah habis.' }
```

### Implementation — inside `submitOrder()` action

```typescript
const deliveryDateStr = format(parsed.data.delivery_date, "yyyy-MM-dd");

// Count existing orders for that date
const { data: existingItems } = await supabase
  .from("order_items")
  .select("quantity, orders!inner(delivery_date)")
  .eq("orders.delivery_date", deliveryDateStr);

const existingQty = (existingItems ?? []).reduce(
  (sum, i) => sum + i.quantity,
  0,
);
const newQty = parsed.data.items.reduce((sum, i) => sum + i.quantity, 0);

if (existingQty + newQty > settings.daily_quota) {
  return {
    error: `Maaf, kuota untuk tanggal ${formatDateIndonesian(parsed.data.delivery_date)} sudah habis. Pilih tanggal lain.`,
  };
}
```

---

## 4. Order Total Calculation

### Implementation — `src/lib/utils.ts`

```typescript
import type { MenuItem } from "@/types";

export function calculateOrderTotal(
  items: { menu_id: string; quantity: number }[],
  menuItems: MenuItem[],
): number {
  return items.reduce((total, item) => {
    const menu = menuItems.find((m) => m.id === item.menu_id);
    if (!menu || item.quantity < 1) return total;
    return total + menu.price * item.quantity;
  }, 0);
}
```

**Critical rule**: Always re-fetch menu prices from DB in server actions.
Never trust prices sent from the client form.

```typescript
// In submitOrder() — always fetch fresh prices
const { data: menuItems } = await supabase
  .from("menu_items")
  .select("id, price, name")
  .eq("is_active", true);

const total = calculateOrderTotal(selectedItems, menuItems!);
```

---

## 5. WhatsApp Message Format

### Target output (rendered in WA with bold and formatting)

```
🍙 *PESANAN BARU — GIRI-GIRI ONIGIRI*

Halo, saya ingin memesan:

📋 *Detail Pesanan*
Nama        : Budi Santoso
No. HP      : 081234567890
Tipe        : Kantor (Auto2000)
Departemen  : IT
Tanggal     : Senin, 26 Mei 2026
Pembayaran  : Bayar Langsung (COD)

🛒 *Item Pesanan*
• Tongkol Cue Mayo x2 — Rp10.000
• Tempe Teriyaki x1 — Rp5.000

💰 *Total: Rp15.000*

🔗 Lacak pesanan: https://girionigiri.com/guest/order-history/6281234567890

📝 Catatan: Tidak pedas semua ya kak
```

### Implementation — `src/lib/whatsapp.ts` (complete file)

```typescript
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { OrderWithItems } from "@/types";
import { formatRupiah, normalizePhone } from "./utils";
import { DELIVERY_LABELS } from "./constants";

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Bayar Langsung (COD)",
  qris: "QRIS / Transfer",
};

export function formatWhatsAppMessage(
  order: OrderWithItems,
  baseUrl: string,
): string {
  const trackingUrl = `${baseUrl}/guest/order-history/${normalizePhone(order.phone_number)}`;
  const deliveryDate = format(
    new Date(order.delivery_date),
    "EEEE, dd MMMM yyyy",
    { locale: localeId },
  );
  const departmentLine = order.department
    ? `Departemen  : ${order.department}\n`
    : "";
  const addressLine = order.delivery_address
    ? `Alamat      : ${order.delivery_address}\n`
    : "";
  const itemList = order.order_items
    .filter((i) => i.quantity > 0)
    .map((i) => {
      const variant = i.variant ? ` (${i.variant})` : "";
      return `• ${i.menu_name}${variant} x${i.quantity} — ${formatRupiah(i.menu_price * i.quantity)}`;
    })
    .join("\n");
  const notesLine = order.notes ? `\n📝 Catatan: ${order.notes}` : "";

  return `🍙 *PESANAN BARU — GIRI-GIRI ONIGIRI*

Halo, saya ingin memesan:

📋 *Detail Pesanan*
Nama        : ${order.customer_name}
No. HP      : ${order.phone_number}
Tipe        : ${DELIVERY_LABELS[order.delivery_type]}
${departmentLine}${addressLine}Tanggal     : ${deliveryDate}
Pembayaran  : ${PAYMENT_LABELS[order.payment_method]}

🛒 *Item Pesanan*
${itemList}

💰 *Total: ${formatRupiah(order.total_price)}*

🔗 Lacak pesanan: ${trackingUrl}${notesLine}`;
}

export function generateWhatsAppLink(
  waNumber: string,
  message: string,
): string {
  const normalized = normalizePhone(waNumber);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
```

---

## 6. Date Formatting Utilities — `src/lib/utils.ts`

```typescript
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

// "Senin, 26 Mei 2026"
export function formatDateIndonesian(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE, dd MMMM yyyy", { locale: localeId });
}

// "26/05/2026"
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy");
}

// "09:15 WIB"
export function formatTimeWIB(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(toZonedTime(d, "Asia/Jakarta"), "HH:mm") + " WIB";
}
```

---

## 7. Currency Formatting — `src/lib/utils.ts`

```typescript
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
```

---

## 8. Shadcn cn() Utility — `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 9. POS Invoice Print Logic

The invoice dialog has a `<div id="pos-invoice-content">` wrapper.

On `window.print()`, CSS hides everything except that div.

Add to `globals.css`:

```css
@media print {
  body > * {
    display: none !important;
  }
  #pos-invoice-content {
    display: block !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    font-family: monospace;
    font-size: 12px;
    padding: 16px;
  }
}
```

Invoice div structure for print:

```tsx
<div id="pos-invoice-content" className="hidden">
  <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
    <p className="font-black text-lg uppercase">GIRI-GIRI ONIGIRI</p>
    <p className="font-serif text-sm">ギリギリ おにぎり</p>
    <p className="text-xs text-gray-600">Cipayung, Jakarta Timur</p>
  </div>
  <p className="text-xs">
    {formatDateIndonesian(new Date())} · {formatTimeWIB(new Date())}
  </p>
  <p className="text-xs">Order #{order.id.slice(-6)} · POS</p>
  <div className="border-t border-dashed border-gray-400 my-2" />
  {order.order_items.map((item) => (
    <div key={item.id} className="flex justify-between text-xs">
      <span>
        {item.menu_name} x{item.quantity}
      </span>
      <span>{formatRupiah(item.menu_price * item.quantity)}</span>
    </div>
  ))}
  <div className="border-t border-dashed border-gray-400 my-2" />
  <div className="flex justify-between font-black">
    <span>TOTAL</span>
    <span>{formatRupiah(order.total_price)}</span>
  </div>
  <p className="text-xs mt-1">
    Metode: {order.payment_method === "cod" ? "Tunai" : "QRIS"}
  </p>
  <div className="text-center mt-4 border-t border-dashed border-gray-400 pt-3">
    <p className="font-bold">TERIMA KASIH! 🙏</p>
    <p className="text-xs">WA: {settings.whatsapp_number}</p>
  </div>
</div>
```

---

## 10. Store Settings Singleton — Always UPSERT

```typescript
// CORRECT — always upsert with id: 1
await supabase
  .from('store_settings')
  .upsert({ id: 1, ...updates }, { onConflict: 'id' })

// CORRECT — always fetch with .single()
const { data } = await supabase
  .from('store_settings')
  .select('*')
  .eq('id', 1)
  .single()

// NEVER do this
await supabase.from('store_settings').insert({ ... })  // ❌ will fail or duplicate
```

---

## 11. Complete `src/lib/utils.ts`

```typescript
import { addDays, format, isAfter, set, startOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MenuItem } from "@/types";

const TIMEZONE = "Asia/Jakarta";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits;
}

export function getNowWIB(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function getMinDeliveryDate(cutOffTime: string): Date {
  const now = getNowWIB();
  const [hours, minutes] = cutOffTime.split(":").map(Number);
  const cutoff = set(now, { hours, minutes, seconds: 0, milliseconds: 0 });
  return addDays(now, isAfter(now, cutoff) ? 2 : 1);
}

export function getMinDeliveryDateStr(cutOffTime: string): string {
  return format(getMinDeliveryDate(cutOffTime), "yyyy-MM-dd");
}

export function isDateDisabled(date: Date, minDate: Date): boolean {
  return startOfDay(date) < startOfDay(minDate);
}

export function formatDateIndonesian(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE, dd MMMM yyyy", { locale: localeId });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy");
}

export function formatTimeWIB(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(toZonedTime(d, TIMEZONE), "HH:mm") + " WIB";
}

export function calculateOrderTotal(
  items: { menu_id: string; quantity: number }[],
  menuItems: Pick<MenuItem, "id" | "price">[],
): number {
  return items.reduce((total, item) => {
    const menu = menuItems.find((m) => m.id === item.menu_id);
    if (!menu || item.quantity < 1) return total;
    return total + menu.price * item.quantity;
  }, 0);
}
```
