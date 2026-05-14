# Spec 03 — Database (Supabase / PostgreSQL)

## Supabase Client Setup

### `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/index'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

**Rules:**
- Only one instance. Always import `supabase` from this file.
- The generic `<Database>` type enables full TypeScript inference on all queries.

---

## SQL Schema (Run in Supabase SQL Editor)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Raw Materials & Packaging
CREATE TABLE inventory_items (
  id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT    NOT NULL UNIQUE,
  unit       TEXT,                         -- kg, pcs, liter, lembar
  stock_qty  DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Menu / Product Catalog
CREATE TABLE menu_items (
  id             UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT    NOT NULL,
  description    TEXT,
  price          DECIMAL NOT NULL,
  category       TEXT,                     -- onigiri | side_dish | drink
  is_active      BOOLEAN DEFAULT TRUE,
  is_highlighted BOOLEAN DEFAULT FALSE,
  image_url      TEXT
);

-- 3. Recipe (Junction: Menu ↔ Inventory)
CREATE TABLE recipes (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id      UUID    REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_id UUID    REFERENCES inventory_items(id),
  qty_needed   DECIMAL                     -- usage per portion
);

-- 4. Customer Orders
CREATE TABLE orders (
  id               UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name    TEXT    NOT NULL,
  delivery_type    TEXT    NOT NULL,       -- auto2000 | cipayung_pickup | external
  department       TEXT,                   -- only for auto2000
  delivery_date    DATE    NOT NULL,
  total_price      DECIMAL NOT NULL,
  payment_method   TEXT    NOT NULL,       -- qris | cod
  payment_status   TEXT    DEFAULT 'pending',   -- pending | paid
  order_status     TEXT    DEFAULT 'received',  -- received | processing | delivered
  whatsapp_number  TEXT    NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Order Line Items
CREATE TABLE order_items (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID    REFERENCES orders(id) ON DELETE CASCADE,
  menu_id     UUID    REFERENCES menu_items(id),
  menu_name   TEXT    NOT NULL,            -- snapshot at time of order
  menu_price  DECIMAL NOT NULL,            -- snapshot at time of order
  quantity    INT     NOT NULL DEFAULT 1
);

-- 6. Operational Settings (Singleton: always id = 1)
CREATE TABLE store_settings (
  id                   INT     PRIMARY KEY DEFAULT 1,
  is_open              BOOLEAN DEFAULT TRUE,
  cut_off_time         TIME    DEFAULT '21:00',
  daily_quota          INT     DEFAULT 50,
  marquee_text         TEXT    DEFAULT '🍙 Onigiri segar setiap hari!',
  announcement_active  BOOLEAN DEFAULT FALSE,
  announcement_title   TEXT    DEFAULT '',
  announcement_body    TEXT    DEFAULT '',
  qris_url             TEXT    DEFAULT ''
);

-- Seed default settings
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
```

---

## TypeScript Types

### `src/types/index.ts` (Complete File)

```typescript
// ─── Enums ────────────────────────────────────────────────────────────────────

export type DeliveryType = 'auto2000' | 'cipayung_pickup' | 'external'
export type PaymentMethod = 'qris' | 'cod'
export type PaymentStatus = 'pending' | 'paid'
export type OrderStatus = 'received' | 'processing' | 'delivered'
export type MenuCategory = 'onigiri' | 'side_dish' | 'drink'

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface InventoryItem {
  id: string
  name: string
  unit: string | null
  stock_qty: number
  updated_at: string
}

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: MenuCategory | null
  is_active: boolean
  is_highlighted: boolean
  image_url: string | null
}

export interface Recipe {
  id: string
  menu_id: string
  inventory_id: string
  qty_needed: number | null
}

export interface Order {
  id: string
  customer_name: string
  delivery_type: DeliveryType
  department: string | null
  delivery_date: string        // ISO date string: 'YYYY-MM-DD'
  total_price: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  whatsapp_number: string
  notes: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_id: string
  menu_name: string
  menu_price: number
  quantity: number
}

export interface StoreSettings {
  id: number
  is_open: boolean
  cut_off_time: string         // 'HH:MM' format
  daily_quota: number
  marquee_text: string
  announcement_active: boolean
  announcement_title: string
  announcement_body: string
  qris_url: string
}

// ─── Composite Types ──────────────────────────────────────────────────────────

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface MenuItemWithRecipes extends MenuItem {
  recipes: (Recipe & { inventory_items: InventoryItem })[]
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface OrderFormValues {
  customer_name: string
  whatsapp_number: string
  delivery_type: DeliveryType
  department?: string
  delivery_date: Date
  payment_method: PaymentMethod
  notes?: string
  items: {
    menu_id: string
    quantity: number
  }[]
}

// ─── Supabase Database Generic ────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      inventory_items: { Row: InventoryItem; Insert: Omit<InventoryItem, 'id' | 'updated_at'>; Update: Partial<Omit<InventoryItem, 'id'>> }
      menu_items:      { Row: MenuItem;       Insert: Omit<MenuItem, 'id'>;                    Update: Partial<Omit<MenuItem, 'id'>> }
      recipes:         { Row: Recipe;         Insert: Omit<Recipe, 'id'>;                      Update: Partial<Omit<Recipe, 'id'>> }
      orders:          { Row: Order;          Insert: Omit<Order, 'id' | 'created_at'>;        Update: Partial<Omit<Order, 'id'>> }
      order_items:     { Row: OrderItem;      Insert: Omit<OrderItem, 'id'>;                   Update: Partial<Omit<OrderItem, 'id'>> }
      store_settings:  { Row: StoreSettings;  Insert: Partial<StoreSettings>;                  Update: Partial<StoreSettings> }
    }
  }
}
```

---

## Common Query Patterns

### Fetch Store Settings
```typescript
const { data, error } = await supabase
  .from('store_settings')
  .select('*')
  .eq('id', 1)
  .single()
```

### Update Store Settings (always UPSERT, never INSERT)
```typescript
const { error } = await supabase
  .from('store_settings')
  .upsert({ id: 1, ...updates })
```

### Fetch Active Menu Items
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .select('*')
  .eq('is_active', true)
  .order('category')
```

### Count Orders for a Date (Quota Check)
```typescript
const { count, error } = await supabase
  .from('order_items')
  .select('quantity.sum()', { count: 'exact' })
  .eq('orders.delivery_date', deliveryDate)
```

### Fetch Order with Items (for tracking page)
```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (*)
  `)
  .eq('id', orderId)
  .single()
```

### Insert New Order (Transaction Pattern)
```typescript
// Step 1: Insert order
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({ ...orderData })
  .select()
  .single()

if (orderError || !order) throw orderError

// Step 2: Insert order items
const { error: itemsError } = await supabase
  .from('order_items')
  .insert(items.map(item => ({ ...item, order_id: order.id })))

if (itemsError) throw itemsError
```

### PO Summary for Kitchen (aggregate by delivery date)
```typescript
const { data, error } = await supabase
  .from('order_items')
  .select(`
    menu_name,
    quantity,
    orders!inner(delivery_date, order_status)
  `)
  .eq('orders.delivery_date', targetDate)
  .neq('orders.order_status', 'delivered')
```

---

## Row Level Security (RLS) Setup

Run after creating tables:

```sql
-- Enable RLS on all tables
ALTER TABLE inventory_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings    ENABLE ROW LEVEL SECURITY;

-- Public can read menu_items and store_settings
CREATE POLICY "menu_items_public_read" ON menu_items FOR SELECT USING (true);
CREATE POLICY "store_settings_public_read" ON store_settings FOR SELECT USING (true);

-- Public can insert orders and order_items (guest checkout)
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_public_insert" ON order_items FOR INSERT WITH CHECK (true);

-- Public can read own order by UUID (private tracking link)
CREATE POLICY "orders_public_read_own" ON orders FOR SELECT USING (true);
CREATE POLICY "order_items_public_read" ON order_items FOR SELECT USING (true);

-- Admin-only operations handled via service_role key (server-side only)
```
