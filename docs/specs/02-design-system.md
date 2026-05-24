# Spec 02 — Design System

> Source of truth: `guest.html` and `guest-form.html` design references.
> Customer pages must match these references exactly.
> Admin pages use Shadcn/UI as the base, styled with the same tokens.

---

## Philosophy

**Neo-Brutalism** = raw structure + high contrast + physical interaction feedback.

Core rules (apply everywhere):

- **No border-radius** on cards, buttons, inputs, modals. Everything is square.
- **No soft shadows.** Only hard-offset shadows with zero blur.
- **No opacity hover.** Hover = physical press: element shifts `+2px x +2px`, shadow shrinks.
- **Borders are thick** (2px–4px), solid black.
- **Typography is bold.** Most UI text is `font-bold` or `font-black`.

---

## Color Tokens (Tailwind v4 `@theme inline`)

| CSS Variable          | Hex       | Tailwind Class                       | Usage                                  |
| --------------------- | --------- | ------------------------------------ | -------------------------------------- |
| `--color-giri-red`    | `#A90402` | `bg-giri-red`, `text-giri-red`       | Primary CTAs, prices, accents          |
| `--color-giri-black`  | `#2b2b2b` | `bg-giri-black`, `text-giri-black`   | Text, all borders, all shadows         |
| `--color-giri-white`  | `#ffffff` | `bg-giri-white`, `text-giri-white`   | Cards, inputs, button text on red      |
| `--color-giri-bg`     | `#f4f4f0` | `bg-giri-bg`                         | **Page background** (not white!)       |
| `--color-giri-yellow` | `#FFDE59` | `bg-giri-yellow`, `text-giri-yellow` | Promo badges, step numbers, highlights |
| `--color-giri-blue`   | `#4ECDC4` | `bg-giri-blue`                       | Side dishes section, secondary accents |

**Never hardcode hex values in className. Always use the token class.**

---

## Shadow Tokens

```
shadow-brutal-sm  →  2px 2px 0px 0px #2b2b2b   (small buttons, radio cards)
shadow-brutal     →  4px 4px 0px 0px #2b2b2b   (cards, menu items, form sections)
shadow-brutal-lg  →  8px 8px 0px 0px #2b2b2b   (hero, sticky total bar, modals)
shadow-brutal-red →  4px 4px 0px 0px #A90402   (destructive / warning cards)
```

---

## Typography

| Use                   | Font          | Weight  | Class                                 |
| --------------------- | ------------- | ------- | ------------------------------------- |
| Page headings, hero   | Inter         | 900     | `font-black uppercase tracking-tight` |
| Section headers       | Inter         | 800     | `font-black uppercase`                |
| Item names, labels    | Inter         | 700     | `font-bold uppercase`                 |
| Body text             | Inter         | 600     | `font-semibold`                       |
| Captions, meta        | Inter         | 400     | `font-medium text-gray-600`           |
| Japanese brand accent | Noto Serif JP | 700/900 | `font-serif font-black text-giri-red` |

---

## Interactive States

### Button — Primary (Red)

```html
<button
  class="bg-giri-red text-giri-white border-4 border-giri-black
               px-8 py-4 font-black uppercase shadow-brutal
               hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm
               transition-all"
>
  Label
</button>
```

### Button — Dark (Black)

```html
<button
  class="bg-giri-black text-giri-white border-2 border-giri-black
               px-4 py-2 font-black uppercase shadow-brutal
               hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm
               transition-all"
>
  Label
</button>
```

### Button — Ghost (White)

```html
<button
  class="bg-giri-white text-giri-black border-2 border-giri-black
               px-4 py-2 font-bold uppercase shadow-brutal-sm
               hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
               transition-all"
>
  Label
</button>
```

### Radio Card (Selection UI)

```html
<label class="cursor-pointer relative">
  <input
    type="radio"
    name="..."
    value="..."
    class="peer sr-only brutal-radio"
  />
  <div
    class="border-2 border-giri-black bg-gray-50 p-4 font-bold uppercase
              transition-all hover:-translate-y-1 hover:shadow-brutal"
  >
    Content
  </div>
</label>
```

When `brutal-radio` is checked, the label div turns red (defined in globals.css).

### Quantity Stepper

```html
<div
  class="flex items-center border-2 border-giri-black bg-giri-white h-10 shadow-brutal-sm"
>
  <button
    class="w-10 h-full flex items-center justify-center
                 hover:bg-giri-red hover:text-giri-white
                 font-black text-xl border-r-2 border-giri-black transition-colors"
  >
    -
  </button>
  <input
    type="number"
    value="0"
    readonly
    class="w-12 h-full text-center font-bold outline-none bg-transparent"
  />
  <button
    class="w-10 h-full flex items-center justify-center
                 hover:bg-giri-black hover:text-giri-white
                 font-black text-xl border-l-2 border-giri-black transition-colors"
  >
    +
  </button>
</div>
```

### Input Field

```html
<input
  class="w-full bg-giri-white border-2 border-giri-black p-3
              font-medium focus:outline-none focus:shadow-brutal-sm transition-shadow"
/>
```

---

## Component Patterns

### Form Section Card (with numbered badge)

```html
<section
  class="bg-giri-white border-4 border-giri-black shadow-brutal p-6 md:p-8 relative"
>
  <div
    class="absolute -top-4 -left-4 bg-giri-yellow border-2 border-giri-black
              px-4 py-1 font-black text-xl shadow-brutal-sm transform -rotate-3"
  >
    1
  </div>
  <h2
    class="text-2xl font-black uppercase mb-6 border-b-2 border-dashed border-gray-300 pb-2"
  >
    Section Title
  </h2>
  {content}
</section>
```

### Menu Item Card (in order form)

```html
<div
  class="flex flex-col sm:flex-row justify-between items-start sm:items-center
            gap-4 bg-gray-50 border-2 border-giri-black p-4"
>
  <div class="flex-grow">
    <h3 class="font-black text-lg uppercase">{name}</h3>
    <p class="font-bold text-giri-red">{price}</p>
  </div>
  {quantity stepper}
</div>
```

### Status Badge

```html
<!-- Received -->
<span
  class="bg-giri-yellow border-2 border-giri-black px-2 py-1 text-xs font-black uppercase"
>
  Diterima
</span>

<!-- Processing / Cooking -->
<span
  class="bg-giri-blue border-2 border-giri-black px-2 py-1 text-xs font-black uppercase"
>
  Dimasak
</span>

<!-- Delivered -->
<span
  class="bg-giri-black text-giri-white border-2 border-giri-black px-2 py-1 text-xs font-black uppercase"
>
  Terkirim
</span>

<!-- Paid -->
<span
  class="bg-green-500 text-white border-2 border-giri-black px-2 py-1 text-xs font-black uppercase"
>
  Lunas
</span>

<!-- Pending payment -->
<span
  class="bg-gray-200 border-2 border-giri-black px-2 py-1 text-xs font-black uppercase"
>
  Belum Bayar
</span>
```

### Section Header (landing page)

```html
<div class="mb-8 border-b-4 border-giri-black pb-4">
  <h2 class="text-3xl font-black uppercase tracking-tight">{title}</h2>
</div>
```

### Floating Sticky Total Bar (order form)

```html
<div class="sticky bottom-4 z-40">
  <div
    class="bg-giri-black border-4 border-giri-red shadow-brutal-lg p-4 md:p-6
              flex flex-col sm:flex-row items-center justify-between gap-4"
  >
    <div class="text-giri-white">
      <span
        class="block text-sm font-bold uppercase tracking-widest text-gray-400"
        >Total Tagihan</span
      >
      <span class="block text-3xl font-black text-giri-yellow">{total}</span>
    </div>
    <button
      class="bg-giri-red text-giri-white border-4 border-giri-white
                   px-8 py-4 font-black uppercase text-lg
                   shadow-[4px_4px_0px_0px_#ffffff]
                   hover:bg-giri-white hover:text-giri-red transition-colors"
    >
      Selesaikan PO
    </button>
  </div>
</div>
```

### Announcement Marquee

```html
<div
  class="bg-giri-yellow border-b-2 border-giri-black py-2 overflow-hidden
            text-sm font-black uppercase tracking-widest"
>
  <span class="animate-marquee inline-block">
    {marquee_text} &nbsp;⚡&nbsp; {marquee_text}
  </span>
</div>
```

---

## Admin UI Rules

The admin panel uses **Shadcn/UI components** as the base. Override Shadcn's default styling to match Neo-Brutalism:

- Remove `border-radius` from all inputs, buttons, cards → `rounded-none`
- Add `border-giri-black border-2` to all inputs
- Replace Shadcn's soft shadows with `shadow-brutal-sm` or `shadow-brutal`
- Buttons in admin use Shadcn `<Button>` with `className` overrides

Admin page background: `bg-giri-bg` (the same `#f4f4f0`)
Admin header: `bg-giri-black text-giri-white border-b-4 border-giri-red`
Admin sidebar: `bg-giri-white border-r-4 border-giri-black`

---

## Layout Rules

| Context          | Max Width           | Padding                |
| ---------------- | ------------------- | ---------------------- |
| Customer landing | `max-w-6xl mx-auto` | `px-4 sm:px-6 lg:px-8` |
| Customer form    | `max-w-4xl mx-auto` | `px-4 py-8 md:py-12`   |
| Admin panel      | `max-w-7xl mx-auto` | `px-4 py-6 md:px-8`    |

- Section spacing: `space-y-16 lg:space-y-24` between major landing sections
- Form section spacing: `space-y-12` between form cards
