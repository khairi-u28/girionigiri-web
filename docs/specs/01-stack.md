# Spec 01 — Technology Stack

## Actual Installed Versions (from package.json)

```json
"dependencies": {
  "next": "16.2.6",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "@hookform/resolvers": "^5.2.2",
  "@supabase/supabase-js": "^2.57.4",
  "date-fns": "^4.1.0",
  "date-fns-tz": "^3.2.0",
  "lucide-react": "^0.554.0",
  "react-hook-form": "^7.66.0",
  "zod": "^4.1.12"
},
"devDependencies": {
  "@tailwindcss/postcss": "^4",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

## Still Needs Installing

```bash
# Shadcn/UI (install components one by one as needed)
npx shadcn@latest init

# Shadcn components needed for MVP
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add toast
npx shadcn@latest add switch
npx shadcn@latest add textarea
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add separator
npx shadcn@latest add card
npx shadcn@latest add sonner

# Missing utility (used by shadcn)
npm install clsx tailwind-merge class-variance-authority
```

---

## Tailwind v4 Configuration

**There is NO `tailwind.config.ts` in Tailwind v4.**
All theme customization goes in `src/app/globals.css` under `@theme inline {}`.

### `src/app/globals.css` (complete file)

```css
@import "tailwindcss";

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Noto+Serif+JP:wght@700;900&display=swap");

@theme inline {
  /* Brand Colors */
  --color-giri-red: #a90402;
  --color-giri-black: #2b2b2b;
  --color-giri-white: #ffffff;
  --color-giri-bg: #f4f4f0;
  --color-giri-yellow: #ffde59;
  --color-giri-blue: #4ecdc4;

  /* Fonts */
  --font-sans: "Inter", sans-serif;
  --font-serif: "Noto Serif JP", serif;

  /* Brutal Shadows */
  --shadow-brutal-sm: 2px 2px 0px 0px #2b2b2b;
  --shadow-brutal: 4px 4px 0px 0px #2b2b2b;
  --shadow-brutal-lg: 8px 8px 0px 0px #2b2b2b;
  --shadow-brutal-red: 4px 4px 0px 0px #a90402;
  --shadow-brutal-yellow: 4px 4px 0px 0px #ffde59;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f4f4f0;
  color: #2b2b2b;
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f4f4f0;
  border-left: 2px solid #2b2b2b;
}
::-webkit-scrollbar-thumb {
  background: #a90402;
  border: 2px solid #2b2b2b;
}
::-webkit-scrollbar-thumb:hover {
  background: #2b2b2b;
}

/* Hide number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Neo-Brutalist radio/checkbox selection */
.brutal-radio:checked + div {
  background-color: #a90402;
  color: white;
  border-color: #2b2b2b;
  box-shadow: 2px 2px 0px 0px #2b2b2b;
}

/* Marquee animation */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
.animate-marquee {
  animation: marquee 15s linear infinite;
  white-space: nowrap;
  display: inline-block;
  padding-left: 100%;
}

/* Shadcn overrides for Neo-Brutalism */
.shadcn-brutal input,
.shadcn-brutal textarea,
.shadcn-brutal select {
  border: 2px solid #2b2b2b !important;
  border-radius: 0 !important;
  background: #ffffff !important;
}

.shadcn-brutal input:focus,
.shadcn-brutal textarea:focus {
  box-shadow: var(--shadow-brutal-sm) !important;
  outline: none !important;
}
```

---

## `next.config.ts` (complete file)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
```

---

## `.env.local` (create this file, never commit)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

ADMIN_PASSWORD=your-secure-password
ADMIN_TOKEN_VALUE=your-random-token-string

NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Shadcn Init Prompts

When `npx shadcn@latest init` asks:

| Prompt          | Answer              |
| --------------- | ------------------- |
| Style           | Default             |
| Base color      | Neutral             |
| CSS variables   | Yes                 |
| TypeScript      | Yes                 |
| Framework       | Next.js             |
| Components path | `src/components/ui` |
| Utils path      | `src/lib/utils`     |
| RSC             | Yes                 |
