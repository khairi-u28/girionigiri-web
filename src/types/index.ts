export type DeliveryType = "auto2000" | "cipayung_pickup" | "external";
export type PaymentMethod = "qris" | "cod";
export type PaymentStatus = "pending" | "paid";
export type OrderStatus = "received" | "processing" | "delivered";
export type MenuCategory = "onigiri" | "side_dish" | "drink";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: MenuCategory | null;
  is_active: boolean;
  is_highlighted: boolean;
  image_url: string | null;
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
  cut_off_time: string;
  daily_quota: number;
  marquee_text: string;
  announcement_active: boolean;
  announcement_title: string;
  announcement_body: string;
  qris_url: string;
}

export interface Order {
  id: string;
  customer_name: string;
  delivery_type: DeliveryType;
  department: string | null;
  delivery_date: string;
  total_price: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  whatsapp_number: string;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  menu_name: string;
  menu_price: number;
  quantity: number;
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
      store_settings: {
        Row: StoreSettings;
        Insert: Partial<StoreSettings>;
        Update: Partial<StoreSettings>;
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
    };
  };
}
