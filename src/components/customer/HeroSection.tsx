import Link from "next/link";

export function HeroSection() {
  return (
    <section className="border-b-4 border-giri-black bg-giri-white py-10">
      <div className="mx-auto w-full max-w-4xl px-4">
        <p className="font-serif-jp text-lg text-giri-black">ギリギリ おにぎり</p>
        <h1 className="mt-2 font-heading text-4xl font-black text-giri-black">Giri-giri Onigiri</h1>
        <p className="mt-3 max-w-2xl text-giri-black">
          Onigiri segar dengan rasa Jepang yang dibuat setiap hari untuk pre-order kantor dan pickup.
        </p>
        <Link
          href="/guest/order"
          className="mt-6 inline-flex border-4 border-giri-black bg-giri-red px-5 py-3 font-heading font-bold uppercase text-giri-white shadow-[8px_8px_0px_0px_#2b2b2b] transition-transform duration-100 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-2 active:translate-y-2 active:shadow-none"
        >
          Mulai Pesan
        </Link>
      </div>
    </section>
  );
}
