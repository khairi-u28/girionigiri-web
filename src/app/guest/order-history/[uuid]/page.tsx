import { notFound } from "next/navigation";
import { formatDateIndonesian, formatRupiah } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default async function OrderHistoryPage(props: PageProps<"/guest/order-history/[uuid]">) {
  const { uuid } = await props.params;
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", uuid)
    .single();

  if (error || !data) notFound();

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-giri-black">Status Pesanan</h1>
      <p className="mt-2 text-giri-black">ID: #{data.id.slice(-8)}</p>
      <p className="text-giri-black">Tanggal: {formatDateIndonesian(data.delivery_date)}</p>
      <div className="mt-6 border-4 border-giri-black bg-giri-white p-4 shadow-[8px_8px_0px_0px_#2b2b2b]">
        {data.order_items.map((item) => (
          <div key={item.id} className="flex justify-between border-b-2 border-giri-black py-2 text-giri-black">
            <span>
              {item.menu_name} x{item.quantity}
            </span>
            <span>{formatRupiah(item.menu_price * item.quantity)}</span>
          </div>
        ))}
        <p className="mt-3 font-heading text-xl font-bold text-giri-red">Total: {formatRupiah(data.total_price)}</p>
      </div>
    </section>
  );
}
