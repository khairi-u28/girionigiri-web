# Spec 03 — Database (Supabase / PostgreSQL)

## Supabase Client

### `src/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

One instance only. Always import `supabase` from this file. Never call `createClient` elsewhere.

---

## SQL Schema (run in Supabase SQL Editor)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Menu / Product Catalog
CREATE TABLE menu_items (
  id             UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT    NOT NULL,
  description    TEXT,
  price          DECIMAL NOT NULL,
  category       TEXT    NOT NULL DEFAULT 'onigiri',  -- onigiri | side_dish | drink
  is_active      BOOLEAN DEFAULT TRUE,
  is_highlighted BOOLEAN DEFAULT FALSE,
  image_url      TEXT,
  sort_order     INT     DEFAULT 0
);

-- 2. Raw Materials & Packaging
CREATE TABLE inventory_items (
  id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT    NOT NULL UNIQUE,
  unit       TEXT,
  stock_qty  DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recipe (junction: Menu ↔ Inventory)
CREATE TABLE recipes (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id      UUID    REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_id UUID    REFERENCES inventory_items(id),
  qty_needed   DECIMAL
);

-- 4. Customer Orders
--    phone_number is the customer identifier — used to generate the tracking URL
CREATE TABLE orders (
  id               UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name    TEXT    NOT NULL,
  phone_number     TEXT    NOT NULL,             -- e.g. "081234567890" — tracking key
  delivery_type    TEXT    NOT NULL,             -- auto2000 | pickup | external
  department       TEXT,                         -- auto2000 only: dept/division/desk
  delivery_address TEXT,                         -- external delivery only
  delivery_date    DATE    NOT NULL,
  total_price      DECIMAL NOT NULL,
  payment_method   TEXT    NOT NULL,             -- qris | cod
  payment_status   TEXT    DEFAULT 'pending',    -- pending | paid
  order_status     TEXT    DEFAULT 'received',   -- received | processing | delivered
  notes            TEXT,
  source           TEXT    DEFAULT 'online',     -- online | pos
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Order Line Items
CREATE TABLE order_items (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID    REFERENCES orders(id) ON DELETE CASCADE,
  menu_id     UUID    REFERENCES menu_items(id),
  menu_name   TEXT    NOT NULL,    -- snapshot at time of order
  menu_price  DECIMAL NOT NULL,    -- snapshot at time of order
  quantity    INT     NOT NULL DEFAULT 1,
  variant     TEXT                 -- e.g. "Pedas" | "Tidak Pedas" (optional)
);

-- 6. Operational Settings (always exactly 1 row with id=1)
CREATE TABLE store_settings (
  id                   INT     PRIMARY KEY DEFAULT 1,
  is_open              BOOLEAN DEFAULT TRUE,
  cut_off_time         TIME    DEFAULT '21:00',
  daily_quota          INT     DEFAULT 50,
  marquee_text         TEXT    DEFAULT '⚡ PROMO: BELI 3 ONIGIRI GRATIS 1 OCHA DINGIN! ⚡ PO DITUTUP JAM 21:00 WIB',
  announcement_active  BOOLEAN DEFAULT FALSE,
  announcement_title   TEXT    DEFAULT '',
  announcement_body    TEXT    DEFAULT '',
  qris_image_url       TEXT    DEFAULT '',
  whatsapp_number      TEXT    DEFAULT '6281234567890'
);

-- Seed default settings row
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
```

---

## Key Design Decisions

### Phone Number as Tracking Key

- `phone_number` is stored on every order (NOT unique — one customer can have many orders).
- The order tracking URL is `/order-history/[phone]` showing ALL orders for that phone.
- Phone must be normalized before storage: strip `+`, leading `0` → `62`, strip spaces/dashes.
- Example: `081234567890` → stored as `6281234567890`

### Order Source

- `source = 'online'` → placed via guest form
- `source = 'pos'` → placed via admin POS dashboard
- POS orders use `customer_name: 'Walk-in'` and `phone_number: '000'` by default, but admin can fill real details.

### Variants

- `order_items.variant` stores per-item variants like "Pedas" or "Tidak Pedas".
- This is a freeform text field — no separate variants table needed for MVP.

---

## TypeScript Types — `src/types/index.ts` (complete file)

```typescript
export type DeliveryType = "auto2000" | "pickup" | "external";
export type PaymentMethod = "qris" | "cod";
export type PaymentStatus = "pending" | "paid";
export type OrderStatus = "received" | "processing" | "delivered";
export type MenuCategory = "onigiri" | "side_dish" | "drink";
export type OrderSource = "online" | "pos";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: MenuCategory;
  is_active: boolean;
  is_highlighted: boolean;
  image_url: string | null;
  sort_order: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string | null;
  stock_qty: number;
  updated_at: string;
}

export interface Recipe {
  id: string;
  menu_id: string;
  inventory_id: string;
  qty_needed: number | null;
}

export interface StoreSettings {
  id: number;
  is_open: boolean;
  cut_off_time: string; // 'HH:MM'
  daily_quota: number;
  marquee_text: string;
  announcement_active: boolean;
  announcement_title: string;
  announcement_body: string;
  qris_image_url: string;
  whatsapp_number: string;
}

export interface Order {
  id: string;
  customer_name: string;
  phone_number: string; // normalized: '62xxxxxxxxxx'
  delivery_type: DeliveryType;
  department: string | null;
  delivery_address: string | null;
  delivery_date: string; // 'YYYY-MM-DD'
  total_price: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes: string | null;
  source: OrderSource;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  menu_name: string;
  menu_price: number;
  quantity: number;
  variant: string | null;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, "id">;
        Update: Partial<Omit<MenuItem, "id">>;
      };
      inventory_items: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, "id" | "updated_at">;
        Update: Partial<Omit<InventoryItem, "id">>;
      };
      recipes: {
        Row: Recipe;
        Insert: Omit<Recipe, "id">;
        Update: Partial<Omit<Recipe, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at">;
        Update: Partial<Omit<Order, "id">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id">;
        Update: Partial<Omit<OrderItem, "id">>;
      };
      store_settings: {
        Row: StoreSettings;
        Insert: Partial<StoreSettings>;
        Update: Partial<StoreSettings>;
      };
    };
  };
}
```

---

## Common Query Patterns

### Fetch Store Settings (always singleton)

```typescript
const { data: settings } = await supabase
  .from("store_settings")
  .select("*")
  .eq("id", 1)
  .single();
```

### Update Settings (UPSERT — never INSERT)

```typescript
await supabase
  .from("store_settings")
  .upsert({ id: 1, ...updates }, { onConflict: "id" });
```

### Fetch Active Menu Items

```typescript
const { data: menu } = await supabase
  .from("menu_items")
  .select("*")
  .eq("is_active", true)
  .order("sort_order")
  .order("category");
```

### Count Orders for a Date (quota check)

```typescript
const { data } = await supabase
  .from("order_items")
  .select("quantity, orders!inner(delivery_date)")
  .eq("orders.delivery_date", dateStr);

const total = (data ?? []).reduce((sum, item) => sum + item.quantity, 0);
```

### Insert Order + Items (two-step transaction)

```typescript
// Step 1: Insert order
const { data: order, error: orderError } = await supabase
  .from("orders")
  .insert({ ...orderData })
  .select()
  .single();

if (orderError || !order) return { error: "Gagal menyimpan pesanan." };

// Step 2: Insert items
const { error: itemsError } = await supabase
  .from("order_items")
  .insert(items.map((item) => ({ ...item, order_id: order.id })));

if (itemsError) return { error: "Gagal menyimpan item pesanan." };
```

### Fetch Orders by Phone (tracking page)

```typescript
const { data } = await supabase
  .from("orders")
  .select("*, order_items(*)")
  .eq("phone_number", normalizedPhone)
  .order("created_at", { ascending: false });
```

### Kitchen Summary (aggregate for date)

```typescript
const { data } = await supabase
  .from("order_items")
  .select(
    "menu_name, quantity, variant, orders!inner(delivery_date, order_status)",
  )
  .eq("orders.delivery_date", targetDate)
  .neq("orders.order_status", "delivered");
```

---

## RLS Policies (run after table creation)

```sql
-- Enable RLS
ALTER TABLE menu_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes         ENABLE ROW LEVEL SECURITY;

-- Public read: menu and settings
CREATE POLICY "public_read_menu"     ON menu_items     FOR SELECT USING (true);
CREATE POLICY "public_read_settings" ON store_settings FOR SELECT USING (true);

-- Public insert: guest orders
CREATE POLICY "public_insert_orders"      ON orders      FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Public read: orders by phone (for tracking)
CREATE POLICY "public_read_orders"      ON orders      FOR SELECT USING (true);
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT USING (true);

-- Admin-only writes use service_role key (bypasses RLS) — set via server actions only
```
