import { z } from "zod";

export const orderFormSchema = z
  .object({
    customer_name: z.string().min(2, "Nama minimal 2 karakter"),
    whatsapp_number: z
      .string()
      .regex(/^(\+62|62|0)[0-9]{8,12}$/, "Format nomor WA tidak valid"),
    delivery_type: z.enum(["auto2000", "cipayung_pickup", "external"]),
    department: z.string().optional(),
    delivery_date: z.date({ error: "Pilih tanggal pengiriman" }),
    payment_method: z.enum(["qris", "cod"]),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          menu_id: z.string().uuid(),
          quantity: z.number().min(0).max(50),
        }),
      )
      .min(1, "Pilih minimal 1 menu"),
  })
  .superRefine((data, ctx) => {
    if (data.delivery_type === "auto2000" && !data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Departemen wajib diisi untuk pengiriman Auto2000",
        path: ["department"],
      });
    }
    const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0);
    if (itemCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pilih minimal 1 item menu",
        path: ["items"],
      });
    }
  });

export type OrderFormInput = z.input<typeof orderFormSchema>;
export type OrderFormValues = z.output<typeof orderFormSchema>;

export const inventoryItemSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Nama bahan wajib diisi"),
  unit: z.string().optional(),
  stock_qty: z.number().min(0, "Stok tidak boleh negatif"),
});

export const recipeItemSchema = z.object({
  menu_id: z.string().uuid("Menu tidak valid"),
  inventory_id: z.string().uuid("Bahan tidak valid"),
  qty_needed: z.number().min(0.01, "Jumlah harus lebih dari 0"),
});

export const storeSettingsSchema = z.object({
  id: z.number().int().default(1),
  is_open: z.boolean(),
  cut_off_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:MM"),
  daily_quota: z.number().int().min(1).max(999),
  marquee_text: z.string(),
  announcement_active: z.boolean(),
  announcement_title: z.string(),
  announcement_body: z.string(),
  qris_url: z.string().url("QRIS URL tidak valid").or(z.literal("")),
});
