import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, parseISO, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import type { MenuItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Currency ────────────────────────────────────────────────────────────────

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Date helpers ─────────────────────────────────────────────────────────────

const WIB = "Asia/Jakarta";

/**
 * Returns the minimum delivery date based on the store's cut-off time.
 *
 * @param cutOffTime - "HH:MM" string from store settings
 */
export function getMinDeliveryDate(cutOffTime: string): Date {
  const nowWIB = toZonedTime(new Date(), WIB);

  const [hours, minutes] = cutOffTime.split(":").map(Number);
  const cutoff = new Date(nowWIB);
  cutoff.setHours(hours, minutes, 0, 0);

  // If we're past cutoff today, minimum is day-after-tomorrow; otherwise tomorrow
  const minDate = nowWIB > cutoff ? addDays(nowWIB, 2) : addDays(nowWIB, 1);
  minDate.setHours(0, 0, 0, 0);
  return minDate;
}

/**
 * Formats an ISO date string as a long Indonesian date.
 * e.g. "Senin, 27 Januari 2025"
 */
export function formatDateIndonesian(dateStr: string): string {
  return format(parseISO(dateStr), "EEEE, dd MMMM yyyy", { locale: localeId });
}

// ── Order total ──────────────────────────────────────────────────────────────

interface OrderFormItem {
  menu_id: string;
  quantity: number;
  variant?: string;
}

export function calculateOrderTotal(
  items: OrderFormItem[],
  menuItems: MenuItem[],
): number {
  return items.reduce((sum, item) => {
    const menu = menuItems.find((m) => m.id === item.menu_id);
    return sum + (menu?.price ?? 0) * item.quantity;
  }, 0);
}
