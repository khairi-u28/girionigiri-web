"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { MenuItem } from "@/types";
import { formatRupiah } from "@/lib/utils";
import {
  deleteMenuItem,
  toggleMenuItemActive,
  toggleMenuItemHighlighted,
  upsertMenuItem,
} from "@/app/admin/menu/menu-actions";

interface MenuManagerProps {
  menuItems: MenuItem[];
}

type FeedbackState = {
  type: "success" | "error";
  text: string;
};

const categoryStyles: Record<NonNullable<MenuItem["category"]>, string> = {
  onigiri: "bg-giri-yellow text-giri-black",
  side_dish: "bg-giri-blue text-giri-black",
  drink: "bg-gray-200 text-giri-black",
};

const categoryLabels: Record<NonNullable<MenuItem["category"]>, string> = {
  onigiri: "Onigiri",
  side_dish: "Side Dish",
  drink: "Drink",
};

export function MenuManager({ menuItems }: MenuManagerProps) {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<NonNullable<MenuItem["category"]>>("onigiri");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setItems(menuItems);
  }, [menuItems]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 200);
    return () => window.clearTimeout(timer);
  }, []);

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
    setCategory("onigiri");
    setImageUrl("");
    setIsActive(true);
    setIsHighlighted(false);
  }

  function beginEdit(item: MenuItem) {
    setEditingId(item.id);
    setShowForm(true);
    setName(item.name);
    setDescription(item.description ?? "");
    setPrice(item.price);
    setCategory(item.category ?? "onigiri");
    setImageUrl(item.image_url ?? "");
    setIsActive(item.is_active);
    setIsHighlighted(item.is_highlighted);
  }

  async function handleSave() {
    const result = await upsertMenuItem({
      id: editingId,
      name,
      description,
      price,
      category,
      image_url: imageUrl,
      is_active: isActive,
      is_highlighted: isHighlighted,
    });

    if (!result.ok) {
      setFeedback({ type: "error", text: result.error ?? "Gagal menyimpan menu." });
      return;
    }

    setFeedback({ type: "success", text: editingId ? "Menu berhasil diperbarui." : "Menu berhasil ditambahkan." });
    resetForm();
  }

  async function handleToggleActive(id: string, nextValue: boolean) {
    const result = await toggleMenuItemActive(id, nextValue);

    if (!result.ok) {
      setFeedback({ type: "error", text: result.error ?? "Gagal memperbarui status aktif." });
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              is_active: nextValue,
            }
          : item,
      ),
    );
    setFeedback({ type: "success", text: nextValue ? "Menu diaktifkan." : "Menu dinonaktifkan." });
  }

  async function handleToggleHighlighted(id: string, nextValue: boolean) {
    const result = await toggleMenuItemHighlighted(id, nextValue);

    if (!result.ok) {
      setFeedback({ type: "error", text: result.error ?? "Gagal memperbarui status unggulan." });
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              is_highlighted: nextValue,
            }
          : item,
      ),
    );
    setFeedback({ type: "success", text: nextValue ? "Menu ditandai unggulan." : "Menu dihapus dari unggulan." });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Yakin ingin menghapus menu ini?");
    if (!confirmed) {
      return;
    }

    const result = await deleteMenuItem(id);

    if (!result.ok) {
      setFeedback({ type: "error", text: result.error ?? "Gagal menghapus menu." });
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setFeedback({ type: "success", text: "Menu berhasil dihapus." });
  }

  return (
    <div className="space-y-4">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase text-giri-black">Menu Management</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Kelola item menu untuk halaman pelanggan dan POS
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 border-4 border-giri-black bg-giri-yellow px-4 py-2 font-black uppercase shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Menu
          </button>
        )}
      </div>

      {showForm && (
        <div className="border-4 border-giri-black bg-giri-white p-4 shadow-brutal md:p-6">
          <h3 className="mb-4 text-xl font-black uppercase">
            {editingId ? "✏️ Edit Menu" : "➕ Tambah Menu"}
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                Nama Menu
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                Harga
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NonNullable<MenuItem["category"]>)}
                className="brutal-input w-full border-4 border-giri-black bg-giri-white p-2 font-medium transition-shadow"
              >
                <option value="onigiri">Onigiri</option>
                <option value="side_dish">Side Dish</option>
                <option value="drink">Drink</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-black uppercase text-gray-500">
                URL Gambar
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
              />
            </div>

            <label className="flex items-center gap-2 border-4 border-giri-black bg-giri-bg px-3 py-2 font-bold text-giri-black">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              Aktif
            </label>

            <label className="flex items-center gap-2 border-4 border-giri-black bg-giri-bg px-3 py-2 font-bold text-giri-black">
              <input
                type="checkbox"
                checked={isHighlighted}
                onChange={(e) => setIsHighlighted(e.target.checked)}
                className="h-4 w-4"
              />
              Tandai Unggulan
            </label>

            <div className="flex items-end gap-2 md:col-span-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 border-4 border-giri-black bg-giri-red px-4 py-2 font-black uppercase text-giri-white shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border-4 border-giri-black bg-giri-bg px-4 py-2 font-black uppercase text-giri-black"
              >
                ✕ Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-4 border-giri-black bg-giri-white shadow-brutal-lg">
        <div className="hidden border-b-4 border-giri-black bg-giri-bg p-3 text-xs font-black uppercase tracking-widest text-gray-500 md:grid md:grid-cols-[72px_2fr_1fr_auto_auto_auto_auto]">
          <span>Gambar</span>
          <span>Menu</span>
          <span>Harga</span>
          <span>Aktif</span>
          <span>Unggulan</span>
          <span>Edit</span>
          <span>Hapus</span>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="grid grid-cols-1 gap-3 rounded-sm border-2 border-dashed border-giri-black bg-giri-bg p-3 md:grid-cols-[72px_2fr_1fr_auto_auto_auto_auto] md:items-center"
              >
                <div className="h-12 w-12 animate-pulse rounded-sm border-2 border-giri-black bg-white" />
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-white" />
                  <div className="h-3 w-48 animate-pulse rounded bg-white" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-white" />
                <div className="h-8 w-20 animate-pulse rounded bg-white" />
                <div className="h-8 w-20 animate-pulse rounded bg-white" />
                <div className="h-8 w-8 animate-pulse rounded bg-white" />
                <div className="h-8 w-8 animate-pulse rounded bg-white" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto max-w-md border-4 border-giri-black bg-giri-bg p-6 shadow-brutal-sm">
              <p className="text-3xl">🍙</p>
              <h3 className="mt-3 text-lg font-black uppercase text-giri-black">
                Belum ada menu
              </h3>
              <p className="mt-2 text-sm font-medium text-gray-600">
                Tambahkan menu pertama agar halaman pelanggan dan POS bisa menampilkan item baru.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center justify-center gap-2 border-4 border-giri-black bg-giri-yellow px-4 py-2 font-black uppercase shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                <Plus size={16} strokeWidth={3} />
                Tambah Menu
              </button>
            </div>
          </div>
        ) : (
          items.map((item) => {
            const categoryKey = item.category ?? "onigiri";
            const badgeClass = categoryStyles[categoryKey as keyof typeof categoryStyles] ?? categoryStyles.onigiri;

            return (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-3 border-b-2 border-dashed border-giri-black p-3 md:grid-cols-[72px_2fr_1fr_auto_auto_auto_auto] md:items-center"
              >
                <div className="flex items-center justify-center">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-sm border-2 border-giri-black object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center border-2 border-giri-black bg-giri-yellow text-2xl">
                      🍙
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-black uppercase text-giri-black">{item.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.description || "—"}</p>
                  <span
                    className={`mt-2 inline-flex border-2 border-giri-black px-2 py-1 text-[11px] font-black uppercase ${badgeClass}`}
                  >
                    {categoryLabels[categoryKey as keyof typeof categoryLabels] ?? categoryKey}
                  </span>
                </div>

                <div className="font-bold text-giri-red">{formatRupiah(item.price)}</div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id, !item.is_active)}
                    className={`border-2 border-giri-black px-3 py-1 text-xs font-black uppercase shadow-brutal-sm ${
                      item.is_active
                        ? "bg-giri-yellow text-giri-black"
                        : "bg-giri-bg text-giri-black"
                    }`}
                  >
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleToggleHighlighted(item.id, !item.is_highlighted)}
                    className={`border-2 border-giri-black px-3 py-1 text-xs font-black uppercase shadow-brutal-sm ${
                      item.is_highlighted
                        ? "bg-giri-yellow text-giri-black"
                        : "bg-giri-bg text-giri-black"
                    }`}
                  >
                    ⭐ {item.is_highlighted ? "Ya" : "Tidak"}
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => beginEdit(item)}
                    className="flex h-8 w-8 items-center justify-center border-2 border-giri-black bg-giri-yellow text-giri-black shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  >
                    <Pencil size={12} />
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="flex h-8 w-8 items-center justify-center border-2 border-giri-black bg-giri-red text-giri-white shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
