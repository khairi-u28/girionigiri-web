"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { MenuItem, OrderWithItems, StoreSettings } from "@/types";
import { DEPARTMENTS, DELIVERY_TYPES, PAYMENT_METHODS, WHATSAPP_NUMBER } from "@/lib/constants";
import { calculateOrderTotal, formatDateIndonesian, formatRupiah, getMinDeliveryDate } from "@/lib/utils";
import { orderFormSchema, type OrderFormInput } from "@/lib/validations";
import { formatWhatsAppMessage } from "@/lib/whatsapp";
import { submitOrder } from "@/app/guest/order/actions";
import { PaymentInstructions } from "./PaymentInstructions";
import { WhatsAppButton } from "./WhatsAppButton";

interface OrderFormProps {
  menuItems: MenuItem[];
  settings: StoreSettings;
}

export function OrderForm({ menuItems, settings }: OrderFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<OrderWithItems | null>(null);

  const form = useForm<OrderFormInput>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_name: "",
      whatsapp_number: "",
      delivery_type: DELIVERY_TYPES.EXTERNAL,
      department: "",
      payment_method: PAYMENT_METHODS.QRIS,
      notes: "",
      items: menuItems.map((item) => ({ menu_id: item.id, quantity: 0 })),
    },
  });

  const deliveryType = useWatch({ control: form.control, name: "delivery_type" });
  const items = useWatch({ control: form.control, name: "items" });
  const minDate = useMemo(() => getMinDeliveryDate(settings.cut_off_time), [settings.cut_off_time]);
  const total = calculateOrderTotal(items ?? [], menuItems);

  useEffect(() => {
    if (deliveryType !== DELIVERY_TYPES.AUTO2000) {
      form.setValue("department", undefined);
    }
  }, [deliveryType, form]);

  async function onSubmit(values: OrderFormInput) {
    setSubmitError(null);
    const result = await submitOrder(values);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }
    setSubmittedOrder(result.order);
  }

  if (submittedOrder) {
    const message = formatWhatsAppMessage(submittedOrder, window.location.origin);
    return (
      <section>
        <p className="border-4 border-giri-black bg-giri-yellow p-4 font-heading font-bold text-giri-black">
          Pesanan berhasil disimpan.
        </p>
        <PaymentInstructions paymentMethod={submittedOrder.payment_method} qrisUrl={settings.qris_url} orderId={submittedOrder.id} />
        <WhatsAppButton phoneNumber={WHATSAPP_NUMBER} message={message} />
      </section>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-4 border-giri-black bg-giri-white p-6 shadow-[8px_8px_0px_0px_#2b2b2b]">
      <input {...form.register("customer_name")} placeholder="Nama Pemesan" className="w-full border-4 border-giri-black bg-giri-white p-2" />
      <input {...form.register("whatsapp_number")} placeholder="No. WhatsApp" className="w-full border-4 border-giri-black bg-giri-white p-2" />
      <select {...form.register("delivery_type")} className="w-full border-4 border-giri-black bg-giri-white p-2">
        <option value={DELIVERY_TYPES.AUTO2000}>Auto2000</option>
        <option value={DELIVERY_TYPES.CIPAYUNG_PICKUP}>Pickup Cipayung</option>
        <option value={DELIVERY_TYPES.EXTERNAL}>Pengiriman Umum</option>
      </select>
      {deliveryType === DELIVERY_TYPES.AUTO2000 ? (
        <select {...form.register("department")} className="w-full border-4 border-giri-black bg-giri-white p-2">
          <option value="">Pilih Departemen</option>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      ) : null}
      <input
        type="date"
        {...form.register("delivery_date", { valueAsDate: true })}
        min={minDate.toISOString().slice(0, 10)}
        className="w-full border-4 border-giri-black bg-giri-white p-2"
      />
      <select {...form.register("payment_method")} className="w-full border-4 border-giri-black bg-giri-white p-2">
        <option value={PAYMENT_METHODS.QRIS}>QRIS</option>
        <option value={PAYMENT_METHODS.COD}>COD</option>
      </select>
      <textarea {...form.register("notes")} placeholder="Catatan (opsional)" className="w-full border-4 border-giri-black bg-giri-white p-2" />

      <div className="space-y-2 border-t-4 border-giri-black pt-4">
        {menuItems.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-heading font-bold text-giri-black">{item.name}</p>
              <p className="text-sm text-giri-black">{formatRupiah(item.price)}</p>
            </div>
            <input
              type="number"
              min={0}
              {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
              className="w-20 border-4 border-giri-black bg-giri-white p-2"
            />
          </div>
        ))}
      </div>
      <p className="font-heading text-xl font-bold text-giri-red">Total: {formatRupiah(total)}</p>
      <p className="text-sm text-giri-black">Minimal tanggal pengiriman: {formatDateIndonesian(minDate)}</p>
      {submitError ? <p className="text-giri-red">{submitError}</p> : null}
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full border-4 border-giri-black bg-giri-red px-4 py-3 font-heading font-bold uppercase text-giri-white shadow-[8px_8px_0px_0px_#2b2b2b] transition-transform duration-100 hover:-translate-x-1 hover:-translate-y-1 disabled:cursor-not-allowed"
      >
        {form.formState.isSubmitting ? "Menyimpan..." : "Kirim Pesanan"}
      </button>
    </form>
  );
}
