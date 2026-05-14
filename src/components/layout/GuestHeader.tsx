import Link from "next/link";

export function GuestHeader() {
  return (
    <header className="border-b-4 border-giri-black bg-giri-white">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/guest" className="font-heading text-2xl font-black text-giri-black">
          Giri-giri Onigiri
        </Link>
        <Link
          href="/guest/order"
          className="border-4 border-giri-black bg-giri-red px-4 py-2 font-heading font-bold text-giri-white shadow-[4px_4px_0px_0px_#2b2b2b] transition-transform duration-100 hover:-translate-x-1 hover:-translate-y-1"
        >
          Pesan Sekarang
        </Link>
      </div>
    </header>
  );
}
