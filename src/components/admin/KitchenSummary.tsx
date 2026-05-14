"use client";

import { useState } from "react";
import { formatDateIndonesian } from "@/lib/utils";
import { getKitchenSummary } from "@/app/admin/dashboard/summary-actions";

interface SummaryRow {
  menu_name: string;
  quantity: number;
}

export function KitchenSummary() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<SummaryRow[]>([]);

  async function refresh() {
    const data = await getKitchenSummary(date);
    setRows(data);
  }

  const total = rows.reduce((sum, row) => sum + row.quantity, 0);

  return (
    <div className="border-4 border-giri-black bg-giri-white p-4 shadow-[8px_8px_0px_0px_#2b2b2b]">
      <div className="mb-4 flex gap-2">
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="border-4 border-giri-black p-2" />
        <button onClick={refresh} className="border-4 border-giri-black bg-giri-yellow px-4 py-2 font-heading font-bold">Refresh</button>
      </div>
      <h2 className="font-heading text-2xl font-bold">Rekap Pesanan — {formatDateIndonesian(date)}</h2>
      <p className="mb-3">Total: {total} porsi</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.menu_name} className="flex justify-between border-b-2 border-giri-black py-1">
            <span>{row.menu_name}</span>
            <span>{row.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
