"use client";

import { useState } from "react";
import { formatDateIndonesian } from "@/lib/utils";
import { getKitchenSummary } from "@/app/admin/dashboard/summary-actions";
import { RefreshCw } from "lucide-react";

interface SummaryRow {
  menu_name: string;
  quantity: number;
}

export function KitchenSummary() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const data = await getKitchenSummary(date);
    setRows(data);
    setLoading(false);
  }

  const total = rows.reduce((sum, row) => sum + row.quantity, 0);

  return (
    <div className="border-4 border-giri-black bg-giri-white shadow-brutal-lg">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b-4 border-giri-black bg-giri-bg p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="brutal-input border-4 border-giri-black bg-giri-white p-2 font-bold transition-shadow"
          />
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 border-4 border-giri-black bg-giri-yellow px-4 py-2 font-black uppercase shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              strokeWidth={3}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
        {total > 0 && (
          <span className="border-4 border-giri-black bg-giri-red px-4 py-1 text-sm font-black uppercase text-giri-white">
            Total: {total} porsi
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="mb-4 text-xl font-black uppercase tracking-tight">
          Rekap Pesanan — {formatDateIndonesian(date)}
        </h2>

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-gray-400">
            Klik &ldquo;Refresh&rdquo; untuk memuat data
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-giri-black">
                  <th className="py-2 text-left text-sm font-black uppercase tracking-wider">
                    Menu
                  </th>
                  <th className="py-2 text-right text-sm font-black uppercase tracking-wider">
                    Jumlah Porsi
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.menu_name}
                    className="border-b-2 border-dashed border-giri-black"
                  >
                    <td className="py-3 font-medium">{row.menu_name}</td>
                    <td className="py-3 text-right">
                      <span className="inline-block min-w-[40px] border-2 border-giri-black bg-giri-yellow px-2 py-0.5 text-center text-sm font-black">
                        {row.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-4 border-giri-black">
                  <td className="py-3 text-lg font-black uppercase">Total</td>
                  <td className="py-3 text-right text-lg font-black text-giri-red">
                    {total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
