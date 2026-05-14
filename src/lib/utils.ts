import { addDays, format, isAfter, set, startOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import type { MenuItem } from "@/types";
import { TIMEZONE } from "./constants";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getNowWIB(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function getMinDeliveryDate(cutOffTime: string): Date {
  const now = getNowWIB();
  const [hours, minutes] = cutOffTime.split(":").map(Number);
  const cutoff = set(now, { hours, minutes, seconds: 0, milliseconds: 0 });
  return addDays(now, isAfter(now, cutoff) ? 2 : 1);
}

export function isDateDisabled(date: Date, minDate: Date): boolean {
  return startOfDay(date) < startOfDay(minDate);
}

export function formatDateIndonesian(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return format(value, "EEEE, dd MMMM yyyy", { locale: localeId });
}

export function calculateOrderTotal(
  items: { menu_id: string; quantity: number }[],
  menuItems: MenuItem[],
): number {
  return items.reduce((sum, item) => {
    const menu = menuItems.find((menuItem) => menuItem.id === item.menu_id);
    if (!menu) return sum;
    return sum + menu.price * item.quantity;
  }, 0);
}
