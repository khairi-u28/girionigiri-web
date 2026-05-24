# Spec 07 — Admin Features

## Authentication

Simple cookie session (no Supabase Auth for MVP).

### Login flow

1. Admin goes to `/admin/login`
2. Enters password → checked against `process.env.ADMIN_PASSWORD` in server action
3. Success → set `admin_token` cookie (httpOnly, 8hr expiry) → redirect to `/admin/dashboard`
4. Middleware checks cookie on all `/admin/*` except `/admin/login`

### `src/app/admin/login/actions.ts`

```typescript
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password === process.env.ADMIN_PASSWORD) {
    (await cookies()).set(
      "admin_token",
      process.env.ADMIN_TOKEN_VALUE ?? "admin",
      {
        httpOnly: true,
        maxAge: 60 * 60 * 8,
        path: "/",
      },
    );
    redirect("/admin/dashboard");
  }
  return { error: "Password salah." };
}
```

### Login page styling (Neo-Brutalism centered card)

```tsx
<div className="min-h-screen bg-giri-bg flex items-center justify-center p-4">
  <div className="w-full max-w-sm bg-giri-white border-4 border-giri-black shadow-brutal-lg p-8">
    <div className="mb-6">
      <span className="text-3xl font-serif font-black text-giri-red">ギリ</span>
      <h1 className="text-2xl font-black uppercase mt-1">Admin Login</h1>
    </div>
    <LoginForm />
  </div>
</div>
```

---

## Admin Shell Layout

### `src/app/admin/layout.tsx`

```tsx
// Server component
// Check cookie — if missing, middleware already redirects, but double-check here
// Render: AdminHeader + sidebar + main content
```

### `AdminShell.tsx` layout

```
┌─────────────────────────────────────────────┐
│ HEADER: bg-giri-black, border-b-4 red        │
│ "Admin — Giri-giri Onigiri"  [Logout btn]    │
├──────────────┬──────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT                 │
│ bg-white     │                              │
│ border-r-4   │                              │
│              │                              │
│ Dashboard    │                              │
│ Menu         │                              │
│ Inventory    │                              │
│ Recipes      │                              │
│ Settings     │                              │
└──────────────┴──────────────────────────────┘
```

Sidebar links styled as yellow bordered buttons matching Neo-Brutalism.

---

## `/admin/dashboard` — Main Operational Page

Three Shadcn `<Tabs>`:

```tsx
<Tabs defaultValue="pos">
  <TabsList className="border-2 border-giri-black rounded-none bg-giri-white">
    <TabsTrigger value="pos" className="rounded-none font-black uppercase ...">
      🧾 POS
    </TabsTrigger>
    <TabsTrigger
      value="dapur"
      className="rounded-none font-black uppercase ..."
    >
      👨‍🍳 Rekap Dapur
    </TabsTrigger>
    <TabsTrigger
      value="pesanan"
      className="rounded-none font-black uppercase ..."
    >
      📋 Pesanan
    </TabsTrigger>
  </TabsList>

  <TabsContent value="pos">
    {" "}
    <POSInterface menuItems={menuItems} />{" "}
  </TabsContent>
  <TabsContent value="dapur">
    {" "}
    <KitchenSummary />{" "}
  </TabsContent>
  <TabsContent value="pesanan">
    {" "}
    <OrderBoard initialOrders={todaysOrders} />{" "}
  </TabsContent>
</Tabs>
```

---

## POS Tab (`POSInterface.tsx`)

### Layout

```
┌────────────────────────────────────────────────┐
│ [Onigiri] [Side Dish] [Drink]  ← category tabs  │
├──────────────────────┬─────────────────────────┤
│ MENU BUTTON GRID     │ CART SIDEBAR            │
│                      │                         │
│ [Tuna Mayo]          │ Tuna Mayo x2   Rp10.000 │
│ [Tempe Teriyaki]     │ Gyoza x1        Rp5.000 │
│ [Ayam Suwir]         │ ─────────────────────── │
│ [Gyoza]              │ Total:         Rp15.000 │
│ [Ocha]               │                         │
│                      │ Nama (opsional): [___]  │
│                      │ HP (opsional):   [___]  │
│                      │                         │
│                      │ [QRIS]  [TUNAI]         │
│                      │                         │
│                      │ [Proses Pesanan →]      │
└──────────────────────┴─────────────────────────┘
```

### Menu button

```tsx
<button
  onClick={() => addToCart(item)}
  className="min-h-20 w-full border-2 border-giri-black bg-giri-white shadow-brutal-sm p-3 text-left
             hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
             active:bg-giri-yellow transition-all"
>
  <p className="font-black uppercase">{item.name}</p>
  <p className="font-bold text-giri-red">{formatRupiah(item.price)}</p>
</button>
```

### Cart item row

```tsx
<div className="flex items-center justify-between border-b border-gray-200 py-2">
  <span className="font-bold text-sm">{item.name}</span>
  <div className="flex items-center gap-2">
    {/* - qty + controls */}
    <div className="flex items-center border border-giri-black">
      <button
        onClick={() => decrement(item.menu_id)}
        className="w-7 h-7 flex items-center justify-center hover:bg-giri-red hover:text-white border-r border-giri-black font-bold"
      >
        −
      </button>
      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
      <button
        onClick={() => increment(item.menu_id)}
        className="w-7 h-7 flex items-center justify-center hover:bg-giri-black hover:text-white border-l border-giri-black font-bold"
      >
        +
      </button>
    </div>
    <span className="font-bold text-sm w-20 text-right">
      {formatRupiah(item.menu_price * item.quantity)}
    </span>
    <button
      onClick={() => removeFromCart(item.menu_id)}
      className="text-gray-400 hover:text-giri-red font-black"
    >
      ×
    </button>
  </div>
</div>
```

### On "Proses Pesanan"

```typescript
const result = await processPosOrder({
  items: cartItems,
  paymentMethod,
  customerName: customerName || "Walk-in",
  phone: phone || "000",
});

if ("error" in result) {
  showError(result.error);
  return;
}

// Open invoice dialog
setInvoiceOrder(result.order);
setInvoiceOpen(true);
```

---

## POS Invoice (`POSInvoice.tsx`)

Shadcn `<Dialog>` that shows a printable invoice.

### Visual layout

```
┌──────────────────────────────────────┐
│          GIRI-GIRI ONIGIRI           │
│          ギリギリ おにぎり           │
│     Cipayung, Jakarta Timur          │
│  ──────────────────────────────────  │
│  Senin, 26 Mei 2026 · 09:15 WIB     │
│  Order #abc123  ·  POS              │
│  ──────────────────────────────────  │
│  Tuna Mayo      x2       Rp10.000   │
│  Tempe Teriyaki x1        Rp5.000   │
│  ──────────────────────────────────  │
│             TOTAL  Rp15.000          │
│  Metode: Tunai / QRIS                │
│  ──────────────────────────────────  │
│          TERIMA KASIH! 🙏            │
│         WA: 0812-xxxx-xxxx          │
└──────────────────────────────────────┘

        [🖨️ Print]    [✓ Selesai]
```

### Print styling

```css
@media print {
  body > * {
    display: none !important;
  }
  #pos-invoice-content {
    display: block !important;
  }
  /* Remove dialog chrome, show only invoice content */
}
```

### After "Selesai" button

```typescript
setInvoiceOpen(false);
clearCart();
setCustomerName("");
setPhone("");
```

---

## Order Board Tab (`OrderBoard.tsx`)

Client component with realtime updates.

```tsx
'use client'
// Props: initialOrders: Order[]

// Shadcn Table
<Table>
  <TableHeader>
    <TableRow className="border-2 border-giri-black bg-giri-yellow">
      <TableHead className="font-black uppercase">ID</TableHead>
      <TableHead className="font-black uppercase">Nama</TableHead>
      <TableHead className="font-black uppercase">Tipe</TableHead>
      <TableHead className="font-black uppercase">Tanggal</TableHead>
      <TableHead className="font-black uppercase">Total</TableHead>
      <TableHead className="font-black uppercase">Bayar</TableHead>
      <TableHead className="font-black uppercase">Status</TableHead>
      <TableHead className="font-black uppercase">Aksi</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {orders.map(order => (
      <TableRow key={order.id} className="border border-giri-black cursor-pointer hover:bg-gray-50"
                onClick={() => openDetail(order)}>
        <TableCell className="font-mono text-sm">#{order.id.slice(-6)}</TableCell>
        <TableCell className="font-bold">{order.customer_name}</TableCell>
        <TableCell>{DELIVERY_LABELS[order.delivery_type]}</TableCell>
        <TableCell>{formatDateShort(order.delivery_date)}</TableCell>
        <TableCell className="font-bold text-giri-red">{formatRupiah(order.total_price)}</TableCell>
        <TableCell><PaymentBadge status={order.payment_status} /></TableCell>
        <TableCell><StatusBadge status={order.order_status} /></TableCell>
        <TableCell onClick={e => e.stopPropagation()}>
          <div className="flex gap-2">
            {order.order_status !== 'delivered' && (
              <button onClick={() => advance(order.id, order.order_status)}
                className="border-2 border-giri-black bg-giri-yellow px-2 py-1 text-xs font-black hover:shadow-brutal-sm transition-all">
                →
              </button>
            )}
            {order.payment_status === 'pending' && (
              <button onClick={() => markPaid(order.id)}
                className="border-2 border-giri-black bg-green-500 text-white px-2 py-1 text-xs font-black hover:shadow-brutal-sm transition-all">
                ✓ Lunas
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Detail Dialog** (on row click): Shadcn `<Dialog>` showing:

- Full order info (customer, phone, delivery type, dept, address, date)
- All order items with quantities, variants, subtotals
- Total
- Payment + order status
- Option to change status and mark paid from the dialog too

**Realtime** for order board:

```typescript
useEffect(() => {
  const channel = supabase
    .channel("admin-orders")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      (payload) => {
        if (payload.eventType === "INSERT")
          setOrders((prev) => [payload.new as Order, ...prev]);
        if (payload.eventType === "UPDATE")
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id ? { ...o, ...(payload.new as Order) } : o,
            ),
          );
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## Kitchen Summary Tab (`KitchenSummary.tsx`)

```tsx
"use client";
// Date state, defaults to today
// Refresh button calls getKitchenSummary(date) server action
// Shows: table of menu_name | variant | quantity | subtotals
// Footer: grand total row
```

---

## Server Actions

### `src/app/admin/dashboard/status-actions.ts`

```typescript
"use server";

const STATUS_ORDER: OrderStatus[] = ["received", "processing", "delivered"];

export async function advanceOrderStatus(
  orderId: string,
  current: OrderStatus,
) {
  const currentIndex = STATUS_ORDER.indexOf(current);
  if (currentIndex === STATUS_ORDER.length - 1)
    return { error: "Status sudah final." };

  const next = STATUS_ORDER[currentIndex + 1];
  const { error } = await supabase
    .from("orders")
    .update({ order_status: next })
    .eq("id", orderId);

  if (error) return { error: "Gagal update status." };
  revalidatePath("/admin/dashboard");
  return { ok: true, newStatus: next };
}

export async function markOrderPaid(orderId: string) {
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("id", orderId);

  if (error) return { error: "Gagal update pembayaran." };
  revalidatePath("/admin/dashboard");
  return { ok: true };
}
```

### `src/app/admin/dashboard/pos-actions.ts`

```typescript
"use server";
export async function processPosOrder(payload: {
  items: { menu_id: string; quantity: number }[];
  paymentMethod: "qris" | "cod";
  customerName: string;
  phone: string;
}): Promise<{ order: OrderWithItems } | { error: string }> {
  // Validate cart
  // Fetch menu prices (always re-fetch from DB, never trust client prices)
  // Calculate total
  // Insert order (source: 'pos', delivery_type: 'pickup', delivery_date: today)
  // Insert order_items
  // Return full OrderWithItems for invoice
}
```

---

## Admin Menu Management (`/admin/menu`)

Shadcn `<Dialog>` for add/edit, plain table for list.

Columns: Image | Name | Category | Price | Active | Highlighted | Actions
Actions: Edit button (opens dialog) + Toggle active switch

Form fields: name, description, price, category (select), is_active, is_highlighted, image_url, sort_order

---

## `StatusBadge.tsx` (shared component)

```tsx
const config: Record<string, { label: string; className: string }> = {
  received: {
    label: "Diterima",
    className: "bg-giri-yellow border-giri-black text-giri-black",
  },
  processing: {
    label: "Dimasak",
    className: "bg-giri-blue  border-giri-black text-giri-black",
  },
  delivered: {
    label: "Terkirim",
    className: "bg-giri-black border-giri-black text-giri-white",
  },
  pending: {
    label: "Belum Bayar",
    className: "bg-gray-200 border-giri-black text-giri-black",
  },
  paid: {
    label: "Lunas",
    className: "bg-green-500  border-giri-black text-white",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = config[status] ?? {
    label: status,
    className: "bg-gray-100 border-gray-400",
  };
  return (
    <span
      className={`border-2 px-2 py-1 text-xs font-black uppercase ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
```
