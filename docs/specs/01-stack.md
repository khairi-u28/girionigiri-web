# Spec 01 — Technology Stack

## Versions & Packages

### Core

```bash
next@16.2.6
react@19
react-dom@18
typescript@5
```

### Styling & UI

```bash
tailwindcss@v4
postcss
autoprefixer
@radix-ui/react-*       # via shadcn/ui
lucide-react
```

### Database & Auth

```bash
@supabase/supabase-js
@supabase/auth-helpers-nextjs
```

### Forms & Validation

```bash
react-hook-form
@hookform/resolvers
zod@v4.1.12
```

### Utilities

```bash
date-fns
date-fns-tz
clsx
tailwind-merge
qs
```

---

## Install Commands (Run in Order)

```bash
# 1. Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 2. Shadcn: use
npx shadcn@latest init

# 3. Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 4. Forms
npm install react-hook-form @hookform/resolvers zod

# 5. Utilities
npm install date-fns date-fns-tz clsx tailwind-merge lucide-react qs
```

---

## `tailwind.config.ts` (Complete File)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "giri-red": "#A90402",
        "giri-black": "#2b2b2b",
        "giri-white": "#ffffff",
        "giri-yellow": "#FFDE59",
        "giri-blue": "#4ECDC4",
      },
      boxShadow: {
        giri: "8px 8px 0px 0px #2b2b2b",
        "giri-sm": "4px 4px 0px 0px #2b2b2b",
        "giri-lg": "12px 12px 0px 0px #2b2b2b",
      },
      fontFamily: {
        heading: ["Montserrat", "Helvetica Neue", "sans-serif"],
        "serif-jp": ["Noto Serif JP", "serif"],
      },
      borderWidth: {
        "4": "4px",
        "8": "8px",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## `src/app/globals.css` (Complete File)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap");

:root {
  --giri-red: #a90402;
  --giri-black: #2b2b2b;
  --giri-white: #ffffff;
  --giri-yellow: #ffde59;
  --giri-blue: #4ecdc4;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #ffffff;
  color: #2b2b2b;
  font-family: system-ui, sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
}
```

---

## `next.config.ts` (Complete File)

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
    ],
  },
};

export default nextConfig;
```

---

## Shadcn/UI Init Answers

When `npx shadcn-ui@latest init` prompts you:

| Prompt                    | Answer                |
| ------------------------- | --------------------- |
| TypeScript?               | Yes                   |
| Style?                    | Default               |
| Base color?               | Slate                 |
| Global CSS file?          | `src/app/globals.css` |
| CSS variables?            | Yes                   |
| Tailwind prefix?          | (leave blank)         |
| Components path?          | `src/components/ui`   |
| Utils path?               | `src/lib/utils`       |
| Server Components?        | Yes                   |
| Write to components.json? | Yes                   |

---

## Shadcn Components to Install

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add combobox
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
```
