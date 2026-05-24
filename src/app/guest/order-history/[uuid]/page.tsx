import { notFound } from "next/navigation";
import { formatDateIndonesian, formatRupiah } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { OrderWithItems } from "@/types";
import { PaymentInstructions } from "@/components/customer/PaymentInstructions";
import { WhatsAppButton } from "@/components/customer/WhatsAppButton";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function OrderHistoryPage({ params }: PageProps) {
  const { uuid } = await params;
  
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", uuid)
    .single();

  if (error || !data) notFound();

  const order = data as OrderWithItems;

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">
      <div className="mb-8 border-4 border-giri-black bg-giri-white p-6 shadow-brutal md:p-8">
        <div className="flex flex-col gap-4 border-b-4 border-giri-black pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-giri-black md:text-4xl">
              Status Pesanan
            </h1>
            <p className="mt-1 font-bold text-giri-red">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`border-2 border-giri-black px-3 py-1 text-xs font-black uppercase ${
              order.order_status === "received" ? "bg-giri-yellow" :
              order.order_status === "processing" ? "bg-giri-blue" : "bg-giri-black text-giri-white"
            }`}>
              {order.order_status}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-500">
            <span>Pelanggan</span>
            <span className="text-giri-black">{order.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-500">
            <span>Tanggal Kirim</span>
            <span className="text-giri-black">{formatDateIndonesian(order.delivery_date)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-500">
            <span>Metode Bayar</span>
            <span className="text-giri-black uppercase">{order.payment_method}</span>
          </div>
        </div>

        <div className="mt-8 border-t-4 border-dashed border-giri-black pt-6">
          <h2 className="mb-4 text-xl font-black uppercase">Item Pesanan</h2>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between border-b-2 border-gray-100 pb-2 last:border-0">
                <div className="flex flex-col">
                  <span className="font-bold">{item.menu_name}</span>
                  <span className="text-xs font-bold text-gray-500">
                    {formatRupiah(item.menu_price)} x {item.quantity}
                  </span>
                </div>
                <span className="font-bold">{formatRupiah(item.menu_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t-4 border-giri-black pt-4">
            <span className="text-lg font-black uppercase">Total Akhir</span>
            <span className="text-2xl font-black text-giri-red">{formatRupiah(order.total_price)}</span>
          </div>
        </div>
      </div>

      {order.payment_status === "pending" && (
        <div className="mt-8">
          <h2 className="mb-4 text-center text-xl font-black uppercase">Instruksi Pembayaran</h2>
          <PaymentInstructions 
            paymentMethod={order.payment_method}
            qrisUrl="" // Will be fetched from settings if needed, or passed if stored
            orderId={order.id}
          />
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">Ada kendala? Hubungi kami</p>
        <WhatsAppButton 
          phoneNumber="6281234567890" // Should be dynamic
          message={`Halo Giri-giri, saya ingin bertanya tentang pesanan #${order.id.slice(-8)}`}
        />
      </div>
    </section>
  );
}
