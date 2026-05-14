import { POSInterface } from "@/components/admin/POSInterface";
import { KitchenSummary } from "@/components/admin/KitchenSummary";
import { OrderStatusBoard } from "@/components/admin/OrderStatusBoard";
import { supabase } from "@/lib/supabase";

export default async function AdminDashboardPage() {
  const [menuResult, ordersResult] = await Promise.all([
    supabase.from("menu_items").select("*").eq("is_active", true).order("category"),
    supabase
      .from("orders")
      .select("*")
      .gte("delivery_date", new Date().toISOString().slice(0, 10))
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <section className="space-y-6">
      <h1 className="font-heading text-4xl font-black text-giri-black">Dashboard</h1>
      <POSInterface menuItems={menuResult.data ?? []} />
      <KitchenSummary />
      <OrderStatusBoard orders={ordersResult.data ?? []} />
    </section>
  );
}
