"use client";

import { usePathname } from "next/navigation";

export function GuestFooter() {
  const pathname = usePathname();

  // No footer on order form page — the sticky total bar takes its place
  if (pathname === "/guest/order") return null;

  return (
    <footer className="mt-auto border-t-8 border-giri-red bg-giri-black py-10 text-giri-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 text-center sm:px-6 md:grid-cols-3 md:text-left lg:px-8">
        {/* Brand */}
        <div>
          <span className="font-serif-jp text-3xl font-black text-giri-white">
            ギリ
          </span>
          <br />
          <span className="text-xl font-black uppercase tracking-widest">
            Giri-Giri Onigiri
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm font-medium uppercase tracking-wider text-gray-400">
          <p>📍 Cipayung, Jakarta Timur</p>
          <p>⏰ Pengiriman Pagi: 06:00 WIB</p>
        </div>

        {/* Credits */}
        <div className="text-sm font-black uppercase tracking-widest text-gray-500 md:text-right">
          &copy; {new Date().getFullYear()} Crafted by Khairi
          <br />
          <span className="text-xs font-medium">
            Sistem PO Khusus Rekan Kantor
          </span>
        </div>
      </div>
    </footer>
  );
}
