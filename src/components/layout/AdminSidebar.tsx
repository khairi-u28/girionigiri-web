"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ChefHat,
  Settings,
  UtensilsCrossed,
} from "lucide-react";

const ownerLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/recipes", label: "Resep", icon: ChefHat },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
];

const operatorLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

interface AdminSidebarProps {
  role: "owner" | "operator";
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const links = role === "owner" ? ownerLinks : operatorLinks;

  return (
    <aside className="hidden h-fit border-4 border-giri-black bg-giri-white p-3 shadow-brutal md:block">
      <nav className="grid gap-2">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 border-2 border-giri-black px-3 py-2.5 text-sm font-black uppercase tracking-wider transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${
                isActive
                  ? "bg-giri-red text-giri-white shadow-brutal-sm"
                  : "bg-giri-yellow text-giri-black shadow-brutal-sm"
              }`}
            >
              <Icon size={16} strokeWidth={3} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
