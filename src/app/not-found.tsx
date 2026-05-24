import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-giri-bg px-4">
      <div className="w-full max-w-md border-4 border-giri-black bg-giri-white p-8 text-center shadow-brutal-lg">
        <div className="mb-4 font-serif-jp text-6xl font-black text-giri-red">
          404
        </div>
        <h1 className="mb-2 text-3xl font-black uppercase tracking-tight">
          Halaman tidak ditemukan
        </h1>
        <p className="mb-6 font-medium text-gray-600">
          Yah, kayaknya kamu salah jalan. Balik ke menu utama yuk!
        </p>
        <Link
          href="/guest"
          className="inline-block border-4 border-giri-black bg-giri-red px-6 py-3 font-black uppercase text-giri-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm"
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
