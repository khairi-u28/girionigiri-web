# Spec 05 — MVP Scope & Build Order

## What "MVP" Means Here

MVP = the 3 flows below work end-to-end without errors, ready for Vercel deploy:

1. **Guest order flow**: customer places a pre-order online
2. **Guest tracking**: customer checks their order status by phone number
3. **Admin order management**: admin views orders, advances status, marks as paid, and runs POS

Everything else (inventory, recipes, menu management, settings) is Phase 2 — it must EXIST but doesn't need to be polished.

---

## Build Order for the Agent

Complete each stop fully before moving to the next.

---

### STOP 0 — Fix Existing Bugs First

These bugs exist in the current codebase and will cause build/runtime failures:

**Bug 1: `PageProps` type doesn't exist**
File: `src/app/guest/order-history/[uuid]/page.tsx`
Fix: Replace `PageProps<"...">` with:

```typescript
export default async function OrderHistoryPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = await params
```

**Bug 2: Route is `[uuid]` but should be `[phone]`**
The tracking URL uses the customer's phone number (not order UUID) per product design.
Fix: Delete `src/app/guest/order-history/[uuid]/` and recreate as `src/app/guest/order-history/[phone]/page.tsx`.

**Bug 3: `shadow-brutal` classes don't work in Tailwind v4**
Custom shadows defined in `@theme inline` are not being used. Component files use arbitrary values like `shadow-[8px_8px_0px_0px_#2b2b2b]`.
Fix: Replace ALL arbitrary shadow values with named tokens: `shadow-brutal`, `shadow-brutal-sm`, `shadow-brutal-lg`.

**Bug 4: `globals.css` uses wrong background**
The current `body { background-color: #ffffff }` should be `#f4f4f0` (giriBg) to match the design.

**Bug 5: Missing `PageProps` workaround for Next 16**
Next.js 16 requires `params` to be awaited as a Promise. Check ALL dynamic route pages for this pattern.

---

### STOP 1 — Guest Landing Page

**Goal**: Landing page matches `guest.html` pixel-for-pixel.

**File to build/fix**: `src/app/guest/page.tsx` and its components.

**Components to build**:

`Navbar.tsx`:

- White bg, `border-b-4 border-giri-black`, sticky top
- Left: `ギリ` in `font-serif font-black text-giri-red` + "Giri-Giri" in `font-black uppercase`
- Right: animated "PO BUKA/TUTUP" pill + black "PO Sini" CTA button
- PO status pill shows red dot if `is_open`, gray if closed (from `store_settings`)

`MarqueeBanner.tsx`:

- Yellow bg, `border-b-2 border-giri-black`
- Text from `store_settings.marquee_text`
- Uses `.animate-marquee` CSS class (defined in globals.css)
- Always visible even when announcement is off

`AnnouncementBanner.tsx`:

- Only renders if `store_settings.announcement_active === true`
- Red bg, white text, border bottom

`HeroSection.tsx`:

- Red bg card with `border-4 border-giri-black shadow-brutal-lg`
- Japanese kanji decorative bg: `absolute -right-10 -top-10 text-[15rem] font-serif text-red-900 opacity-50`
- Yellow badge `-rotate-2`: "SARAPAN ANAK KANTORAN"
- H1: large uppercase, `text-shadow: 4px 4px 0px #2b2b2b`
- Right: hero image in a `rotate-6 hover:rotate-0` white bordered box

`MenuSection.tsx`:

- Fetch active menu_items, group by category
- "Menu Utama" (onigiri): 3-column grid of `MenuCard`
- "Teman Makan" (side_dish + drink): 2-column horizontal cards (yellow + blue bg)

`MenuCard.tsx`:

- White card, `border-4 border-giri-black shadow-brutal`
- Image at top `h-48 border-b-4 border-giri-black overflow-hidden` with hover scale
- Category badge (Best Seller / Budget Meal / etc from `is_highlighted`)
- Name in `font-black text-2xl uppercase`
- Price in `font-black text-2xl text-giri-red`

`OrderCTA.tsx`:

- White bordered section with decorative arrow SVG above
- Big red "ISI FORM PO SEKARANG →" button linking to `/guest/order`
- Green pulse dot "Sistem PO Otomatis Aktif"

`GuestFooter.tsx`:

- Black bg, `border-t-8 border-giri-red`
- 3 columns: brand, location/hours, copyright

**Data**: All data fetched server-side in `page.tsx`. Pass to components as props.

---

### STOP 2 — Guest Order Form

**Goal**: Customer can select menu items, fill details, submit, and get WA link. Must match `guest-form.html`.

**File**: `src/app/guest/order/page.tsx` (server) + `OrderForm.tsx` (client)

**The form has 3 sections** (matching guest-form.html):

**Section 1 — Pilih Menu**

- Each active menu item rendered as `MenuItemRow` with `+`/`-` stepper
- Show `Rp{price}` per item
- Running total updates live via `useState`
- No Shadcn here — use the raw stepper from design spec

**Section 2 — Info Pengiriman**

- `customer_name`: text input
- `phone_number`: text input (this is the tracking key)
- `delivery_type`: radio cards (Kantor Auto2000 / Pickup Cipayung / Alamat Lain)
- `department`: appears ONLY when `auto2000` selected — Shadcn `<Select>` dropdown
- `delivery_address`: appears ONLY when `external` selected — textarea
- `delivery_date`: date input with `min` set from cut-off logic (see spec 08)

**Section 3 — Pembayaran**

- Radio cards: Bayar Langsung (COD) / QRIS
- Optional notes textarea

**Sticky bottom bar** — always visible:

- Black bg with giri-red border
- Shows live total in yellow
- "Selesaikan PO" red submit button

**On submit**:

1. Validate with Zod
2. Check quota for selected date (server action)
3. Insert to `orders` + `order_items`
4. On success: show confirmation state
5. Confirmation shows: PaymentInstructions + WhatsAppButton + link to `/guest/order-history/{phone}`

**Server action**: `src/app/guest/order/actions.ts` → `submitOrder()`

---

### STOP 3 — Guest Order History (Tracking Page)

**Goal**: Customer opens `/order-history/{phone}` and sees all their orders with live status.

**URL**: `/guest/order-history/[phone]/page.tsx`

- `phone` param = normalized phone number (e.g. `6281234567890`)
- Fetch ALL orders for that phone, newest first, including `order_items`
- If no orders found, show a friendly "Pesanan tidak ditemukan" message

**`OrderTracker` component**:

Each order card shows:

1. **Order ID** (last 6 chars of UUID): `#abc123`
2. **Date**: formatted Indonesian (`Senin, 14 Mei 2026`)
3. **Items list** with quantities and prices
4. **Total** in `text-giri-red font-black`
5. **Payment status badge** (Lunas / Belum Bayar)
6. **Step indicator** (visual progress):

```
[●]────────[○]────────[○]
Diterima    Dimasak    Terkirim    ← received

[●]────────[●]────────[○]
Diterima    Dimasak    Terkirim    ← processing

[●]────────[●]────────[●]
Diterima    Dimasak    Terkirim    ← delivered
```

Step indicator implementation:

- Filled dot: `w-8 h-8 bg-giri-black border-2 border-giri-black flex items-center justify-center`
- Empty dot: `w-8 h-8 bg-giri-white border-2 border-giri-black`
- Connecting line: `flex-1 border-t-2 border-giri-black`
- Labels below each step in `text-xs font-bold uppercase`

**Realtime**: Subscribe to Supabase `postgres_changes` for `orders` table filtered by phone_number.
Update the relevant order card when status changes — no page refresh needed.

---

### STOP 4 — Admin Order Management

**Goal**: Admin can see today's orders, advance status (received → processing → delivered), and mark payment as paid.

**File**: `src/app/admin/dashboard/page.tsx` with 3 tabs (Shadcn `<Tabs>`):

- Tab 1: **POS** (Stop 5)
- Tab 2: **Rekap Dapur** (Kitchen Summary)
- Tab 3: **Pesanan** (Order Board) ← build this now

**Order Board** (`OrderBoard.tsx`):

- Shadcn `<Table>` listing today's orders (and upcoming dates)
- Date filter at top (defaults to today)
- Columns: ID, Nama, Tipe, Tgl, Items, Total, Bayar, Status, Aksi
- "Aksi" column has two buttons:
  - `→` advance order status (`received→processing→delivered`)
  - `✓ Lunas` mark payment as paid (only shown if `payment_status === 'pending'`)
- Realtime: subscribes to `orders` table updates, updates rows live
- Row click opens a detail dialog (Shadcn `<Dialog>`) showing full order details + items

**Kitchen Summary** (`KitchenSummary.tsx`):

- Date picker (Shadcn `<Popover>` + `<Calendar>`) or plain date input
- Refresh button
- Table: Menu | Jumlah Porsi | Variant
- Group by `menu_name`, sum quantities
- Show grand total row

**Server actions**:

- `advanceOrderStatus(orderId, newStatus)` → updates `order_status`
- `markOrderPaid(orderId)` → updates `payment_status = 'paid'`
- `getKitchenSummary(date)` → aggregates order_items for that date

---

### STOP 5 — Admin POS + Invoice

**Goal**: Admin can record walk-in sales via the POS tab. After checkout, an invoice appears.

**File**: `POSInterface.tsx` (POS tab in dashboard)

**Layout** (split: 2/3 menu grid + 1/3 cart):

Left: Menu button grid

- Shadcn `<Button>` per menu item, large (`min-h-20`)
- Shows name + price
- Click adds 1 to cart
- Group by category with small category label

Right: Cart sidebar

- List of cart items with `+`/`-` controls and remove `×`
- Subtotal per item
- Total at bottom
- Payment method toggle: QRIS / Tunai
- Customer name input (optional for POS)
- Customer phone input (optional — if filled, order appears in their tracking)
- "Proses Pesanan" red button

**On "Proses Pesanan"**:

1. Validate: cart not empty
2. Call `processPosOrder()` server action
3. Inserts to `orders` (source: 'pos', delivery_type: 'pickup', delivery_date: today)
4. Inserts to `order_items`
5. On success: open `POSInvoice` dialog

**`POSInvoice` component** (Shadcn `<Dialog>`):

- Header: "GIRI-GIRI ONIGIRI" + "ギリギリ おにぎり" + date/time
- Order ID: `#xxxxxx`
- Items table: name | qty | price | subtotal
- Divider line (dashed)
- Total in large `font-black text-giri-red`
- Payment method + amount received (if COD, shows "Bayar Langsung")
- Footer: "Terima kasih!" + WA number
- Two buttons: `🖨️ Print` (calls `window.print()`) + `✓ Selesai` (closes dialog, clears cart)
- Add `@media print` CSS to hide everything except the invoice card

**Server action**: `processPosOrder(items, paymentMethod, customerName?, phone?)`

---

### STOP 6 — Admin Menu + Inventory (Phase 2, must exist)

Build the pages but they don't need to be polished for MVP launch:

**`/admin/menu/page.tsx`**:

- List all menu items (active + inactive)
- Add / Edit / Toggle active / Toggle highlighted
- Shadcn `<Dialog>` for add/edit form
- `menuItemSchema` validation

**`/admin/inventory/page.tsx`**:

- List inventory items
- Add / Edit / Delete
- Already partially built — clean up and ensure it works

**`/admin/recipes/page.tsx`**:

- Already exists — verify it works

**`/admin/settings/page.tsx`**:

- Already exists — verify it works
- Add QRIS image preview when URL is valid

---

## Deployment Checklist (before Vercel deploy)

- [ ] All `.env.local` vars set in Vercel project settings
- [ ] Supabase tables created and seeded (store_settings row = 1)
- [ ] RLS policies applied
- [ ] `NEXT_PUBLIC_BASE_URL` set to production URL in env
- [ ] `next build` passes with zero errors
- [ ] Test guest order flow end-to-end
- [ ] Test admin login and POS
- [ ] Test order tracking by phone
