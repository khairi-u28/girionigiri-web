"use client";

import { useState } from "react";
import type { StoreSettings } from "@/types";
import { saveStoreSettings } from "@/app/admin/settings/settings-actions";

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
    },
  );
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  return (
    <div className="space-y-4 border-4 border-giri-black bg-giri-white p-6 shadow-[8px_8px_0px_0px_#2b2b2b]">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={settings.is_open} onChange={(event) => setSettings((prev) => ({ ...prev, is_open: event.target.checked }))} />
        <span className="font-heading font-bold">Toko Buka</span>
      </label>
      <input value={settings.cut_off_time} onChange={(event) => setSettings((prev) => ({ ...prev, cut_off_time: event.target.value }))} type="time" className="w-full border-4 border-giri-black p-2" />
      <input value={settings.daily_quota} onChange={(event) => setSettings((prev) => ({ ...prev, daily_quota: Number(event.target.value) }))} type="number" className="w-full border-4 border-giri-black p-2" />
      <input value={settings.marquee_text} onChange={(event) => setSettings((prev) => ({ ...prev, marquee_text: event.target.value }))} className="w-full border-4 border-giri-black p-2" />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.announcement_active}
          onChange={(event) => setSettings((prev) => ({ ...prev, announcement_active: event.target.checked }))}
        />
        <span className="font-heading font-bold">Tampilkan Pengumuman</span>
      </label>
      <input value={settings.announcement_title} onChange={(event) => setSettings((prev) => ({ ...prev, announcement_title: event.target.value }))} className="w-full border-4 border-giri-black p-2" placeholder="Judul pengumuman" />
      <textarea value={settings.announcement_body} onChange={(event) => setSettings((prev) => ({ ...prev, announcement_body: event.target.value }))} className="w-full border-4 border-giri-black p-2" placeholder="Isi pengumuman" />
      <input value={settings.qris_url} onChange={(event) => setSettings((prev) => ({ ...prev, qris_url: event.target.value }))} className="w-full border-4 border-giri-black p-2" placeholder="QRIS URL" />
      <button
        onClick={async () => {
          const result = await saveStoreSettings(settings);
          if (!result.ok) setFeedback({ type: "error", text: result.error });
          else setFeedback({ type: "success", text: "Settings berhasil disimpan." });
        }}
        className="border-4 border-giri-black bg-giri-red px-5 py-3 font-heading font-bold text-giri-white"
      >
        Simpan Settings
      </button>
      {feedback ? (
        <p className={`border-4 p-3 font-heading font-bold ${feedback.type === "success" ? "border-giri-black bg-giri-yellow text-giri-black" : "border-giri-red bg-giri-white text-giri-red"}`}>
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
