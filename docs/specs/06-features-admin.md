# Spec 06 — Admin Features

## Authentication

Admin panel uses a simple cookie-based session (no Supabase Auth required for MVP).

**Login flow:**
1. Admin enters password on `/admin/login`
2. Password is checked against `process.env.ADMIN_PASSWORD` (server action)
3. On success: set `admin_token` cookie (httpOnly, 8-hour expiry)
4. Redirect to `/admin/dashboard`
5. Middleware (`src/middleware.ts`) validates cookie on all `/admin/*` routes

**Server Action for login (`src/app/admin/login/actions.ts`):**
```typescript
'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string
  if (password === process.env.ADMIN_PASSWORD) {
    cookies().set('admin_token', process.env.ADMIN_TOKEN_VALUE!, {
      httpOnly: true,
      maxAge: 60 * 60 * 8, // 8 hours
    })
    redirect('/admin/dashboard')
  }
  return { error: 'Password salah' }
}
```

---

## Pages to Build

### 1. `/admin/dashboard` — POS + Kitchen Summary

Two tabs: **POS** and **Kitchen Summary**.

#### Tab 1: POS (Point of Sale)

For recording direct walk-in sales at the Cipayung physical stall.

**UI Layout:**
```
[Menu Item Buttons Grid]       [Order Cart Sidebar]
 ┌──────────┐ ┌──────────┐   ┌────────────────────┐
 │ Tuna Mayo│ │Salmon    │   │ Cart                │
 │  Rp8.000 │ │ Rp9.000  │   │ ─────────────────── │
 └──────────┘ └──────────┘   │ Tuna Mayo x2        │
 ┌──────────┐ ┌──────────┐   │ Salmon x1           │
 │ Ebi Furai│ │Gyoza     │   │ ─────────────────── │
 │  Rp7.000 │ │ Rp5.000  │   │ Total: Rp25.000     │
 └──────────┘ └──────────┘   │                     │
                              │ [QRIS] [TUNAI]      │
                              │ [Proses Pesanan]    │
                              └────────────────────┘
```

**Behavior:**
- Each menu item button is large (min h-24), shows name + price
- Clicking adds 1 unit to cart
- Cart shows item list with quantity controls (+/−) and remove button
- Payment method: QRIS or TUNAI (cash, equivalent to COD)
- "Proses Pesanan" button saves order to Supabase as `delivery_type: 'cipayung_pickup'` with `delivery_date: today`
- After save: show success toast, clear cart, ready for next customer

#### Tab 2: Kitchen Summary (PO Recap)

Aggregated view for morning kitchen preparation.

**UI Layout:**
```
[Date Picker]  [Refresh button]

┌─────────────────────────────────────┐
│ REKAP PESANAN — Senin, 14 Mei 2026  │
│ Total: 23 porsi                     │
├───────────────────┬─────────────────┤
│ Menu              │ Jumlah Porsi    │
├───────────────────┼─────────────────┤
│ Tuna Mayo         │ 8               │
│ Salmon Avocado    │ 5               │
│ Spicy Tuna        │ 4               │
│ Gyoza (side)      │ 6               │
├───────────────────┼─────────────────┤
│ TOTAL             │ 23              │
└───────────────────┴─────────────────┘
```

**Data query:** Aggregate `order_items.quantity` grouped by `menu_name`, filtered by `delivery_date` and excluding cancelled orders.

---

### 2. `/admin/inventory` — Master Inventory

Full CRUD table for `inventory_items`.

**UI:**
- Table with columns: Name, Unit, Stock Qty, Last Updated, Actions
- "Tambah Bahan" button opens a Dialog with the inventory form
- Each row has Edit (pencil icon) and Delete (trash icon) buttons
- Edit opens same Dialog pre-filled
- Delete shows confirmation Dialog before deleting
- Search/filter input above table
- All forms validated with `inventoryItemSchema` from `src/lib/validations.ts`

---

### 3. `/admin/recipes` — Recipe Management

Link menu items to inventory ingredients.

**UI:**
```
[Select Menu Item dropdown]

── When menu item selected ──────────────────────────────
Resep untuk: Tuna Mayo Onigiri
┌──────────────────────┬──────────┬────────┬──────────┐
│ Bahan                │ Satuan   │ Jumlah │ Aksi     │
├──────────────────────┼──────────┼────────┼──────────┤
│ Nori                 │ lembar   │ 1      │ [hapus]  │
│ Beras Jepang         │ gram     │ 120    │ [hapus]  │
│ Tuna Kaleng          │ gram     │ 50     │ [hapus]  │
└──────────────────────┴──────────┴────────┴──────────┘

[+ Tambah Bahan]
```

**"Tambah Bahan" (Add Ingredient):**
- `IngredientCombobox` component: autocomplete searching `inventory_items` by name
- Quantity number input
- On submit: insert to `recipes` table

**IngredientCombobox behavior:**
```typescript
// As user types, search inventory_items:
const { data } = await supabase
  .from('inventory_items')
  .select('id, name, unit')
  .ilike('name', `%${searchTerm}%`)
  .limit(10)
```

---

### 4. `/admin/settings` — Operational Controls

Form for updating `store_settings`. Uses `storeSettingsSchema` from validations.

**Sections:**

**Store Status**
```
[Toggle Switch] Toko Buka / Tutup
Current: BUKA ✓
```

**Cut-off & Quota**
```
Cut-off Time: [21:00]  (time input)
Daily Quota:  [50]     (number input)
```

**Marquee Text**
```
[Text input: current marquee text]
Preview: ────── scrolling text preview ──────
```

**Announcement**
```
[Toggle Switch] Tampilkan Pengumuman
Title: [text input]
Body:  [textarea]
```

**QRIS**
```
QRIS URL: [URL input]
Preview:  [Image preview if URL is valid]
```

**Save button:** Saves all fields at once via single `upsert` on `store_settings` id=1.

---

### 5. `/admin/dashboard` — Order Status Board

Below the POS/Kitchen tabs, show today's orders.

**UI:**
```
┌─────────────────────────────────────────────────────────┐
│ PESANAN HARI INI                                         │
├───────────┬────────────┬──────────┬───────────┬─────────┤
│ ID        │ Nama       │ Tipe     │ Status     │ Aksi   │
├───────────┼────────────┼──────────┼────────────┼────────┤
│ #abc12345 │ Budi S.    │ Auto2000 │ [Received] │ [→]    │
│ #def67890 │ Sari W.    │ Cipayung │ [Cooking]  │ [→]    │
└───────────┴────────────┴──────────┴────────────┴────────┘
```

**Status update:** Clicking the arrow `[→]` button advances order to next status:
```
received → processing → delivered
```

Uses Supabase `update` + `select` to return updated row and refresh table in real-time.
