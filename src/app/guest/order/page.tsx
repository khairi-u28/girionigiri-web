import { OrderForm } from "@/components/customer/OrderForm";
import { supabase } from "@/lib/supabase";

export default async function OrderPage() {
  const [{ data: settings }, { data: menuItems }] = await Promise.all([
    supabase.from("store_settings").select("*").eq("id", 1).single(),
    supabase.from("menu_items").select("*").eq("is_active", true).order("category"),
  ]);

  if (!settings?.is_open) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="border-4 border-giri-black bg-giri-yellow p-6 shadow-[8px_8px_0px_0px_#2b2b2b]">
          <h1 className="font-heading text-3xl font-bold text-giri-black">Toko sedang tutup</h1>
          <p className="mt-2 text-giri-black">Silakan cek lagi nanti untuk membuat pesanan baru.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-heading text-4xl font-black text-giri-black">Form Pemesanan</h1>
      <OrderForm menuItems={menuItems ?? []} settings={settings} />
    </section>
  );
}
