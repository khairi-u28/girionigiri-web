"use client";

import { useState } from "react";
import type { StoreSettings } from "@/types";
import { saveStoreSettings } from "@/app/admin/settings/settings-actions";
import { Save } from "lucide-react";

interface SettingsPanelProps {
  initialSettings: StoreSettings | null;
}

export function SettingsPanel({ initialSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState<StoreSettings>(
    initialSettings ?? {
      id: 1,
      is_open: true,
      cut_off_time: "21:00",
      daily_quota: 50,
      marquee_text: "🍙 Onigiri segar setiap hari!",
      announcement_active: false,
      announcement_title: "",
      announcement_body: "",
      qris_url: "",
    }
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function update<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
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

      {/* ── Store Status ── */}
      <div className="border-4 border-giri-black bg-giri-white shadow-brutal">
        <div className="border-b-4 border-giri-black bg-giri-bg p-4">
          <h3 className="text-lg font-black uppercase tracking-tight">
            Status Toko
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => update("is_open", !settings.is_open)}
              className={`toggle-switch ${settings.is_open ? "active" : ""}`}
              aria-label="Toggle toko buka/tutup"
            />
            <div>
              <p className="font-black uppercase">
                {settings.is_open ? "BUKA ✓" : "TUTUP ✕"}
              </p>
              <p className="text-xs text-gray-500">
                {settings.is_open
                  ? "Pelanggan dapat memesan"
                  : "Form PO tidak bisa diakses"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cut-off & Quota ── */}
      <div className="border-4 border-giri-black bg-giri-white shadow-brutal">
        <div className="border-b-4 border-giri-black bg-giri-bg p-4">
          <h3 className="text-lg font-black uppercase tracking-tight">
            Cut-off &amp; Kuota
          </h3>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-black uppercase text-gray-500">
              Cut-off Time (WIB)
            </label>
            <input
              type="time"
              value={settings.cut_off_time}
              onChange={(e) => update("cut_off_time", e.target.value)}
              className="brutal-input w-full border-4 border-giri-black p-2 font-bold transition-shadow"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-black uppercase text-gray-500">
              Kuota Harian (porsi)
            </label>
            <input
              type="number"
              value={settings.daily_quota}
              onChange={(e) => update("daily_quota", Number(e.target.value))}
              className="brutal-input w-full border-4 border-giri-black p-2 font-bold transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* ── Marquee Text ── */}
      <div className="border-4 border-giri-black bg-giri-white shadow-brutal">
        <div className="border-b-4 border-giri-black bg-giri-bg p-4">
          <h3 className="text-lg font-black uppercase tracking-tight">
            Marquee Text
          </h3>
        </div>
        <div className="p-4">
          <input
            value={settings.marquee_text}
            onChange={(e) => update("marquee_text", e.target.value)}
            className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
            placeholder="Teks promo berjalan..."
          />
          {/* Preview */}
          <div className="mt-3 overflow-hidden border-2 border-dashed border-giri-black bg-giri-yellow p-2">
            <p className="truncate text-sm font-bold">
              Preview: {settings.marquee_text}
            </p>
          </div>
        </div>
      </div>

      {/* ── Announcement ── */}
      <div className="border-4 border-giri-black bg-giri-white shadow-brutal">
        <div className="border-b-4 border-giri-black bg-giri-bg p-4">
          <h3 className="text-lg font-black uppercase tracking-tight">
            Pengumuman
          </h3>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                update("announcement_active", !settings.announcement_active)
              }
              className={`toggle-switch ${settings.announcement_active ? "active" : ""}`}
              aria-label="Toggle pengumuman"
            />
            <span className="text-sm font-bold uppercase">
              {settings.announcement_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <input
            value={settings.announcement_title}
            onChange={(e) => update("announcement_title", e.target.value)}
            className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
            placeholder="Judul pengumuman"
          />
          <textarea
            value={settings.announcement_body}
            onChange={(e) => update("announcement_body", e.target.value)}
            className="brutal-input w-full resize-none border-4 border-giri-black p-2 font-medium transition-shadow"
            placeholder="Isi pengumuman"
            rows={3}
          />
        </div>
      </div>

      {/* ── QRIS ── */}
      <div className="border-4 border-giri-black bg-giri-white shadow-brutal">
        <div className="border-b-4 border-giri-black bg-giri-bg p-4">
          <h3 className="text-lg font-black uppercase tracking-tight">QRIS</h3>
        </div>
        <div className="p-4">
          <input
            value={settings.qris_url}
            onChange={(e) => update("qris_url", e.target.value)}
            className="brutal-input w-full border-4 border-giri-black p-2 font-medium transition-shadow"
            placeholder="URL gambar QRIS..."
          />
          {settings.qris_url && (
            <div className="mt-3 border-2 border-dashed border-giri-black p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.qris_url}
                alt="QRIS Preview"
                className="mx-auto h-40 w-40 object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={async () => {
          const result = await saveStoreSettings(settings);
          if (!result.ok)
            setFeedback({ type: "error", text: result.error || "Gagal menyimpan settings." });
          else
            setFeedback({
              type: "success",
              text: "✅ Settings berhasil disimpan.",
            });
        }}
        className="flex w-full items-center justify-center gap-2 border-4 border-giri-black bg-giri-red px-6 py-4 text-lg font-black uppercase text-giri-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm sm:w-auto"
      >
        <Save size={18} strokeWidth={3} />
        Simpan Settings
      </button>
    </div>
  );
}
