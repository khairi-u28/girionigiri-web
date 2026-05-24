# Spec 06 — Guest Features

> All customer pages must match the `guest.html` and `guest-form.html` design references.
> These are not suggestions — they are the target output.

---

## `/guest` — Landing Page

**Server Component.** Fetch all data here, pass as props.

```typescript
// src/app/guest/page.tsx
const [settingsResult, menuResult] = await Promise.all([
  supabase.from("store_settings").select("*").eq("id", 1).single(),
  supabase
    .from("menu_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order"),
]);
```

**Component tree (top to bottom)**:

```
AnnouncementBanner   ← conditional on announcement_active
MarqueeBanner        ← always shown
Navbar               ← sticky, shows PO open/closed status
HeroSection          ← red card with kanji decoration
MenuSection          ← all active menu items by category
OrderCTA             ← persuasion section with big CTA button
GuestFooter          ← black with red border-top
```

---

## `/guest/order` — Order Form

**Page is a Server Component** — fetches settings and menu, checks `is_open`.

If `is_open === false`:

```html
<div
  class="bg-giri-yellow border-4 border-giri-black shadow-brutal p-8 text-center"
>
  <h1 class="text-4xl font-black uppercase">Toko Sedang Tutup</h1>
  <p class="mt-4 font-bold text-gray-600">
    Silakan kembali lagi besok sebelum jam 21:00 WIB.
  </p>
</div>
```

If open: render `<OrderForm menuItems={...} settings={...} />`.

### `OrderForm.tsx` (Client Component)

This is the main customer form. Uses `react-hook-form` + `zodResolver(orderFormSchema)`.

**State managed locally**:

- `quantities: Record<string, number>` — qty per menu_id
- `submitting: boolean`
- `submittedOrder: OrderWithItems | null` — set after successful submit

**Form layout** (3 numbered sections + sticky total bar):

#### Section 1 — Pilih Menu

```tsx
<section className="bg-giri-white border-4 border-giri-black shadow-brutal p-6 md:p-8 relative">
  {/* Yellow numbered badge */}
  <div
    className="absolute -top-4 -left-4 bg-giri-yellow border-2 border-giri-black
                  px-4 py-1 font-black text-xl shadow-brutal-sm -rotate-3"
  >
    1
  </div>
  <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-dashed border-gray-300 pb-2">
    Pilih Menu
  </h2>
  <div className="space-y-6">
    {menuItems.map((item) => (
      <MenuItemRow
        key={item.id}
        item={item}
        quantity={quantities[item.id] ?? 0}
        onIncrement={() => setQty(item.id, +1)}
        onDecrement={() => setQty(item.id, -1)}
      />
    ))}
  </div>
</section>
```

`MenuItemRow.tsx` (matches guest-form.html item rows exactly):

```tsx
<div
  className="flex flex-col sm:flex-row justify-between items-start sm:items-center
                gap-4 bg-gray-50 border-2 border-giri-black p-4"
>
  <div>
    <h3 className="font-black text-lg uppercase">{item.name}</h3>
    <p className="font-bold text-giri-red">{formatRupiah(item.price)}</p>
    {item.description && (
      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
    )}
  </div>
  {/* Quantity stepper — from design spec */}
  <div className="flex items-center border-2 border-giri-black bg-giri-white h-10 shadow-brutal-sm">
    <button
      type="button"
      onClick={onDecrement}
      className="w-10 h-full flex items-center justify-center
                 hover:bg-giri-red hover:text-giri-white
                 font-black text-xl border-r-2 border-giri-black transition-colors"
    >
      −
    </button>
    <span className="w-12 h-full flex items-center justify-center font-bold">
      {quantity}
    </span>
    <button
      type="button"
      onClick={onIncrement}
      className="w-10 h-full flex items-center justify-center
                 hover:bg-giri-black hover:text-giri-white
                 font-black text-xl border-l-2 border-giri-black transition-colors"
    >
      +
    </button>
  </div>
</div>
```

#### Section 2 — Info Pengiriman

```tsx
<section className="bg-giri-white border-4 border-giri-black shadow-brutal p-6 md:p-8 relative">
  <div className="absolute -top-4 -left-4 bg-giri-yellow ...">2</div>
  <h2>Info Pengiriman</h2>

  {/* customer_name */}
  <div>
    <label className="font-black uppercase text-sm mb-2 block">
      Nama <span className="text-giri-red">*</span>
    </label>
    <input {...register('customer_name')}
      className="w-full bg-giri-white border-2 border-giri-black p-3 font-medium
                 focus:outline-none focus:shadow-brutal-sm transition-shadow" />
    {errors.customer_name && <p className="text-giri-red text-xs mt-1">{errors.customer_name.message}</p>}
  </div>

  {/* phone_number */}
  <div>
    <label>No. HP / WhatsApp <span>*</span></label>
    <input {...register('phone_number')} type="tel" placeholder="081234567890" ... />
    <p className="text-xs text-gray-500 mt-1">Digunakan untuk melacak status pesananmu.</p>
  </div>

  {/* delivery_type — radio cards */}
  <div>
    <label>Tipe Pengiriman <span>*</span></label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Radio card for each delivery type */}
      <label className="cursor-pointer">
        <input type="radio" value="auto2000" {...register('delivery_type')} className="peer sr-only brutal-radio">
        <div className="border-2 border-giri-black bg-gray-50 p-4 font-bold uppercase
                        peer-checked:bg-giri-red peer-checked:text-giri-white
                        hover:-translate-y-1 hover:shadow-brutal transition-all text-center">
          🏢 Kantor (Auto2000)
        </div>
      </label>
      {/* pickup + external cards similarly */}
    </div>
  </div>

  {/* department — only when auto2000 */}
  {watchDeliveryType === 'auto2000' && (
    <div>
      <label>Departemen / Divisi <span>*</span></label>
      <select {...register('department')} className="w-full border-2 border-giri-black p-3 bg-giri-white">
        <option value="">Pilih departemen...</option>
        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  )}

  {/* delivery_address — only when external */}
  {watchDeliveryType === 'external' && (
    <div>
      <label>Alamat Lengkap (Area Cipayung) <span>*</span></label>
      <textarea {...register('delivery_address')} rows={3}
        placeholder="Masukkan alamat lengkap dengan RT/RW dan patokan..."
        className="w-full bg-giri-white border-2 border-giri-black p-3 resize-none ..." />
    </div>
  )}

  {/* delivery_date */}
  <div>
    <label>Tanggal Pengiriman <span>*</span></label>
    <input type="date" {...register('delivery_date', { valueAsDate: true })}
      min={minDateStr}
      className="bg-giri-white border-2 border-giri-black p-3 font-bold uppercase
                 focus:outline-none focus:shadow-brutal-sm transition-shadow" />
    <p className="text-xs font-bold text-giri-red mt-2 uppercase tracking-widest">
      * Minimal H+1. Setelah jam {settings.cut_off_time} WIB, minimal H+2.
    </p>
  </div>

  {/* notes */}
  <div>
    <label>Catatan (Opsional)</label>
    <textarea {...register('notes')} rows={2} ... />
  </div>
</section>
```

#### Section 3 — Metode Pembayaran

```tsx
<section className="bg-giri-white border-4 border-giri-black shadow-brutal p-6 md:p-8 relative">
  <div className="absolute -top-4 -left-4 bg-giri-yellow ...">3</div>
  <h2>Metode Pembayaran</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <label className="cursor-pointer">
      <input type="radio" value="cod" {...register('payment_method')} className="peer sr-only brutal-radio" defaultChecked>
      <div className="border-2 border-giri-black bg-gray-50 p-4 font-bold uppercase
                      peer-checked:bg-giri-red peer-checked:text-giri-white
                      hover:-translate-y-1 hover:shadow-brutal transition-all h-full">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💵</span>
          <span className="text-lg">Bayar Langsung</span>
        </div>
        <p className="text-xs font-medium normal-case peer-checked:text-white">
          Bayar ke Khairi / Adik saat makanan diantar.
        </p>
      </div>
    </label>
    {/* QRIS card similarly */}
  </div>
</section>
```

#### Sticky Total Bar

Always visible at bottom of viewport:

```tsx
<StickyTotalBar
  total={total}
  isSubmitting={formState.isSubmitting}
  onSubmit={handleSubmit(onSubmit)}
  error={submitError}
/>
```

#### Post-Submit Confirmation

After successful submit, replace the form with:

```tsx
<div className="space-y-6">
  {/* Success card */}
  <div className="bg-giri-yellow border-4 border-giri-black shadow-brutal p-6">
    <h2 className="text-2xl font-black uppercase">✅ Pesanan Diterima!</h2>
    <p className="mt-2">ID Pesanan: #{order.id.slice(-6)}</p>
  </div>

  {/* Payment instructions */}
  <PaymentInstructions
    paymentMethod={order.payment_method}
    qrisImageUrl={settings.qris_image_url}
    orderId={order.id}
  />

  {/* WA button */}
  <WhatsAppButton phoneNumber={settings.whatsapp_number} message={waMessage} />

  {/* Tracking link */}
  <p className="text-center font-bold">
    Lacak pesananmu:{" "}
    <a
      href={`/guest/order-history/${normalizePhone(order.phone_number)}`}
      className="text-giri-red underline"
    >
      Klik di sini
    </a>
  </p>
</div>
```

---

## `/guest/order-history/[phone]` — Tracking Page

```typescript
// page.tsx — Server Component
const { phone } = await params
const { data: orders } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .eq('phone_number', phone)
  .order('created_at', { ascending: false })

if (!orders || orders.length === 0) {
  return <NoOrdersFound phone={phone} />
}
```

**`OrderTracker` component** (client, for realtime):

```tsx
"use client";
// Props: initialOrders: OrderWithItems[], phone: string
// Sets up Supabase realtime channel for this phone
// Renders each order as a card with step indicator
```

**Step Indicator** (for each order):

```tsx
function StepIndicator({ status }: { status: OrderStatus }) {
  const steps = [
    { key: "received", label: "Diterima" },
    { key: "processing", label: "Dimasak" },
    { key: "delivered", label: "Terkirim" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center w-full my-4">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 border-2 border-giri-black flex items-center justify-center font-black text-sm
              ${i <= currentIndex ? "bg-giri-black text-giri-white" : "bg-giri-white text-giri-black"}`}
            >
              {i <= currentIndex ? "✓" : i + 1}
            </div>
            <span className="text-xs font-black uppercase">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 border-t-2 mx-2
              ${i < currentIndex ? "border-giri-black" : "border-gray-300"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
```

**Realtime setup**:

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`orders-phone-${phone}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `phone_number=eq.${phone}`,
      },
      (payload) => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === payload.new.id ? { ...o, ...payload.new } : o,
          ),
        );
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [phone]);
```

---

## `PaymentInstructions.tsx`

```tsx
interface PaymentInstructionsProps {
  paymentMethod: "qris" | "cod";
  qrisImageUrl: string;
  orderId: string;
}

// QRIS: show image if qris_image_url is set, else show URL as link
// COD: show "Bayar langsung saat pesanan diantar"
// Both: show order ID + tracking link
```

## `WhatsAppButton.tsx`

```tsx
// Green (#25D366) button — exception to palette, WhatsApp brand color
// Opens wa.me link in new tab
// Message formatted via formatWhatsAppMessage() from whatsapp.ts
```
