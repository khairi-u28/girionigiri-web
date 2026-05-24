# Spec 04 — Project Structure

## Exact Folder Layout

```
girionigiri-web/
├── .github/
│   └── copilot-instructions.md        ← agent reads this first
│
├── docs/specs/                        ← all spec files live here
│
├── public/
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ← root layout (fonts, metadata)
│   │   ├── page.tsx                   ← redirect to /guest
│   │   ├── not-found.tsx
│   │   ├── globals.css                ← Tailwind v4 + @theme inline
│   │   │
│   │   ├── guest/                     ← public customer routes (no auth)
│   │   │   ├── layout.tsx             ← navbar + footer
│   │   │   ├── page.tsx               ← landing page (Server Component)
│   │   │   ├── order/
│   │   │   │   ├── page.tsx           ← order form page (Server Component)
│   │   │   │   └── actions.ts         ← submitOrder server action
│   │   │   └── order-history/
│   │   │       └── [phone]/
│   │   │           └── page.tsx       ← tracking page (Server Component + realtime)
│   │   │
│   │   └── admin/                     ← protected admin routes
│   │       ├── layout.tsx             ← admin shell + auth guard
│   │       ├── login/
│   │       │   ├── page.tsx
│   │       │   └── actions.ts         ← loginAction server action
│   │       ├── dashboard/
│   │       │   ├── page.tsx           ← tabs: POS | Kitchen | Orders
│   │       │   ├── pos-actions.ts     ← processPosOrder
│   │       │   ├── status-actions.ts  ← advanceOrderStatus, markPaid
│   │       │   └── summary-actions.ts ← getKitchenSummary
│   │       ├── menu/
│   │       │   ├── page.tsx           ← menu item CRUD
│   │       │   └── menu-actions.ts
│   │       ├── inventory/
│   │       │   ├── page.tsx           ← inventory CRUD
│   │       │   └── inventory-actions.ts
│   │       ├── recipes/
│   │       │   ├── page.tsx           ← recipe ↔ inventory linking
│   │       │   └── recipe-actions.ts
│   │       └── settings/
│   │           ├── page.tsx           ← store settings
│   │           └── settings-actions.ts
│   │
│   ├── components/
│   │   ├── ui/                        ← shadcn/ui auto-generated (do not edit)
│   │   │
│   │   ├── guest/
│   │   │   ├── Navbar.tsx             ← matches guest.html navbar
│   │   │   ├── MarqueeBanner.tsx
│   │   │   ├── AnnouncementBanner.tsx
│   │   │   ├── HeroSection.tsx        ← matches guest.html hero exactly
│   │   │   ├── MenuSection.tsx        ← featured + ekstra menu grids
│   │   │   ├── MenuCard.tsx
│   │   │   ├── OrderCTA.tsx           ← the CTA section before footer
│   │   │   ├── GuestFooter.tsx
│   │   │   ├── OrderForm.tsx          ← client component, all form logic
│   │   │   ├── MenuItemRow.tsx        ← single menu row with stepper
│   │   │   ├── StickyTotalBar.tsx     ← floating total + submit
│   │   │   ├── PaymentInstructions.tsx
│   │   │   ├── WhatsAppButton.tsx
│   │   │   └── OrderTracker.tsx       ← phone-based tracking + realtime
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminShell.tsx         ← sidebar + header layout
│   │   │   ├── LoginForm.tsx
│   │   │   ├── POSInterface.tsx       ← POS tab content
│   │   │   ├── POSCart.tsx            ← cart sidebar in POS
│   │   │   ├── POSInvoice.tsx         ← invoice dialog after POS sale
│   │   │   ├── KitchenSummary.tsx
│   │   │   ├── OrderBoard.tsx         ← orders table with status advance
│   │   │   ├── MenuManager.tsx        ← menu CRUD
│   │   │   ├── InventoryTable.tsx
│   │   │   ├── RecipeManager.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── StatusBadge.tsx        ← reusable status badge
│   │   │
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/
│   │   ├── useStoreSettings.ts        ← for client components needing live settings
│   │   └── useRealtimeOrders.ts       ← Supabase realtime subscription
│   │
│   ├── lib/
│   │   ├── supabase.ts                ← single client instance
│   │   ├── constants.ts               ← delivery types, departments, etc.
│   │   ├── utils.ts                   ← cn(), formatRupiah(), date utils
│   │   ├── validations.ts             ← all Zod schemas
│   │   └── whatsapp.ts                ← message formatter + link generator
│   │
│   ├── types/
│   │   └── index.ts                   ← all TypeScript interfaces
│   │
│   └── middleware.ts                  ← admin route protection
│
├── .env.local
├── .env.example
├── .gitignore
├── components.json                    ← shadcn config
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Key File Responsibilities

### `src/app/page.tsx`

```typescript
import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/guest");
}
```

### `src/app/guest/order-history/[phone]/page.tsx`

- `params.phone` is the URL-encoded phone number (e.g. `6281234567890`)
- Fetches ALL orders for that phone from Supabase
- Shows them newest-first
- Each order card has the step indicator
- The `OrderTracker` component handles realtime subscription

### `src/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token");
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (isAdmin && !isLogin && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

### `src/lib/constants.ts`

```typescript
export const DELIVERY_TYPES = {
  AUTO2000: "auto2000",
  PICKUP: "pickup",
  EXTERNAL: "external",
} as const;

export const PAYMENT_METHODS = { QRIS: "qris", COD: "cod" } as const;
export const ORDER_STATUSES = {
  RECEIVED: "received",
  PROCESSING: "processing",
  DELIVERED: "delivered",
} as const;
export const PAYMENT_STATUSES = { PENDING: "pending", PAID: "paid" } as const;

export const DELIVERY_LABELS: Record<string, string> = {
  auto2000: "Kantor (Auto2000)",
  pickup: "Ambil di Cipayung",
  external: "Antar ke Alamat",
};

export const DEPARTMENTS = [
  "Marketing",
  "Sales",
  "Finance",
  "HR",
  "IT",
  "Operations",
  "Customer Service",
  "Management",
  "Lainnya",
] as const;

export const TIMEZONE = "Asia/Jakarta";
```

### `src/lib/validations.ts`

```typescript
import { z } from "zod";

export const orderFormSchema = z
  .object({
    customer_name: z.string().min(2, "Nama minimal 2 karakter"),
    phone_number: z
      .string()
      .regex(/^(0|62|\+62)[0-9]{8,12}$/, "Format nomor HP tidak valid"),
    delivery_type: z.enum(["auto2000", "pickup", "external"]),
    department: z.string().optional(),
    delivery_address: z.string().optional(),
    delivery_date: z.date({ error: "Pilih tanggal pengiriman" }),
    payment_method: z.enum(["qris", "cod"]),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          menu_id: z.string().uuid(),
          quantity: z.number().min(0).max(99),
          variant: z.string().optional(),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    if (data.delivery_type === "auto2000" && !data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pilih departemen",
        path: ["department"],
      });
    }
    if (data.delivery_type === "external" && !data.delivery_address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Isi alamat pengiriman",
        path: ["delivery_address"],
      });
    }
    const totalItems = data.items.reduce((sum, i) => sum + i.quantity, 0);
    if (totalItems < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pilih minimal 1 item",
        path: ["items"],
      });
    }
  });

export type OrderFormInput = z.input<typeof orderFormSchema>;

export const inventoryItemSchema = z.object({
  name: z.string().min(1),
  unit: z.string().optional(),
  stock_qty: z.number().min(0),
});

export const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  category: z.enum(["onigiri", "side_dish", "drink"]),
  is_active: z.boolean().default(true),
  is_highlighted: z.boolean().default(false),
  image_url: z.string().url().optional().or(z.literal("")),
  sort_order: z.number().int().default(0),
});

export const recipeItemSchema = z.object({
  menu_id: z.string().uuid(),
  inventory_id: z.string().uuid(),
  qty_needed: z.number().min(0.01),
});

export const storeSettingsSchema = z.object({
  is_open: z.boolean(),
  cut_off_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  daily_quota: z.number().int().min(1).max(999),
  marquee_text: z.string(),
  announcement_active: z.boolean(),
  announcement_title: z.string(),
  announcement_body: z.string(),
  qris_image_url: z.string().url().optional().or(z.literal("")),
  whatsapp_number: z.string(),
});
```
