"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function AdminHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/recipes", label: "Resep" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <header className="border-b-4 border-giri-black bg-giri-red">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-serif-jp text-2xl font-black text-giri-white">
            ギリ
          </span>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-giri-white md:text-xl">
              Admin Panel
            </h1>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-2 border-giri-black px-3 py-1.5 text-sm font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-brutal-sm ${
                  isActive
                    ? "bg-giri-white text-giri-black shadow-brutal-sm"
                    : "bg-giri-red text-giri-white hover:bg-giri-white hover:text-giri-black"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Badge */}
        <span className="hidden border-2 border-giri-black bg-giri-white px-3 py-1 text-xs font-black uppercase tracking-wider text-giri-black lg:inline-block">
          Giri-giri Onigiri
        </span>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="border-2 border-giri-black bg-giri-white p-2 text-giri-black md:hidden"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <nav className="border-t-2 border-giri-black bg-giri-red px-4 pb-4 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`border-2 border-giri-black px-3 py-2 text-center text-sm font-black uppercase ${
                    isActive
                      ? "bg-giri-white text-giri-black"
                      : "bg-giri-yellow text-giri-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
