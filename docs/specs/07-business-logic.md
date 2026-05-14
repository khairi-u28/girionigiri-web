# Spec 07 — Business Logic & Utilities

## 1. Cut-off Time Logic

### Rule
```
WIB timezone (UTC+7) always.

IF   currentTimeWIB  < store_settings.cut_off_time
THEN min_delivery_date = tomorrow

IF   currentTimeWIB >= store_settings.cut_off_time
THEN min_delivery_date = day after tomorrow
```

### Implementation — `src/lib/utils.ts`

```typescript
import { addDays, isAfter, set } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'Asia/Jakarta'

export function getNowWIB(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

export function getMinDeliveryDate(cutOffTime: string): Date {
  const now = getNowWIB()
  const [hours, minutes] = cutOffTime.split(':').map(Number)

  const cutoff = set(now, { hours, minutes, seconds: 0, milliseconds: 0 })
  const isAfterCutoff = isAfter(now, cutoff)

  return addDays(now, isAfterCutoff ? 2 : 1)
}
```

### Usage in `DeliveryDatePicker.tsx`
```typescript
const minDate = getMinDeliveryDate(storeSettings.cut_off_time)

// Pass to Shadcn Calendar:
<Calendar
  disabled={(date) => isDateDisabled(date, minDate, fullDates)}
/>
```

---

## 2. Daily Quota Protection

### Rule
```
Before allowing a date to be selected:
  GET sum of all order_items.quantity WHERE orders.delivery_date = selectedDate

IF sum >= store_settings.daily_quota
THEN disable that date in the date picker
```

### Hook — `src/hooks/useQuotaCheck.ts`

```typescript
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export async function getOrderCountForDate(date: Date): Promise<number> {
  const dateStr = format(date, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('order_items')
    .select('quantity, orders!inner(delivery_date)')
    .eq('orders.delivery_date', dateStr)

  if (error || !data) return 0

  return data.reduce((sum, item) => sum + item.quantity, 0)
}

// Hook for use in client components
export function useQuotaCheck(dailyQuota: number) {
  async function isDateFull(date: Date): Promise<boolean> {
    const count = await getOrderCountForDate(date)
    return count >= dailyQuota
  }
  return { isDateFull }
}
```

---

## 3. WhatsApp Link Generation

### Message Format

```
🍙 *PESANAN BARU — GIRI-GIRI ONIGIRI*

Halo, saya ingin memesan:

📋 *Detail Pesanan*
Nama        : {customer_name}
No. WA      : {whatsapp_number}
Tipe        : {delivery_type_label}
{department_line}
Tanggal     : {delivery_date_formatted}
Pembayaran  : {payment_method_label}

🛒 *Item Pesanan*
{item_list}

💰 Total: {total_price_rupiah}

🔗 Tracking: {tracking_url}

{notes_line}
```

### Implementation — `src/lib/whatsapp.ts`

```typescript
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { OrderWithItems } from '@/types'

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  auto2000:        'Auto2000 (Antar ke kantor)',
  cipayung_pickup: 'Ambil di Cipayung',
  external:        'Pengiriman Umum',
}

const PAYMENT_LABELS: Record<string, string> = {
  qris: 'QRIS (Transfer)',
  cod:  'COD (Bayar di tempat)',
}

export function formatWhatsAppMessage(
  order: OrderWithItems,
  baseUrl: string
): string {
  const trackingUrl = `${baseUrl}/guest/order-history/${order.id}`
  const deliveryDateFormatted = format(
    new Date(order.delivery_date),
    'EEEE, dd MMMM yyyy',
    { locale: localeId }
  )

  const departmentLine = order.department
    ? `Departemen    : ${order.department}\n`
    : ''

  const itemList = order.order_items
    .map(item => `• ${item.menu_name} x${item.quantity} — ${formatRupiah(item.menu_price * item.quantity)}`)
    .join('\n')

  const notesLine = order.notes
    ? `\n📝 Catatan: ${order.notes}`
    : ''

  const message = `🍙 *PESANAN BARU — GIRI-GIRI ONIGIRI*

Halo, saya ingin memesan:

📋 *Detail Pesanan*
Nama        : ${order.customer_name}
No. WA      : ${order.whatsapp_number}
Tipe        : ${DELIVERY_TYPE_LABELS[order.delivery_type]}
${departmentLine}Tanggal     : ${deliveryDateFormatted}
Pembayaran  : ${PAYMENT_LABELS[order.payment_method]}

🛒 *Item Pesanan*
${itemList}

💰 Total: ${formatRupiah(order.total_price)}

🔗 Tracking: ${trackingUrl}${notesLine}`

  return message
}

export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const cleaned = phoneNumber.replace(/\D/g, '')
  const normalized = cleaned.startsWith('0')
    ? `62${cleaned.slice(1)}`
    : cleaned
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
```

---

## 4. Order Total Calculation

```typescript
export function calculateOrderTotal(
  items: { menu_id: string; quantity: number }[],
  menuItems: MenuItem[]
): number {
  return items.reduce((total, item) => {
    const menuItem = menuItems.find(m => m.id === item.menu_id)
    if (!menuItem) return total
    return total + menuItem.price * item.quantity
  }, 0)
}
```

---

## 5. Real-time Order Status Subscription

Used in `OrderTracker.tsx` (customer tracking page):

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        setOrder(prev => ({ ...prev, ...payload.new }))
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [orderId])
```

---

## 6. Store Settings Singleton Pattern

`store_settings` always has exactly one row (`id = 1`).

```typescript
// ALWAYS use upsert, never insert
const { error } = await supabase
  .from('store_settings')
  .upsert({ id: 1, ...updates }, { onConflict: 'id' })

// ALWAYS fetch with .single()
const { data } = await supabase
  .from('store_settings')
  .select('*')
  .eq('id', 1)
  .single()
```

---

## 7. Date Display Utility

```typescript
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// "Senin, 14 Mei 2026"
export function formatDateIndonesian(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'EEEE, dd MMMM yyyy', { locale: localeId })
}

// "14/05/2026"
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy')
}
```
