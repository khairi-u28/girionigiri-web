import Link from "next/link";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/recipes", label: "Recipes" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  return (
    <aside className="h-fit border-4 border-giri-black bg-giri-white p-3 shadow-[8px_8px_0px_0px_#2b2b2b]">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border-4 border-giri-black bg-giri-yellow px-3 py-2 font-heading font-bold text-giri-black"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
