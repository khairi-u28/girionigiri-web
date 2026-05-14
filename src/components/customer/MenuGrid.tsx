import type { MenuCategory, MenuItem } from "@/types";
import { MenuCard } from "./MenuCard";

interface MenuGridProps {
  items: MenuItem[];
}

const categories: { key: MenuCategory; label: string }[] = [
  { key: "onigiri", label: "Onigiri" },
  { key: "side_dish", label: "Side Dish" },
  { key: "drink", label: "Drink" },
];

export function MenuGrid({ items }: MenuGridProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      {categories.map((category) => {
        const sectionItems = items.filter((item) => item.category === category.key);
        if (!sectionItems.length) return null;

        return (
          <div key={category.key} className="mb-12">
            <div className="mb-6 border-b-4 border-giri-black pb-3">
              <h2 className="font-heading text-3xl font-bold text-giri-black">{category.label}</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sectionItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
