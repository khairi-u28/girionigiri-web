"use client";

import { useMemo, useState } from "react";
import type { InventoryItem } from "@/types";

interface IngredientComboboxProps {
  items: InventoryItem[];
  value: string;
  onChange: (value: string) => void;
}

export function IngredientCombobox({ items, value, onChange }: IngredientComboboxProps) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10),
    [items, search],
  );

  return (
    <div className="space-y-2">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cari bahan..."
        className="w-full border-4 border-giri-black p-2"
      />
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full border-4 border-giri-black p-2">
        <option value="">Pilih bahan</option>
        {filtered.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} {item.unit ? `(${item.unit})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
