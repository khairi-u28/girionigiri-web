"use client";

import { useMemo, useState } from "react";
import type { InventoryItem } from "@/types";

interface IngredientComboboxProps {
  items: InventoryItem[];
  value: string;
  onChange: (id: string) => void;
}

export function IngredientCombobox({
  items,
  value,
  onChange,
}: IngredientComboboxProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((item) => item.id === value);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-black uppercase text-gray-500">
        Bahan
      </label>
      <input
        type="text"
        value={open ? search : selectedItem?.name ?? ""}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Cari bahan..."
        className="brutal-input w-full border-4 border-giri-black bg-giri-white p-2 font-medium transition-shadow"
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 max-h-48 overflow-y-auto border-4 border-t-0 border-giri-black bg-giri-white shadow-brutal-sm">
          {filtered.slice(0, 10).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
                setSearch("");
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-giri-yellow"
            >
              <span className="font-bold">{item.name}</span>
              {item.unit && (
                <span className="ml-2 text-xs text-gray-500">
                  ({item.unit})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          tabIndex={-1}
        />
      )}
    </div>
  );
}
