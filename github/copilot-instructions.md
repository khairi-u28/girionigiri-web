# Giri-giri Onigiri — Copilot Agent Master Instructions

You are building the **Giri-giri Onigiri** web app: an onigiri pre-order and POS system for a Jakarta SME.

Read ALL spec files in `docs/specs/` before writing any code.
The specs are the single source of truth. Never deviate from them.

---

## Spec Files Index

| File                              | Read When                                         |
| --------------------------------- | ------------------------------------------------- |
| `docs/specs/01-stack.md`          | Setting up dependencies, configs, or any new file |
| `docs/specs/02-design-system.md`  | Writing any JSX, styling any component            |
| `docs/specs/03-database.md`       | Any Supabase query, type, schema, or migration    |
| `docs/specs/04-structure.md`      | Creating files, folders, or new routes            |
| `docs/specs/05-mvp-scope.md`      | Deciding what to build and in what order          |
| `docs/specs/06-guest-features.md` | Any customer-facing page or component             |
| `docs/specs/07-admin-features.md` | Any admin page, POS, or dashboard component       |
| `docs/specs/08-business-logic.md` | Cut-off times, quota, WA messages, invoices       |

---

## Non-Negotiable Rules

### Framework

- **Next.js 16 + App Router** only. Never use Pages Router.
- Server Components by default. Add `'use client'` only for interactivity (hooks, events, browser APIs).
- All mutations go in **Server Actions** (`'use server'`). No API routes for mutations.
- TypeScript everywhere. Zero `any` types.

### Packages (from actual package.json)

- Next.js 16.2.6, React 19, TypeScript 5
- Tailwind CSS v4 — uses `@import "tailwindcss"` + `@theme inline {}` in CSS. **No tailwind.config.ts**.
- Shadcn/UI is the primary component library, especially for admin. Use it for all form elements, dialogs, tables, tabs, toasts, and selects.
- `@supabase/supabase-js` for all DB operations.
- `react-hook-form` + `zod` for all forms.
- `date-fns` + `date-fns-tz` for all date/time logic.

### Styling

- **Customer pages**: Match the Neo-Brutalism aesthetic from `guest.html` and `guest-form.html` exactly. Use Tailwind utility classes. Background is `#f4f4f0` (giriBg), not white.
- **Admin pages**: Shadcn/UI components styled with Neo-Brutalism tokens. Clean, functional, not decorative.
- All color tokens live in `globals.css` under `@theme inline {}`. Never hardcode hex values in className.
- Shadow tokens: `shadow-brutal` = `4px 4px 0px 0px #2b2b2b`, `shadow-brutal-sm` = `2px 2px 0px 0px #2b2b2b`, `shadow-brutal-lg` = `8px 8px 0px 0px #2b2b2b`.
- Hover = physical press: `hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm`.

### Database

- Single Supabase client from `src/lib/supabase.ts`. Never instantiate elsewhere.
- Always destructure `{ data, error }`. Always handle errors.
- Types come from `src/types/index.ts`. Never inline DB types in components.

### Forms

- `react-hook-form` + `zodResolver` for every form.
- Zod schemas in `src/lib/validations.ts`.
- Inline error messages below each field.

### File Naming

- Pages: `page.tsx` in route folder.
- Server Actions: `actions.ts` in same route folder as the page that calls them.
- Components: `PascalCase.tsx`.
- Hooks: `use*.ts`.

---

## MVP Priority (Build in This Order)

**Stop 1 — Fix existing broken code**
**Stop 2 — Guest order flow (landing → form → confirmation → WA)**
**Stop 3 — Guest order-history page (tracking + step indicator)**
**Stop 4 — Admin order management (view + advance status)**
**Stop 5 — Admin POS + invoice**
**Stop 6 — Admin menu/inventory management**

See `docs/specs/05-mvp-scope.md` for exact task list per stop.

---

## Never Do

- Never use `any` type
- Never hardcode colors (use CSS token classes)
- Never create Supabase client outside `src/lib/supabase.ts`
- Never use `useEffect` to fetch data in Server Components
- Never add `border-radius` to buttons, inputs, cards — Neo-Brutalism is square
- Never use opacity for hover states — use translate + shadow
- Never commit `.env.local`
- Never invent data or mock Supabase calls — always use the real client
