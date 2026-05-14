export const DELIVERY_TYPES = {
  AUTO2000: "auto2000",
  CIPAYUNG_PICKUP: "cipayung_pickup",
  EXTERNAL: "external",
} as const;

export const PAYMENT_METHODS = {
  QRIS: "qris",
  COD: "cod",
} as const;

export const TIMEZONE = "Asia/Jakarta";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export const DEPARTMENTS = [
  "Marketing",
  "Sales",
  "Finance",
  "HR",
  "IT",
  "Operations",
  "Customer Service",
  "Management",
] as const;
