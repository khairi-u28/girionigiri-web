# Spec 04 — Project Structure

## Exact Folder Layout

Reproduce this structure exactly. Do not deviate without explicit instruction.

```
girionigiri-web/
├── .github/
│   └── copilot-instructions.md       ← Agent reads this first
│
├── docs/
│   └── specs/
│       ├── 01-stack.md
│       ├── 02-design-system.md
│       ├── 03-database.md
│       ├── 04-project-structure.md   ← This file
│       ├── 05-features-customer.md
│       ├── 06-features-admin.md
│       └── 07-business-logic.md
│
├── public/
│   └── images/
│
├── src/
│   ├── app/                          ← Next.js App Router
│   │   ├── layout.tsx                ← Root layout (fonts, metadata)
│   │   ├── page.tsx                  ← Redirects to /guest
│   │   ├── not-found.tsx
│   │   │
│   │   ├── guest/                    ← Customer-facing routes
│   │   │   ├── layout.tsx            ← Header + Footer for customers
│   │   │   ├── page.tsx              ← Landing page
│   │   │   ├── order/
│   │   │   │   └── page.tsx          ← Dynamic order form
│   │   │   └── order-history/
│   │   │       └── [uuid]/
│   │   │           └── page.tsx      ← Private order tracking page
│   │   │
│   │   └── admin/                    ← Admin-facing routes (auth-guarded)
│   │       ├── layout.tsx            ← Admin header + auth guard
│   │       ├── login/
│   │       │   └── page.tsx          ← Admin login page
│   │       ├── dashboard/
│   │       │   └── page.tsx          ← POS + Kitchen Summary
│   │       ├── inventory/
│   │       │   └── page.tsx          ← Master inventory CRUD
│   │       ├── recipes/
│   │       │   └── page.tsx          ← Recipe management
│   │       └── settings/
│   │           └── page.tsx          ← Operational controls
│   │
│   ├── components/
│   │   ├── ui/                       ← Shadcn/UI base components (auto-generated)
│   │   │
│   │   ├── layout/
│   │   │   ├── GuestHeader.tsx
│   │   │   ├── GuestFooter.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   └── AdminSidebar.tsx
│   │   │
│   │   ├── customer/
│   │   │   ├── HeroSection.tsx       ← Brand hero with CTA
│   │   │   ├── MarqueeBanner.tsx     ← Running promo text
│   │   │   ├── AnnouncementBanner.tsx
│   │   │   ├── MenuGrid.tsx          ← Menu item cards
│   │   │   ├── MenuCard.tsx          ← Single menu item card
│   │   │   ├── OrderForm.tsx         ← Dynamic order form (main component)
│   │   │   ├── OrderFormFields.tsx   ← Conditional field rendering
│   │   │   ├── DeliveryDatePicker.tsx
│   │   │   ├── OrderSummary.tsx      ← Pre-checkout summary
│   │   │   ├── PaymentInstructions.tsx ← Post-submit QRIS/COD
│   │   │   ├── WhatsAppButton.tsx
│   │   │   └── OrderTracker.tsx      ← Order history/status page
│   │   │
│   │   ├── admin/
│   │   │   ├── POSInterface.tsx      ← Big-button POS for walk-ins
│   │   │   ├── KitchenSummary.tsx    ← PO aggregation for kitchen
│   │   │   ├── InventoryTable.tsx    ← CRUD table for inventory
│   │   │   ├── RecipeManager.tsx     ← Recipe ↔ Inventory linking
│   │   │   ├── IngredientCombobox.tsx ← Autocomplete for inventory items
│   │   │   ├── OrderStatusBoard.tsx  ← Admin order management
│   │   │   └── SettingsPanel.tsx     ← Global operational settings
│   │   │
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/
│   │   ├── useStoreSettings.ts       ← Fetches + caches store_settings
│   │   ├── useMenuItems.ts           ← Fetches active menu items
│   │   ├── useOrders.ts              ← Order CRUD operations
│   │   ├── useInventory.ts           ← Inventory CRUD operations
│   │   └── useQuotaCheck.ts          ← Checks daily quota for a date
│   │
│   ├── lib/
│   │   ├── supabase.ts               ← Single Supabase client instance
│   │   ├── constants.ts              ← App-wide constants and enums
│   │   ├── utils.ts                  ← General utilities (cn, formatRupiah, etc.)
│   │   ├── validations.ts            ← All Zod schemas
│   │   └── whatsapp.ts               ← WhatsApp message formatting + link gen
│   │
│   ├── types/
│   │   └── index.ts                  ← All TypeScript interfaces (see spec 03)
│   │
│   └── middleware.ts                 ← Protects /admin/* routes
│
├── .env.local                        ← Never commit
├── .env.example                      ← Commit this (no real values)
├── .gitignore
├── components.json                   ← Shadcn/UI config (auto-generated)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## File Responsibilities

### `src/app/page.tsx`
Immediately redirects to `/guest`. Nothing else.
```typescript
import { redirect } from 'next/navigation'
export default function RootPage() { redirect('/guest') }
```

### `src/middleware.ts`
Protects all `/admin/*` routes except `/admin/login`.
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && !adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

### `src/lib/constants.ts`
```typescript
export const DELIVERY_TYPES = {
  AUTO2000:        'auto2000',
  CIPAYUNG_PICKUP: 'cipayung_pickup',
  EXTERNAL:        'external',
} as const

export const PAYMENT_METHODS = {
  QRIS: 'qris',
  COD:  'cod',
} as const

export const ORDER_STATUSES = {
  RECEIVED:   'received',
  PROCESSING: 'processing',
  DELIVERED:  'delivered',
} as const

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID:    'paid',
} as const

export const CATEGORIES = {
  ONIGIRI:   'onigiri',
  SIDE_DISH: 'side_dish',
  DRINK:     'drink',
} as const

export const TIMEZONE = 'Asia/Jakarta'

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

export const DEPARTMENTS = [
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'IT',
  'Operations',
  'Customer Service',
  'Management',
] as const
```

### `src/lib/validations.ts`
```typescript
import { z } from 'zod'

export const orderFormSchema = z.object({
  customer_name:    z.string().min(2, 'Nama minimal 2 karakter'),
  whatsapp_number:  z.string().regex(/^(\+62|62|0)[0-9]{8,12}$/, 'Format nomor WA tidak valid'),
  delivery_type:    z.enum(['auto2000', 'cipayung_pickup', 'external']),
  department:       z.string().optional(),
  delivery_date:    z.date({ required_error: 'Pilih tanggal pengiriman' }),
  payment_method:   z.enum(['qris', 'cod']),
  notes:            z.string().optional(),
  items:            z.array(z.object({
    menu_id:  z.string().uuid(),
    quantity: z.number().min(1).max(50),
  })).min(1, 'Pilih minimal 1 menu'),
}).superRefine((data, ctx) => {
  if (data.delivery_type === 'auto2000' && !data.department) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Departemen wajib diisi untuk pengiriman Auto2000',
      path: ['department'],
    })
  }
})

export const inventoryItemSchema = z.object({
  name:      z.string().min(1, 'Nama bahan wajib diisi'),
  unit:      z.string().optional(),
  stock_qty: z.number().min(0, 'Stok tidak boleh negatif'),
})

export const menuItemSchema = z.object({
  name:           z.string().min(1, 'Nama menu wajib diisi'),
  description:    z.string().optional(),
  price:          z.number().min(0, 'Harga tidak boleh negatif'),
  category:       z.enum(['onigiri', 'side_dish', 'drink']),
  is_active:      z.boolean().default(true),
  is_highlighted: z.boolean().default(false),
  image_url:      z.string().url().optional().or(z.literal('')),
})

export const storeSettingsSchema = z.object({
  is_open:             z.boolean(),
  cut_off_time:        z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  daily_quota:         z.number().int().min(1).max(999),
  marquee_text:        z.string(),
  announcement_active: z.boolean(),
  announcement_title:  z.string(),
  announcement_body:   z.string(),
  qris_url:            z.string().url().optional().or(z.literal('')),
})
```
