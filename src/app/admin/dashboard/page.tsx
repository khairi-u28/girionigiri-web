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
    <section className="space-y-8">
      {/* Page header */}
      <div className="border-b-4 border-giri-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-giri-black md:text-4xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-gray-500">
          POS, ringkasan dapur, dan status pesanan real-time
        </p>
      </div>

      {/* POS Section */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="border-4 border-giri-black bg-giri-yellow px-3 py-1 text-sm font-black uppercase">
            POS
          </span>
          <span className="text-sm font-bold text-gray-500">
            Point of Sale — Penjualan Langsung
          </span>
        </div>
        <POSInterface menuItems={menuResult.data ?? []} />
      </div>

      {/* Kitchen Summary */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="border-4 border-giri-black bg-giri-blue px-3 py-1 text-sm font-black uppercase">
            DAPUR
          </span>
          <span className="text-sm font-bold text-gray-500">
            Rekap Pesanan untuk Persiapan
          </span>
        </div>
        <KitchenSummary />
      </div>

      {/* Order Status Board */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="border-4 border-giri-black bg-giri-red px-3 py-1 text-sm font-black uppercase text-giri-white">
            STATUS
          </span>
          <span className="text-sm font-bold text-gray-500">
            Pesanan Hari Ini
          </span>
        </div>
        <OrderStatusBoard orders={ordersResult.data ?? []} />
      </div>
    </section>
  );
}
