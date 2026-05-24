# AGENTS.md — Giri-giri Onigiri Web

## ⚠️ READ THIS BEFORE WRITING A SINGLE LINE OF CODE

This project uses versions with **breaking changes** from what your training data knows. Non-negotiable rules:

---

## 1. Next.js 16 — Breaking Changes

**Dynamic route params are Promises:**

```typescript
// ❌ WRONG (Next.js 13–14 style)
export default function Page({ params }: { params: { phone: string } }) {}

// ✅ CORRECT (Next.js 16)
export default async function Page({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone } = await params;
}
```

**Server Actions must use `'use server'` directive and live in separate files or at top of file — not inside client components.**

**`PageProps` generic does NOT exist.** Never use `PageProps<"...">`.

Read `node_modules/next/dist/docs/` if in doubt.

---

## 2. Tailwind CSS v4 — No tailwind.config.ts

This project uses Tailwind v4 via `@tailwindcss/postcss`. There is NO `tailwind.config.ts`.

Design tokens live in `src/app/globals.css` under `@theme inline {}`:

```css
@import "tailwindcss";

@theme inline {
  --color-giri-red: #a90402;
  --color-giri-black: #2b2b2b;
  --color-giri-white: #ffffff;
  --color-giri-bg: #f4f4f0;
  --color-giri-yellow: #ffde59;
  --color-giri-blue: #4ecdc4;
  --shadow-brutal-sm: 2px 2px 0px 0px #2b2b2b;
  --shadow-brutal: 4px 4px 0px 0px #2b2b2b;
  --shadow-brutal-lg: 8px 8px 0px 0px #2b2b2b;
  --shadow-brutal-red: 4px 4px 0px 0px #a90402;
  --shadow-brutal-yellow: 4px 4px 0px 0px #ffde59;
  --font-sans: "Inter", sans-serif;
  --font-serif: "Noto Serif JP", serif;
}
```

Use `shadow-brutal`, `shadow-brutal-lg` etc. as named utilities. NEVER use arbitrary `shadow-[8px_8px_0px_0px_#2b2b2b]` — use the token.

---

## 3. Zod v4 — Breaking Changes

Error message key changed:

```typescript
// ❌ WRONG (Zod v3)
z.string({ required_error: "Wajib diisi" });

// ✅ CORRECT (Zod v4)
z.string({ error: "Wajib diisi" });
```

---

## 4. Shadcn/UI Setup Required First

Before building ANY admin component, Shadcn must be initialized:

```bash
npx shadcn@latest init
# Select: TypeScript · App Router · Tailwind v4 · yes to globals.css
```

Then add components as needed:

```bash
npx shadcn@latest add button input label select card table badge dialog sheet tabs
```

Admin pages use Shadcn components. Guest pages use raw Tailwind matching the Neo-Brutalism HTML references.

---

## 5. Project Architecture

```
src/
├── app/
│   ├── guest/              # Customer-facing (Neo-Brutalism style)
│   │   ├── page.tsx        # Landing page
│   │   ├── order/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts  # Server action: submitOrder
│   │   └── order-history/
│   │       └── [phone]/
│   │           └── page.tsx
│   ├── admin/              # Admin (Shadcn/UI style)
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── dashboard/
│   │       └── page.tsx    # Tab-based: Orders, POS, Kitchen, Menu, Inventory, Settings
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── customer/           # Guest-side components
│   │   ├── OrderForm.tsx
│   │   ├── OrderTracker.tsx
│   │   └── ReceiptPrint.tsx
│   └── admin/              # Admin-side Shadcn-based components
│       ├── POSInterface.tsx
│       ├── OrdersTable.tsx
│       ├── KitchenSummary.tsx
│       ├── MenuManager.tsx
│       ├── InventoryTable.tsx
│       └── SettingsPanel.tsx
├── lib/
│   ├── supabase.ts
│   ├── utils.ts            # formatRupiah, calculateCutoff, WIB helpers
│   ├── validations.ts      # Zod schemas
│   ├── constants.ts        # DELIVERY_TYPES, PAYMENT_METHODS, DEPARTMENTS, etc.
│   └── whatsapp.ts         # buildWAMessage()
├── middleware.ts            # Auth + role check
└── types/index.ts          # All DB + form types
```

---

## 6. Database Schema (Supabase)

```sql
-- orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('auto2000','cipayung','pickup')),
  department TEXT,              -- only for auto2000
  address TEXT,                 -- only for cipayung
  delivery_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod','qris')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending','confirmed','cooked','delivered','cancelled')),
  notes TEXT,
  total INTEGER NOT NULL,       -- in Rupiah (no decimals)
  source TEXT DEFAULT 'online' CHECK (source IN ('online','pos')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- order_items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  spicy_option TEXT           -- 'pedas' | 'tidak' | null
);

-- menu_items
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT DEFAULT 'main' CHECK (category IN ('main','extra','drink','dessert')),
  is_active BOOLEAN DEFAULT true,
  is_highlighted BOOLEAN DEFAULT false,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0
);

-- inventory_items
CREATE TABLE inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock_quantity NUMERIC(10,2) DEFAULT 0,
  min_threshold NUMERIC(10,2) DEFAULT 0
);

-- recipes (ingredient per menu item)
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_per_unit NUMERIC(10,3) NOT NULL
);

-- app_settings (singleton row, id = 1)
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  qris_url TEXT,
  daily_quota INTEGER DEFAULT 50,
  cutoff_hour INTEGER DEFAULT 20,
  cutoff_minute INTEGER DEFAULT 0,
  promo_text TEXT DEFAULT '⚡ PO DITUTUP JAM 20:00 WIB SETIAP HARINYA ⚡'
);
```

---

## 7. Authentication & Role System

```typescript
// Two roles stored in cookie:
// 'owner'    → full access to all tabs
// 'operator' → only 'pos' and 'analytics' tabs visible

// middleware.ts pattern:
// - /admin/login: public
// - /admin/*: check cookie 'admin_role' exists
// - If role === 'operator' and accessing /admin/menu etc → redirect to dashboard

// Login credentials from env:
// OWNER_PASSWORD + OPERATOR_PASSWORD
// On login, set cookie: { name: 'admin_role', value: 'owner'|'operator' }
```

---

## 8. Order History Route

Route: `/guest/order-history/[phone]`

- Phone is the customer's normalized Indonesian number (e.g. `081234567890`)
- Query: `SELECT * FROM orders WHERE phone = $1 ORDER BY created_at DESC`
- Shows ALL orders for that phone number, most recent first
- Each order card has a "Cetak Struk" (print receipt) button
- Print triggers `window.print()` with thermal receipt CSS (`@media print`)

---

## 9. WhatsApp Post-Order Flow

After successful order submission:

1. Show order confirmation screen with order details
2. CTA button: "Kirim ke WhatsApp Saya"
3. URL: `https://wa.me/${phone}?text=${encodedMessage}`
   - This sends a message TO THE CUSTOMER THEMSELVES (they become the sender)
   - Message includes: order summary, total, order-history link

```typescript
// lib/whatsapp.ts
export function buildWAMessage(
  order: Order,
  items: OrderItem[],
  baseUrl: string,
): string {
  const historyUrl = `${baseUrl}/guest/order-history/${order.phone}`;
  const lines = [
    `*Konfirmasi PO Giri-giri Onigiri*`,
    `Nama: ${order.name}`,
    `Tanggal Kirim: ${formatDateIndonesian(order.delivery_date)}`,
    ``,
    `*Pesanan:*`,
    ...items.map(
      (i) =>
        `• ${i.menu_item.name} x${i.quantity} = ${formatRupiah(i.quantity * i.unit_price)}`,
    ),
    ``,
    `*Total: ${formatRupiah(order.total)}*`,
    `Pembayaran: ${PAYMENT_LABELS[order.payment_method]}`,
    ``,
    `Cek status pesanan: ${historyUrl}`,
  ];
  return lines.join("\n");
}
```

---

## 10. Receipt Format (Thermal)

```tsx
// ReceiptPrint component — visible only during print
// Width: 72mm (≈272px at 96dpi) — standard 80mm thermal paper minus margins
// Font: monospace, 10-11px
// No images, no colors — just text

/* In globals.css: */
@media print {
  body * { visibility: hidden; }
  .receipt-printable, .receipt-printable * { visibility: visible; }
  .receipt-printable {
    position: absolute; left: 0; top: 0;
    width: 72mm; font-family: 'Courier New', monospace; font-size: 10px;
  }
  .no-print { display: none !important; }
}
```

---

## 11. WIB Cut-off Logic

```typescript
// lib/utils.ts
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const WIB = "Asia/Jakarta";

export function getMinDeliveryDate(settings: AppSettings): Date {
  const nowWIB = toZonedTime(new Date(), WIB);
  const cutoff = new Date(nowWIB);
  cutoff.setHours(settings.cutoff_hour, settings.cutoff_minute, 0, 0);

  const minDate = nowWIB > cutoff ? addDays(nowWIB, 2) : addDays(nowWIB, 1);
  // Set to start of day
  minDate.setHours(0, 0, 0, 0);
  return minDate;
}
```

---

## 12. POS Source Tagging

POS-created orders must be tagged:

```typescript
// In POSInterface server action:
const order = await supabase.from("orders").insert({
  ...orderData,
  source: "pos",
  payment_status: paymentMethod === "cash" ? "paid" : "unpaid",
  order_status: "confirmed", // POS orders skip 'pending'
  delivery_date: new Date().toISOString().split("T")[0], // today
});
```

---

## 13. Stock Decrement Trigger

Stock decrements happen when admin changes `order_status` to `'cooked'`:

```typescript
// In orders update action, if new status === 'cooked':
// 1. Fetch all order_items for this order
// 2. For each item, fetch its recipes
// 3. Decrease inventory_items.stock_quantity by (order_item.quantity * recipe.quantity_per_unit)
// Use a Supabase transaction or RPC for atomicity
```
