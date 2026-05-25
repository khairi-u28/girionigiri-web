import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { OrderWithItems } from "@/types";
import { OrderTracker } from "@/components/customer/OrderTracker";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function OrderHistoryPage({ params }: PageProps) {
  const { uuid } = await params;

  let order: OrderWithItems | null = null;

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", uuid)
      .single();

    if (error || !data) {
      notFound();
    }

    order = data as OrderWithItems;
  } catch {
    notFound();
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">
      <OrderTracker order={order} />
      <div className="mt-6 text-center">
        <Link
          href="/guest/order"
          className="inline-flex items-center justify-center border-4 border-giri-black bg-giri-yellow px-6 py-3 text-sm font-black uppercase text-giri-black shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm"
        >
          Pesan Lagi
        </Link>
      </div>
    </div>
  );
}
