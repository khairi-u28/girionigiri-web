# Spec 02 — Design System (Neo-Brutalism)

## Philosophy

Neo-Brutalism = boldness + structural honesty + high contrast.
Every UI element must look intentionally raw, not polished or rounded.

**Core rules:**
- No `border-radius` on interactive elements (buttons, inputs, cards, modals).
- No soft drop shadows. All shadows are hard-offset with zero blur.
- No opacity-based hover states. Use `translate` transforms to simulate physical press.
- Borders are thick (`4px` minimum), black, and solid.

---

## Color Tokens

| Token (Tailwind) | Hex | Usage |
|---|---|---|
| `giri-red` | `#A90402` | Primary buttons, CTAs, admin header background, links |
| `giri-black` | `#2b2b2b` | Text, all borders, all shadows |
| `giri-white` | `#ffffff` | Page background, card background, button text on red |
| `giri-yellow` | `#FFDE59` | Promo banners, highlight badges, marquee background |
| `giri-blue` | `#4ECDC4` | Secondary highlights, status badges (Delivered), info |

**Never use any color outside this palette without explicit instruction.**

---

## Typography

### Heading Font: Montserrat
- Weight: `700`, `800`, `900`
- Class: `font-heading`
- Use for: All `h1`–`h4`, button labels, section titles, price displays

### Body Font: System UI
- Weight: `400`, `500`
- Use for: Paragraphs, form labels, descriptions

### Japanese Accent Font: Noto Serif JP
- Weight: `400`, `700`
- Class: `font-serif-jp`
- Use for: Brand name displayed in Japanese characters, decorative accents only

### Type Scale
```
h1: text-4xl font-heading font-black     (page hero titles)
h2: text-3xl font-heading font-bold      (section headers)
h3: text-2xl font-heading font-bold      (card titles, modal headers)
h4: text-xl  font-heading font-semibold  (subsection labels)
body: text-base                          (normal text)
small: text-sm                           (captions, metadata)
```

---

## Borders

```
Standard:    border-4 border-giri-black
Heavy:       border-8 border-giri-black
Input focus: border-4 border-giri-black (no color change, shadow appears instead)
```

**Never use `border-gray-*` or `border-slate-*`.**

---

## Shadows

```
Small card / button:    shadow-giri-sm   → 4px 4px 0px 0px #2b2b2b
Standard card:          shadow-giri      → 8px 8px 0px 0px #2b2b2b
Large hero / modal:     shadow-giri-lg   → 12px 12px 0px 0px #2b2b2b
Pressed state (active): shadow-none      (shadow removed on press)
```

---

## Interactive States

### Button — Default
```
bg-giri-red text-giri-white border-4 border-giri-black shadow-giri
font-heading font-bold uppercase tracking-wide
```

### Button — Hover
```
-translate-x-1 -translate-y-1 shadow-giri-lg transition-all duration-100
```
(shadow grows, element lifts — simulates hover lift)

### Button — Active / Pressed
```
translate-x-2 translate-y-2 shadow-none transition-all duration-75
```
(shadow removed, element drops — simulates physical press)

### Button — Secondary (Yellow)
```
bg-giri-yellow text-giri-black border-4 border-giri-black shadow-giri
```

### Button — Ghost / Outline
```
bg-giri-white text-giri-black border-4 border-giri-black shadow-giri-sm
```

### Input — Default
```
border-4 border-giri-black rounded-none bg-giri-white px-3 py-2 w-full
```

### Input — Focus
```
outline-none ring-0 shadow-giri-sm
```

### Input — Error
```
border-giri-red shadow-[4px_4px_0px_0px_#A90402]
```

---

## Component Patterns

### Card
```tsx
<div className="border-4 border-giri-black shadow-giri bg-giri-white p-6">
  {children}
</div>
```

### Badge — Status
```tsx
// Received
<span className="bg-giri-yellow text-giri-black border-2 border-giri-black px-2 py-1 text-sm font-bold uppercase">
  Received
</span>

// Processing
<span className="bg-giri-blue text-giri-black border-2 border-giri-black px-2 py-1 text-sm font-bold uppercase">
  Cooking
</span>

// Delivered
<span className="bg-giri-black text-giri-white border-2 border-giri-black px-2 py-1 text-sm font-bold uppercase">
  Delivered
</span>
```

### Section Header
```tsx
<div className="border-b-4 border-giri-black pb-3 mb-6">
  <h2 className="text-3xl font-heading font-bold text-giri-black">{title}</h2>
</div>
```

### Announcement Banner
```tsx
<div className="bg-giri-yellow border-b-4 border-giri-black px-4 py-3">
  <p className="font-heading font-bold text-giri-black text-center">{text}</p>
</div>
```

### Marquee (Running Text)
```tsx
<div className="bg-giri-black text-giri-white py-2 overflow-hidden border-y-4 border-giri-black">
  <div className="animate-marquee whitespace-nowrap font-heading font-bold">
    {text} &nbsp;&nbsp;•&nbsp;&nbsp; {text}
  </div>
</div>
```
Add to `tailwind.config.ts` keyframes:
```typescript
animation: { 'marquee': 'marquee 20s linear infinite' },
keyframes: { marquee: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(-100%)' } } }
```

---

## Layout Rules

- Max page width: `max-w-4xl mx-auto` for customer pages.
- Max page width: `max-w-7xl mx-auto` for admin pages.
- Padding: `px-4 py-6` on mobile, `px-8 py-10` on desktop.
- Grid gaps: `gap-6` standard, `gap-4` compact.
- Section spacing: `mb-12` between major sections.
- Never center-align body text — left-align all content.
