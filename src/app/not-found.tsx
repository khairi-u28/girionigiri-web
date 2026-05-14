import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-start justify-center px-4">
      <h1 className="font-heading text-4xl font-black text-giri-black">Halaman tidak ditemukan</h1>
      <Link href="/guest" className="mt-4 border-4 border-giri-black bg-giri-red px-4 py-2 font-heading font-bold text-giri-white">
        Kembali ke beranda
      </Link>
    </main>
  );
}
