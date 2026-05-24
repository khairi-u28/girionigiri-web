# Spec 01 — Project Overview & Goals (UPDATED)

> Last updated: May 2026 — incorporates all owner clarifications

---

## Business Context

**Product:** Giri-giri Onigiri — Japanese fusion onigiri stall, Cipayung, Jakarta Timur
**Operational model:** Pre-order (PO) for morning delivery to offices + walk-in stall sales
**Owner:** Khairi (system admin/owner role)
**Operator:** Khairi's brother (stall operator, limited access)

---

## User Roles

| Role       | Username | Access                                                                     |
| ---------- | -------- | -------------------------------------------------------------------------- |
| `owner`    | Khairi   | All admin tabs: Orders, POS, Kitchen, Menu, Inventory, Settings, Analytics |
| `operator` | Brother  | Only: POS tab + Analytics tab                                              |

Authentication: cookie-based (`admin_role` cookie), password-only (no username). Two separate env vars: `OWNER_PASSWORD` and `OPERATOR_PASSWORD`.

---

## Core User Flows

### Customer Flow

```
1. Visit /guest → Browse menu (landing page, Neo-Brutalism design)
2. Click "PO Sini" → /guest/order (order form)
3. Fill: menu items + quantity + spicy option, delivery type, date, payment
4. Submit → order saved to Supabase
5. Confirmation screen → CTA: "Kirim ke WhatsApp Saya"
   └─ Opens wa.me/{phone}?text={orderSummary + historyLink}
   └─ Customer sends themselves a WhatsApp message with the link
6. Customer can revisit /guest/order-history/{phone} anytime
   └─ Sees all their orders, step-by-step status, and print receipt
```

### Admin — Online Order Management Flow

```
1. Login → /admin/dashboard → Orders tab
2. See all orders, filter by date/status
3. Update status: pending → confirmed → cooked → delivered
   └─ 'cooked' status triggers stock decrement (inventory)
4. Print receipt per order (thermal format)
```

### Admin — POS Flow (walk-in stall)

```
1. Admin → POS tab
2. Click menu items to add to cart
3. Adjust quantities with +/− buttons
4. Select payment: Cash or QRIS
5. "Selesaikan Transaksi" → save as order (source='pos')
6. Print receipt dialog auto-opens → click "Cetak"
7. Cart resets for next customer
```

---

## MVP Scope (Phase 1 — Deploy Ready)

| Feature                                    | Status  |
| ------------------------------------------ | ------- |
| Guest landing page (matches guest.html)    | 🔲 TODO |
| Guest order form (matches guest-form.html) | 🔲 TODO |
| Guest order-history page + receipt print   | 🔲 TODO |
| Admin login (dual role)                    | 🔲 TODO |
| Admin order management table               | 🔲 TODO |
| Admin POS + receipt print                  | 🔲 TODO |

## Phase 2 Backlog

| Feature                                  | Priority |
| ---------------------------------------- | -------- |
| Kitchen Summary + ingredient aggregation | High     |
| Menu item CRUD                           | High     |
| Inventory CRUD + stock decrement         | Medium   |
| Settings panel (QRIS, quota, cutoff)     | Medium   |
| Analytics tab                            | Low      |
| Xendit payment integration               | Backlog  |

---

## Payment Strategy (MVP)

**No payment gateway for MVP.** Two manual methods:

- **COD (bayar langsung):** Customer pays to owner/operator when food is delivered
- **QRIS / Transfer BCA:** Customer transfers to owner's static QRIS or BCA account, confirms via WhatsApp separately

The QRIS image is stored as a URL in `app_settings.qris_url` and displayed on the order confirmation screen when customer selects QRIS.

---

## Order Identity

- Customer orders are identified by their **Indonesian phone number** (e.g. `081234567890`)
- The order-history URL is `/guest/order-history/081234567890`
- Multiple orders under the same phone appear on the same page (most recent first)
- No user registration or login required for customers

---

## Receipt Format

- Printable via browser `window.print()`
- Formatted for **80mm thermal paper** (72mm content width, `@media print` CSS)
- Monospace font (Courier New fallback)
- Works both from customer order-history page AND admin dashboard
- Format: header → items → total → payment info → QR or footer text
- "Cetak Struk" button triggers print for that specific receipt

---

## Design System

**Guest pages:** Neo-Brutalism matching the provided `guest.html` and `guest-form.html` HTML references. Pixel-perfect reproduction of the style is expected.

**Admin pages:** Shadcn/UI component library, styled with giri color tokens. Clean, functional, no brutalism on admin side.

**Shared tokens** (in `globals.css @theme inline`):

```
giriRed: #A90402, giriBlack: #2b2b2b, giriBg: #f4f4f0
giriYellow: #FFDE59, giriBlue: #4ECDC4, giriWhite: #ffffff
shadow-brutal-sm, shadow-brutal, shadow-brutal-lg, shadow-brutal-red, shadow-brutal-yellow
```

---

## Tech Stack Constraints

- **Next.js 16**: Dynamic `params` is `Promise<{...}>` — always `await params`
- **Tailwind v4**: No `tailwind.config.ts`. Tokens in `globals.css @theme inline`
- **Zod v4**: Error key is `error:` not `required_error:`
- **Shadcn**: Admin only. Initialize with `npx shadcn@latest init` before building any admin component
- **Supabase**: All DB operations via `@supabase/supabase-js`. Server actions use service role key. Client-side uses anon key with RLS.
