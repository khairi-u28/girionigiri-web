# Giri-giri Onigiri — Copilot Agent Instructions

You are an expert Next.js developer building the **Giri-giri Onigiri** web application.
This is an onigiri pre-order and POS system for an Indonesian SME.

Before writing ANY code, read all spec files in `docs/specs/` thoroughly.
Always follow the rules in this file and in the referenced specs.

---

## 📂 Spec Files (Read These First)

| File | Purpose |
|---|---|
| `docs/specs/01-stack.md` | Tech stack, versions, and install commands |
| `docs/specs/02-design-system.md` | Colors, typography, shadows, Neo-Brutalism rules |
| `docs/specs/03-database.md` | Full SQL schema, types, and Supabase setup |
| `docs/specs/04-project-structure.md` | Exact folder/file layout to follow |
| `docs/specs/05-features-customer.md` | All customer-facing feature requirements |
| `docs/specs/06-features-admin.md` | All admin panel feature requirements |
| `docs/specs/07-business-logic.md` | Cut-off rules, quota logic, WA link generation |

---

## ⚙️ Core Rules (Always Apply)

### Framework
- Use **Next.js 14+ App Router** only. Never use Pages Router.
- All components are **React Server Components by default**.
- Add `'use client'` only when using hooks, events, or browser APIs.
- Use **TypeScript** for every file. No `.js` or `.jsx` files.

### Styling
- Use **Tailwind CSS** utility classes only. No inline styles. No CSS Modules.
- All colors must come from `tailwind.config.ts` custom tokens (e.g., `bg-giri-red`, `text-giri-black`). Never hardcode hex values in className.
- Follow the **Neo-Brutalism** design rules in `docs/specs/02-design-system.md` strictly.

### Components
- Use **Shadcn/UI** as the base for all form elements (Input, Select, Button, Dialog, etc.).
- Customize Shadcn components to match Neo-Brutalism — thick borders, hard shadows, no border-radius unless specified.
- Store all Shadcn components in `src/components/ui/`.
- Store page-level components in `src/components/customer/` or `src/components/admin/`.

### Database
- Use **Supabase** for all data operations. Never use raw `fetch` for database calls.
- Import the client from `src/lib/supabase.ts`. Never instantiate `createClient` in a component.
- Always handle errors from Supabase: `const { data, error } = await supabase...`
- Use TypeScript types defined in `src/types/index.ts` for all DB rows.

### Forms
- Use **React Hook Form** + **Zod** for all forms. No uncontrolled forms.
- Define Zod schemas in `src/lib/validations.ts`.
- Validation errors must display inline below each field, styled per the design system.

### File Naming
- Pages: `page.tsx` inside the route folder.
- Layouts: `layout.tsx` inside the route folder.
- Components: `PascalCase.tsx` (e.g., `OrderForm.tsx`, `HeroSection.tsx`).
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useStoreSettings.ts`).
- Utilities: `camelCase.ts` (e.g., `utils.ts`, `constants.ts`).

### Environment Variables
- All Supabase keys come from `.env.local`. Never hardcode credentials.
- Public vars use `NEXT_PUBLIC_` prefix. Server-only vars do not.
- Access via `process.env.VAR_NAME`. Type-check in `src/lib/env.ts`.

---

## 🚫 Never Do These

- Never use `any` type in TypeScript.
- Never hardcode hex colors in `className` or `style`.
- Never create a new Supabase client outside `src/lib/supabase.ts`.
- Never use `useEffect` to fetch data in Server Components.
- Never use inline styles for layout or spacing — use Tailwind.
- Never add `border-radius` to buttons, cards, or inputs (Neo-Brutalism is square).
- Never use `opacity` for hover states — use `translate` transforms instead.
- Never commit `.env.local` — it is in `.gitignore`.

---

## ✅ When Generating Code

1. Check the relevant spec file before starting.
2. Generate the complete file — no placeholders like `// TODO` or `// implement later`.
3. Include all imports at the top of every file.
4. Export types and interfaces from `src/types/index.ts`.
5. Every database query must have error handling.
6. Every form must have Zod validation.
7. Every interactive component must have loading and error states.
