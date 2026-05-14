# Spec 05 — Customer Features

## Pages to Build

### 1. `/guest` — Landing Page (`src/app/guest/page.tsx`)

**Sections (top to bottom):**

1. `AnnouncementBanner` — conditional, shown only if `store_settings.announcement_active = true`
2. `MarqueeBanner` — always shown, text from `store_settings.marquee_text`
3. `HeroSection` — brand name, tagline, CTA button linking to `/guest/order`
4. `MenuGrid` — display all active `menu_items`, grouped by category
5. `GuestFooter`

**Data fetching:** This is a Server Component. Fetch `store_settings` and `menu_items` server-side using Supabase directly (no `useEffect`).

---

### 2. `/guest/order` — Order Form (`src/app/guest/order/page.tsx`)

**Behavior:**

- If `store_settings.is_open = false`, show a closed state message. Do not render the form.
- Form is built with `react-hook-form` + the `orderFormSchema` from `src/lib/validations.ts`.
- On successful submit: save order to Supabase, then redirect to a confirmation state showing QRIS/COD instructions and a WhatsApp button.

**Form Fields (in order):**

| Field | Type | Validation | Condition |
|---|---|---|---|
| `customer_name` | Text input | Required, min 2 chars | Always shown |
| `whatsapp_number` | Text input | Required, valid WA format | Always shown |
| `delivery_type` | Select | Required | Always shown |
| `department` | Select (from DEPARTMENTS const) | Required if delivery_type = 'auto2000' | Only if auto2000 selected |
| `delivery_date` | Date picker | Required, min date based on cut-off | Always shown |
| `payment_method` | Radio/Select | Required | Always shown |
| `notes` | Textarea | Optional | Always shown |
| Menu item quantity | Number input per menu item | At least 1 total item | Always shown |

**Conditional `department` field rule:**
```
if (watch('delivery_type') === 'auto2000') {
  show <department> field
} else {
  hide <department> field
  setValue('department', undefined)  // clear value when hidden
}
```

**Post-submit flow:**
```
1. Validate form → Zod schema
2. Check quota for selected date (call useQuotaCheck)
3. If quota exceeded → show error toast, block submit
4. Insert to orders + order_items (see spec 03 transaction pattern)
5. On success:
   - Show PaymentInstructions component (QRIS URL or COD message)
   - Show WhatsAppButton with pre-filled message (see spec 07)
   - Show tracking link: /guest/order-history/{order.id}
```

---

### 3. `/guest/order-history/[uuid]` — Order Tracking

**Behavior:**

- Fetch order by `params.uuid` from Supabase.
- If not found, render `not-found.tsx`.
- Show order details + current status as a visual progress tracker.

**Status Display:**

```
[●]─────[○]─────[○]
Received  Cooking  Delivered    ← when status = 'received'

[●]─────[●]─────[○]
Received  Cooking  Delivered    ← when status = 'processing'

[●]─────[●]─────[●]
Received  Cooking  Delivered    ← when status = 'delivered'
```

- Filled circle `●` = completed step (bg-giri-black)
- Empty circle `○` = pending step (border-4 border-giri-black bg-giri-white)
- Connecting line = `border-t-4 border-giri-black`

**Order summary to display:**
- Order ID (last 8 chars of UUID for brevity)
- Customer name
- Delivery date (formatted in Indonesian: "Senin, 14 Mei 2026")
- Delivery type + department (if auto2000)
- Items list with quantities and prices
- Total price (formatted as Rupiah)
- Payment method + payment status
- Created at timestamp

---

## Components

### `HeroSection.tsx`
```
- Large heading with brand name in Montserrat Black
- "ギリギリ おにぎり" subtitle in Noto Serif JP
- Tagline text
- CTA button → /guest/order (styled as primary red button)
- Background: giri-white with thick black bottom border
```

### `MarqueeBanner.tsx`
Props: `text: string`
```
- Black background, white text
- Continuously scrolling via CSS animation (see marquee pattern in spec 02)
- Bold Montserrat font
- Always rendered, even if text is empty (shows placeholder)
```

### `AnnouncementBanner.tsx`
Props: `title: string, body: string, active: boolean`
```
- Yellow background (giri-yellow), black border bottom (border-b-4 border-giri-black)
- Bold title line + body text below
- Render nothing if active = false
```

### `MenuCard.tsx`
Props: `item: MenuItem`
```
- Card with border-4 border-giri-black shadow-giri
- Image (if image_url exists) at top, 16:9 ratio, object-cover
- Name in font-heading font-bold
- Description in text-sm
- Price formatted as Rupiah in giri-red font-bold text-xl
- "Highlighted" badge (giri-yellow) if is_highlighted = true
```

### `MenuGrid.tsx`
Props: `items: MenuItem[]`
```
- Group items by category
- Show category label as section header (see Section Header pattern in spec 02)
- Render in CSS grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
```

### `DeliveryDatePicker.tsx`
```
- Uses Shadcn Calendar component
- Minimum date calculated from cut-off logic (see spec 07)
- Disabled dates: past dates + dates where quota is full
- Indonesian locale for month/day names
```

### `PaymentInstructions.tsx`
Props: `paymentMethod: 'qris' | 'cod', qrisUrl: string, orderId: string`
```
- QRIS: Display QRIS image (from qris_url), instruction text
- COD: Show "Bayar saat pengiriman" message
- Both: Show order ID, tracking link
```

### `WhatsAppButton.tsx`
Props: `phoneNumber: string, message: string`
```
- Green background (#25D366), white text (exception to color palette — WhatsApp brand color)
- WhatsApp icon from lucide-react (MessageCircle)
- Opens wa.me link in new tab
- Full message pre-filled (see spec 07 for message format)
```

### `OrderTracker.tsx`
Props: `order: OrderWithItems`
```
- Visual step indicator (3 steps: Received, Cooking, Delivered)
- Order details table
- Items list with subtotals
- Total price
- Uses real-time Supabase subscription to update status live:
  supabase.channel('order-status').on('postgres_changes', ...)
```
