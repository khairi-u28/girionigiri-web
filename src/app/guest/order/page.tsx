import { OrderForm } from "@/components/customer/OrderForm";
import { supabase } from "@/lib/supabase";

export default async function OrderPage() {
  const [{ data: settings }, { data: menuItems }] = await Promise.all([
    supabase.from("store_settings").select("*").eq("id", 1).single(),
    supabase.from("menu_items").select("*").eq("is_active", true).order("category"),
  ]);

  if (!settings?.is_open) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-20">
        <div className="border-4 border-giri-black bg-giri-yellow p-8 shadow-brutal text-center">
          <div className="mb-4 text-6xl">🍙</div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-giri-black md:text-4xl">
            Toko Sedang Tutup
          </h1>
          <p className="mt-4 font-bold text-giri-black/80">
            Maaf, kami sedang tidak menerima pesanan saat ini. <br/>
            Silakan cek kembali nanti atau ikuti Instagram kami untuk update jadwal PO!
          </p>
          <div className="mt-8">
            <a 
              href="/guest" 
              className="inline-block border-4 border-giri-black bg-giri-black px-6 py-3 font-black uppercase text-giri-white shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
      <div className="mb-8 border-b-4 border-giri-black pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
          Checkout PO
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-gray-600">
          Isi data di bawah untuk pengiriman esok hari.
        </p>
      </div>

      <OrderForm menuItems={menuItems ?? []} settings={settings} />
    </section>
  );
}
