import Image from "next/image";
import type { MenuItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  return (
    <article className="border-4 border-giri-black bg-giri-white p-4 shadow-[8px_8px_0px_0px_#2b2b2b]">
      {item.image_url ? (
        <div className="relative mb-3 aspect-video border-4 border-giri-black">
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        </div>
      ) : null}
      <h3 className="font-heading text-2xl font-bold text-giri-black">{item.name}</h3>
      <p className="mt-2 text-sm text-giri-black">{item.description}</p>
      <p className="mt-3 font-heading text-xl font-bold text-giri-red">{formatRupiah(item.price)}</p>
      {item.is_highlighted ? (
        <span className="mt-3 inline-flex border-2 border-giri-black bg-giri-yellow px-2 py-1 text-sm font-bold uppercase text-giri-black">
          Highlighted
        </span>
      ) : null}
    </article>
  );
}
