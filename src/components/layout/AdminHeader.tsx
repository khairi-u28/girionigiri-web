"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

const ownerLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/recipes", label: "Resep" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/menu", label: "Menu" },
];

const operatorLinks = [{ href: "/admin/dashboard", label: "Dashboard" }];

interface AdminHeaderProps {
  role: "owner" | "operator";
  logoutAction: () => Promise<void>;
}

export function AdminHeader({ role, logoutAction }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const links = role === "owner" ? ownerLinks : operatorLinks;

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

        {/* Right side: role badge + logout */}
        <div className="hidden items-center gap-2 lg:flex">
          <span className="border-2 border-giri-black bg-giri-white px-3 py-1 text-xs font-black uppercase tracking-wider text-giri-black">
            {role === "owner" ? "Owner" : "Operator"}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 border-2 border-giri-black bg-giri-yellow px-3 py-1 text-xs font-black uppercase tracking-wider text-giri-black transition-all hover:translate-y-0.5 hover:shadow-none shadow-brutal-sm"
            >
              <LogOut size={13} strokeWidth={3} />
              Logout
            </button>
          </form>
        </div>

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
            {/* Mobile logout */}
            <form action={logoutAction} className="col-span-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 border-2 border-giri-black bg-giri-yellow px-3 py-2 text-sm font-black uppercase text-giri-black"
              >
                <LogOut size={14} strokeWidth={3} />
                Logout
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}
