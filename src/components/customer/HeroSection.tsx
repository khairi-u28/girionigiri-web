import Image from "next/image";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:pt-12 lg:px-8">
      <div className="relative flex flex-col items-center gap-8 overflow-hidden border-4 border-giri-black bg-giri-red p-6 text-giri-white shadow-brutal-lg md:flex-row md:p-12">
        {/* Decorative BG kanji */}
        <div className="pointer-events-none absolute -right-10 -top-10 z-0 font-serif-jp text-[15rem] font-black text-red-900 opacity-50 select-none">
          ギリ
        </div>

        {/* Text content */}
        <div className="relative z-10 flex-1 space-y-6">
          <div className="mb-2 inline-block -rotate-2 border-2 border-giri-black bg-giri-yellow px-3 py-1 text-xs font-black uppercase tracking-widest text-giri-black shadow-brutal-sm">
            SARAPAN ANAK KANTORAN
          </div>
          <h1
            className="text-5xl font-black uppercase leading-[1.1] tracking-tight md:text-7xl"
            style={{ textShadow: "4px 4px 0px #2b2b2b" }}
          >
            GANJEL PERUT <br />
            TANPA RIBET.
          </h1>
          <p className="max-w-lg border-l-4 border-giri-white pl-4 text-lg font-medium md:text-xl">
            Onigiri fusion dengan isian kearifan lokal. Solusi sarapan sat-set
            buat kamu yang sibuk ngejar deadline pagi.
          </p>
          <div className="pt-4">
            <a
              href="#menu-utama"
              className="inline-block border-4 border-giri-black bg-giri-white px-8 py-4 text-xl font-black uppercase text-giri-black shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm"
            >
              Lihat Menu
            </a>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative z-10 mt-8 flex w-full flex-1 justify-center md:mt-0">
          <div className="flex h-64 w-64 rotate-6 items-center justify-center overflow-hidden border-4 border-giri-black bg-giri-white shadow-brutal transition-transform duration-300 hover:rotate-0 md:h-80 md:w-80">
            <Image
              src="https://images.unsplash.com/photo-1628108427958-380d1e57c6b7?auto=format&fit=crop&q=80&w=800&h=800"
              alt="Onigiri Premium"
              width={800}
              height={800}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
