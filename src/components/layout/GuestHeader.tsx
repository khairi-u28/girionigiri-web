"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarqueeBanner } from "../customer/MarqueeBanner";

interface GuestHeaderProps {
  marqueeText?: string;
}

export function GuestHeader({ marqueeText }: GuestHeaderProps) {
  const pathname = usePathname();
  const isOrderPage = pathname === "/guest/order";
  const isLandingPage = pathname === "/guest";

  /* ── Simplified header for the order form page ── */
  if (isOrderPage) {
    return (
      <nav className="sticky top-0 z-50 border-b-4 border-giri-black bg-giri-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link
            href="/guest"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="text-xl font-black uppercase tracking-tighter">
              ← Kembali
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-serif-jp text-xl font-black text-giri-red">
              ギリ
            </span>
            <span className="hidden text-lg font-black uppercase tracking-tighter sm:inline-block">
              Giri-Giri
            </span>
          </div>
        </div>
      </nav>
    );
  }

  /* ── Full navbar for the landing page ── */
  return (
    <>
      {isLandingPage && <MarqueeBanner text={marqueeText || ""} />}
      <nav className="sticky top-0 z-50 border-b-4 border-giri-black bg-giri-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="font-serif-jp text-2xl font-black text-giri-red">
              ギリ
            </span>
            <span className="text-xl font-black uppercase tracking-tighter">
              Giri-Giri
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 text-sm font-bold uppercase tracking-wider md:flex">
            <a
              href="#menu-utama"
              className="transition-colors hover:text-giri-red"
            >
              Menu Utama
            </a>
            <a
              href="#menu-baru"
              className="transition-colors hover:text-giri-red"
            >
              Baru!
            </a>
            <a href="#ekstra" className="transition-colors hover:text-giri-red">
              Ekstra
            </a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* PO Status badge */}
            <div className="hidden items-center gap-2 border-2 border-giri-black bg-[#ffeded] px-3 py-1 text-xs font-bold uppercase shadow-brutal-sm sm:flex">
              <span className="h-2 w-2 rounded-full border border-giri-black bg-giri-red animate-pulse-dot" />
              PO BUKA
            </div>
            {/* CTA button */}
            <Link
              href="/guest/order"
              className="border-2 border-giri-black bg-giri-black px-4 py-2 text-sm font-black uppercase tracking-wider text-giri-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm"
            >
              PO Sini
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
