import Image from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface MenuGridProps {
  items: MenuItem[];
}

/* ── Fallback images when DB image_url is null ── */
const onigiriFallbacks = [
  "https://images.unsplash.com/photo-1558985250-27a406d64cb3?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1628108428131-0ea9de6408db?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600&h=400",
];

function getFallbackImage(
  category: string | null,
  featured = false,
  index = 0
): string {
  if (featured)
    return "https://images.unsplash.com/photo-1544681280-d2dc2e17eaaf?auto=format&fit=crop&q=80&w=800&h=800";
  if (category === "drink")
    return "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=300&h=300";
  if (category === "side_dish")
    return "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=300&h=300";
  return onigiriFallbacks[index % onigiriFallbacks.length];
}

const badgeLabels = ["Best Seller", "Budget Meal", "Comfort Food", "Menu Harian"];

export function MenuGrid({ items }: MenuGridProps) {
  const onigiri = items.filter((item) => item.category === "onigiri");
  const extras = items.filter(
    (item) => item.category === "side_dish" || item.category === "drink"
  );
  const featured =
    onigiri.find((item) => item.is_highlighted) ?? onigiri[0] ?? items[0] ?? null;
  const mainMenu = onigiri.filter((item) => item.id !== featured?.id);

  return (
    <>
      {/* ════════════════════════════════════════════════
          SECTION: Featured / New Release
         ════════════════════════════════════════════════ */}
      {featured ? (
        <section
          id="menu-baru"
          className="border-y-4 border-giri-black bg-giri-black py-16 text-giri-white"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-12 md:flex-row">
              {/* Text */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex rotate-1 items-center gap-2 border-2 border-giri-black bg-giri-blue px-3 py-1 text-sm font-black uppercase text-giri-black shadow-brutal-sm">
                  <span>✨ RILIS MINGGU INI</span>
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
                  {featured.name}
                </h2>
                <p className="text-lg font-medium text-gray-300">
                  {featured.description ??
                    "Varian terbaru dengan cita rasa istimewa."}
                </p>
                <p className="text-3xl font-black tracking-tighter text-giri-yellow">
                  {formatRupiah(featured.price)}
                </p>
              </div>

              {/* Image frame */}
              <div className="flex flex-1 justify-center">
                <div className="-rotate-3 border-4 border-giri-white bg-giri-white p-2 shadow-brutal-blue">
                  <div className="aspect-square w-full max-w-sm overflow-hidden border-2 border-giri-black bg-gray-200">
                    <Image
                      src={
                        featured.image_url ??
                        getFallbackImage(featured.category, true)
                      }
                      alt={featured.name}
                      width={800}
                      height={800}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ════════════════════════════════════════════════
          SECTION: Main Menu Grid
         ════════════════════════════════════════════════ */}
      <section id="menu-utama" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-end justify-between gap-4 border-b-4 border-giri-black pb-4 sm:flex-row">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Sang Juara Bertahan
            </h2>
            <p className="mt-2 text-sm font-medium uppercase tracking-widest text-gray-600">
              Pilihan andalan buat sarapan harian
            </p>
          </div>
          <div className="font-serif-jp text-6xl text-gray-300 select-none">
            定番
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {(mainMenu.length ? mainMenu : onigiri).map((item, index) => {
            const bgColors = [
              "bg-giri-yellow",
              "bg-giri-black text-giri-white",
              "bg-giri-white",
            ];
            return (
              <article
                key={item.id}
                className="group flex h-full flex-col border-4 border-giri-black bg-giri-white shadow-brutal"
              >
                {/* Card image */}
                <div className="relative h-48 overflow-hidden border-b-4 border-giri-black">
                  <Image
                    src={
                      item.image_url ??
                      getFallbackImage(item.category, false, index)
                    }
                    alt={item.name}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-giri-red/10 transition-colors group-hover:bg-transparent" />
                </div>
                {/* Card body */}
                <div className="flex flex-1 flex-col p-6">
                  <div
                    className={`mb-3 inline-block self-start border-2 border-giri-black px-2 py-1 text-xs font-black uppercase shadow-brutal-sm ${bgColors[index % bgColors.length]}`}
                  >
                    {item.is_highlighted
                      ? "Best Seller"
                      : badgeLabels[index % badgeLabels.length]}
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-tight mb-2">
                    {item.name}
                  </h3>
                  <p className="mb-6 flex-grow text-sm font-medium text-gray-600">
                    {item.description}
                  </p>
                  <div className="mt-auto border-t-4 border-dashed border-giri-black pt-4">
                    <span className="text-2xl font-black tracking-tighter text-giri-red">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SECTION: Extras (Side Dishes & Drinks)
         ════════════════════════════════════════════════ */}
      {extras.length ? (
        <section id="ekstra" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 border-b-4 border-giri-black pb-4">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              Teman Makan
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {extras.map((item) => {
              const isDrink = item.category === "drink";
              return (
                <div
                  key={item.id}
                  className={`relative flex items-center gap-6 overflow-hidden border-4 border-giri-black p-6 shadow-brutal transition-transform ${
                    isDrink
                      ? "bg-giri-blue hover:rotate-1"
                      : "bg-giri-yellow hover:-rotate-1"
                  }`}
                >
                  {/* Background image decoration */}
                  <Image
                    src={item.image_url ?? getFallbackImage(item.category)}
                    alt={item.name}
                    width={300}
                    height={300}
                    className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full object-cover opacity-30 mix-blend-multiply"
                  />
                  {/* Emoji icon */}
                  <div className="relative z-10 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-giri-black bg-giri-white text-4xl shadow-brutal-sm">
                    {isDrink ? "🍵" : "🍮"}
                  </div>
                  {/* Info */}
                  <div className="relative z-10">
                    <h4 className="mb-1 text-xl font-black uppercase">
                      {item.name}
                    </h4>
                    <p className="mb-2 text-sm font-medium">{item.description}</p>
                    <span className="border-2 border-giri-black bg-giri-white px-2 py-1 text-xl font-black">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ════════════════════════════════════════════════
          SECTION: Order CTA
         ════════════════════════════════════════════════ */}
      <section
        id="order-cta"
        className="mx-auto mt-20 max-w-4xl px-4 sm:px-6 lg:px-8"
      >
        <div className="relative overflow-hidden border-4 border-giri-black bg-giri-white p-8 text-center shadow-brutal-lg md:p-16">
          {/* Decorative arrow */}
          <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 text-giri-red">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>

          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-black uppercase tracking-tight leading-tight md:text-5xl">
              Udah Laper Liat Menu?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-gray-600">
              Jangan sampai kehabisan jatah sarapan besok. Amankan pesananmu
              sekarang sebelum kuota harian habis. PO ditutup jam 20:00 WIB!
            </p>
            <div className="flex flex-col items-center justify-center">
              <Link
                href="/guest/order"
                className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden border-4 border-giri-black bg-giri-red px-10 py-5 text-2xl font-black uppercase text-giri-white shadow-brutal-lg transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-brutal-sm md:w-auto"
              >
                <span className="relative z-10">ISI FORM PO SEKARANG</span>
                <span className="relative z-10 transition-transform group-hover:translate-x-2">
                  →
                </span>
                {/* Hover sweep effect */}
                <div className="absolute inset-0 h-full w-0 bg-giri-black opacity-20 transition-all duration-[250ms] ease-out group-hover:w-full" />
              </Link>

              <p className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500">
                <span className="h-2 w-2 rounded-full border border-gray-400 bg-green-500 animate-pulse-dot" />
                Sistem PO Otomatis Aktif
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
