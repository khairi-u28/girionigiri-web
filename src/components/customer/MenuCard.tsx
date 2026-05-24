import Image from "next/image";
import type { MenuItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  return (
    <article className="group flex h-full flex-col border-4 border-giri-black bg-giri-white shadow-[4px_4px_0px_0px_#2b2b2b]">
      {item.image_url ? (
        <div className="relative aspect-video overflow-hidden border-b-4 border-giri-black">
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        {item.is_highlighted ? (
          <span className="mb-3 inline-flex w-fit border-2 border-giri-black bg-giri-yellow px-2 py-1 text-xs font-black uppercase text-giri-black shadow-[2px_2px_0px_0px_#2b2b2b]">
            Best Seller
          </span>
        ) : null}
        <h3 className="font-heading text-2xl font-black uppercase leading-tight text-giri-black">{item.name}</h3>
        <p className="mt-2 flex-1 text-sm font-medium text-giri-black">{item.description}</p>
        <div className="mt-5 border-t-4 border-dashed border-giri-black pt-3">
          <p className="font-heading text-2xl font-black tracking-tight text-giri-red">{formatRupiah(item.price)}</p>
        </div>
      </div>
    </article>
  );
}
