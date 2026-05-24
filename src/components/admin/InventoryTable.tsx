"use client";

import { useMemo, useState } from "react";
import type { InventoryItem } from "@/types";
import {
  deleteInventoryItem,
  upsertInventoryItem,
} from "@/app/admin/inventory/inventory-actions";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [stockQty, setStockQty] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  function resetForm() {
    setName("");
    setUnit("");
    setStockQty(0);
    setEditingId(null);
    setShowForm(false);
  }

  async function save() {
    const result = await upsertInventoryItem({
      id: editingId,
      name,
      unit,
      stock_qty: stockQty,
    });
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error || "Gagal menyimpan inventory." });
      return;
    }
    setFeedback({ type: "success", text: "Inventory berhasil disimpan." });
    resetForm();
  }

  return (
    <div className="space-y-4">
      {/* Feedback */}
      {feedback && (
        <div
          className={`border-4 p-3 font-bold ${
            feedback.type === "success"
              ? "border-giri-black bg-giri-yellow text-giri-black"
              : "border-giri-red bg-[#ffeded] text-giri-red"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="border-4 border-giri-black bg-giri-white p-4 shadow-brutal md:p-6">
          <h3 className="mb-4 text-xl font-black uppercase">
            {editingId ? "✏️ Edit Bahan" : "➕ Tambah Bahan"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                Nama Bahan
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nori, beras, dst."
                className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                Satuan
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, pcs, liter"
                className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                Stok
              </label>
              <input
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value))}
                type="number"
                className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={save}
                className="flex-1 border-4 border-giri-black bg-giri-red px-4 py-2 font-black uppercase text-giri-white shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Simpan
              </button>
              <button
                onClick={resetForm}
                className="border-4 border-giri-black bg-giri-bg px-3 py-2 font-black uppercase text-giri-black"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search + Add button row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari bahan..."
            className="brutal-input w-full border-4 border-giri-black p-2 pl-10 font-medium transition-shadow"
          />
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 border-4 border-giri-black bg-giri-yellow px-4 py-2 font-black uppercase shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Bahan
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border-4 border-giri-black bg-giri-white shadow-brutal-lg">
        {/* Header row — desktop */}
        <div className="hidden border-b-4 border-giri-black bg-giri-bg p-3 text-xs font-black uppercase tracking-widest text-gray-500 md:grid md:grid-cols-[2fr_1fr_1fr_auto]">
          <span>Nama</span>
          <span>Satuan</span>
          <span>Stok</span>
          <span className="text-right">Aksi</span>
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-gray-400">
            Tidak ada data
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 items-center gap-2 border-b-2 border-dashed border-giri-black p-3 md:grid-cols-[2fr_1fr_1fr_auto]"
            >
              <span className="font-bold">{item.name}</span>
              <span className="text-sm text-gray-600">
                <span className="text-xs font-bold text-gray-400 md:hidden">
                  Satuan:{" "}
                </span>
                {item.unit ?? "—"}
              </span>
              <span className="text-sm">
                <span className="text-xs font-bold text-gray-400 md:hidden">
                  Stok:{" "}
                </span>
                <span className="inline-block border-2 border-giri-black bg-giri-yellow px-2 py-0.5 text-xs font-black">
                  {item.stock_qty}
                </span>
              </span>
              <div className="flex gap-2 md:justify-end">
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setName(item.name);
                    setUnit(item.unit ?? "");
                    setStockQty(item.stock_qty);
                    setShowForm(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center border-2 border-giri-black bg-giri-yellow text-giri-black shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={async () => {
                    const result = await deleteInventoryItem(item.id);
                    if (!result.ok)
                      setFeedback({ type: "error", text: result.error || "Gagal menghapus inventory." });
                    else
                      setFeedback({
                        type: "success",
                        text: "Bahan berhasil dihapus.",
                      });
                  }}
                  className="flex h-8 w-8 items-center justify-center border-2 border-giri-black bg-giri-red text-giri-white shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
