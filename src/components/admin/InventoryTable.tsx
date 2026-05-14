"use client";

import { useMemo, useState } from "react";
import type { InventoryItem } from "@/types";
import { deleteInventoryItem, upsertInventoryItem } from "@/app/admin/inventory/inventory-actions";

interface InventoryTableProps {
  items: InventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [stockQty, setStockQty] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  async function save() {
    const result = await upsertInventoryItem({ id: editingId, name, unit, stock_qty: stockQty });
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }
    setFeedback({ type: "success", text: "Inventory berhasil disimpan." });
    setName("");
    setUnit("");
    setStockQty(0);
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <p className={`border-4 p-3 font-heading font-bold ${feedback.type === "success" ? "border-giri-black bg-giri-yellow text-giri-black" : "border-giri-red bg-giri-white text-giri-red"}`}>
          {feedback.text}
        </p>
      ) : null}
      <div className="border-4 border-giri-black bg-giri-white p-4 shadow-[8px_8px_0px_0px_#2b2b2b]">
        <h2 className="mb-3 font-heading text-2xl font-bold">{editingId ? "Edit Bahan" : "Tambah Bahan"}</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama bahan" className="border-4 border-giri-black p-2" />
          <input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="Unit" className="border-4 border-giri-black p-2" />
          <input value={stockQty} onChange={(event) => setStockQty(Number(event.target.value))} type="number" className="border-4 border-giri-black p-2" />
          <button onClick={save} className="border-4 border-giri-black bg-giri-red px-4 py-2 font-heading font-bold text-giri-white">
            Simpan
          </button>
        </div>
      </div>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari bahan..." className="w-full border-4 border-giri-black p-2" />
      <div className="border-4 border-giri-black bg-giri-white p-4 shadow-[8px_8px_0px_0px_#2b2b2b]">
        {filtered.map((item) => (
          <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-2 border-b-2 border-giri-black py-2">
            <span>{item.name}</span>
            <span>{item.unit}</span>
            <span>{item.stock_qty}</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setName(item.name);
                  setUnit(item.unit ?? "");
                  setStockQty(item.stock_qty);
                }}
                className="border-2 border-giri-black bg-giri-yellow px-2"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  const result = await deleteInventoryItem(item.id);
                  if (!result.ok) setFeedback({ type: "error", text: result.error });
                  else setFeedback({ type: "success", text: "Inventory berhasil dihapus." });
                }}
                className="border-2 border-giri-black bg-giri-red px-2 text-giri-white"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
