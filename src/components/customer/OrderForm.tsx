"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { MenuItem, OrderWithItems, StoreSettings } from "@/types";
import { DEPARTMENTS, DELIVERY_TYPES } from "@/lib/constants";
import {
  calculateOrderTotal,
  formatDateIndonesian,
  formatRupiah,
  getMinDeliveryDate,
} from "@/lib/utils";
import { orderFormSchema, type OrderFormInput } from "@/lib/validations";
import { formatWhatsAppMessage, generateWhatsAppLink } from "@/lib/whatsapp";
import { submitOrder } from "@/app/guest/order/actions";
import { PaymentInstructions } from "./PaymentInstructions";

interface OrderFormProps {
  menuItems: MenuItem[];
  settings: StoreSettings;
}

export function OrderForm({ menuItems, settings }: OrderFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<OrderWithItems | null>(
    null
  );

  // Tracks the active variant choice ("tidak" or "pedas") for each onigiri menuItem
  const [selectedVariants, setSelectedVariants] = useState<Record<string, "tidak" | "pedas">>(() => {
    const initial: Record<string, "tidak" | "pedas"> = {};
    menuItems.forEach((item) => {
      if (item.category === "onigiri") {
        // Match the checked defaults from guest-form.html: Tongkol defaults to pedas, others default to tidak
        if (item.name.toLowerCase().includes("tongkol")) {
          initial[item.id] = "pedas";
        } else {
          initial[item.id] = "tidak";
        }
      }
    });
    return initial;
  });
  const form = useForm<OrderFormInput>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_name: "",
      whatsapp_number: "",
      delivery_type: DELIVERY_TYPES.AUTO2000,
      department: "",
      payment_method: "cod",
      notes: "",
      items: menuItems.flatMap((item): { menu_id: string; quantity: number; variant: "pedas" | "tidak" | "none" }[] => {
        if (item.category === "onigiri") {
          return [
            { menu_id: item.id, quantity: 0, variant: "tidak" },
            { menu_id: item.id, quantity: 0, variant: "pedas" },
          ];
        }
        return [{ menu_id: item.id, quantity: 0, variant: "none" }];
      }),
    },
  });

  const deliveryType = useWatch({
    control: form.control,
    name: "delivery_type",
  });
  const items = useWatch({ control: form.control, name: "items" });
  const paymentMethod = useWatch({
    control: form.control,
    name: "payment_method",
  });

  const handleVariantChange = (itemId: string, newVariant: "tidak" | "pedas") => {
    const oldVariant = newVariant === "tidak" ? "pedas" : "tidak";
    const oldIndex = items?.findIndex(
      (i) => i.menu_id === itemId && i.variant === oldVariant
    );
    const newIndex = items?.findIndex(
      (i) => i.menu_id === itemId && i.variant === newVariant
    );

    if (
      oldIndex !== undefined &&
      oldIndex >= 0 &&
      newIndex !== undefined &&
      newIndex >= 0
    ) {
      const oldQty = items?.[oldIndex]?.quantity ?? 0;
      form.setValue(`items.${oldIndex}.quantity`, 0);
      form.setValue(`items.${newIndex}.quantity`, oldQty);
    }

    setSelectedVariants((prev) => ({
      ...prev,
      [itemId]: newVariant,
    }));
  };

  const minDate = useMemo(
    () => getMinDeliveryDate(settings.cut_off_time),
    [settings.cut_off_time]
  );
  const total = calculateOrderTotal(items ?? [], menuItems);

  useEffect(() => {
    if (deliveryType !== DELIVERY_TYPES.AUTO2000) {
      form.setValue("department", undefined);
    }
  }, [deliveryType, form]);

  async function onSubmit(values: OrderFormInput) {
    setSubmitError(null);

    const result = await submitOrder({
      ...values,
      notes: values.notes,
    });
    if ("error" in result) return setSubmitError(result.error);
    setSubmittedOrder(result.order);
  }

  /* ── Post-submit success state ── */
  if (submittedOrder) {
    const customerPhoneNumber = submittedOrder.whatsapp_number;
    const message = formatWhatsAppMessage(
      submittedOrder,
      window.location.origin
    );
    const waHref = generateWhatsAppLink(customerPhoneNumber, message);
    return (
      <section className="space-y-6">
        <div className="border-4 border-giri-black bg-giri-yellow p-6 text-center shadow-brutal">
          <p className="text-2xl font-black uppercase text-giri-black">
            ✅ Pesanan Berhasil!
          </p>
          <p className="mt-2 font-medium text-giri-black">
            Order ID: #{submittedOrder.id.slice(-8)}
          </p>
        </div>
        <PaymentInstructions
          paymentMethod={submittedOrder.payment_method}
          qrisUrl={settings.qris_url}
          orderId={submittedOrder.id}
        />
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-3 border-4 border-giri-black bg-[#25D366] px-6 py-4 text-lg font-black uppercase text-giri-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm"
        >
          📩 Kirim Ringkasan ke WhatsApp Saya
        </a>
      </section>
    );
  }

  /* ── Main order form ── */
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
      {/* ═══ SECTION 1: PILIHAN MENU ═══ */}
      <section className="relative border-4 border-giri-black bg-giri-white p-6 shadow-brutal md:p-8">
        <div className="absolute -left-4 -top-4 -rotate-3 border-2 border-giri-black bg-giri-yellow px-4 py-1 text-xl font-black shadow-brutal-sm">
          1
        </div>
        <h2 className="mb-6 border-b-2 border-dashed border-gray-300 pb-2 text-2xl font-black uppercase">
          Pilih Menu
        </h2>

        <div className="space-y-6" id="menu-container">
          {menuItems.map((item) => {
            const isOnigiri = item.category === "onigiri";
            const pedasIndex = items?.findIndex(
              (i) => i.menu_id === item.id && i.variant === "pedas"
            );
            const tidakIndex = items?.findIndex(
              (i) => i.menu_id === item.id && i.variant === "tidak"
            );
            const noneIndex = items?.findIndex(
              (i) => i.menu_id === item.id && i.variant === "none"
            );

            // Get current active variant for this onigiri
            const currentVariant = selectedVariants[item.id] || "tidak";
            const activeIndex = isOnigiri
              ? currentVariant === "tidak"
                ? tidakIndex
                : pedasIndex
              : noneIndex;

            const quantity = activeIndex !== undefined && activeIndex >= 0
              ? items?.[activeIndex]?.quantity ?? 0
              : 0;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 border-2 border-giri-black p-4"
              >
                <div className="flex-grow">
                  <h3 className="font-black text-lg uppercase">{item.name}</h3>
                  <p className="font-bold text-giri-red">{formatRupiah(item.price)}</p>

                  {/* Opsi Pedas for Onigiri */}
                  {isOnigiri && (
                    <div className="mt-3 flex gap-3">
                      <label className="cursor-pointer relative">
                        <input
                          type="radio"
                          name={`spicy_${item.id}`}
                          value="tidak"
                          checked={currentVariant === "tidak"}
                          onChange={() => handleVariantChange(item.id, "tidak")}
                          className="peer sr-only brutal-radio"
                        />
                        <div className="border-2 border-giri-black bg-giri-white px-3 py-1 text-xs font-bold uppercase transition-all hover:-translate-y-1 hover:shadow-brutal-sm peer-checked:bg-giri-red peer-checked:text-giri-white peer-checked:shadow-brutal-sm">
                          Tidak Pedas
                        </div>
                      </label>
                      <label className="cursor-pointer relative">
                        <input
                          type="radio"
                          name={`spicy_${item.id}`}
                          value="pedas"
                          checked={currentVariant === "pedas"}
                          onChange={() => handleVariantChange(item.id, "pedas")}
                          className="peer sr-only brutal-radio"
                        />
                        <div className="border-2 border-giri-black bg-giri-white px-3 py-1 text-xs font-bold uppercase transition-all hover:-translate-y-1 hover:shadow-brutal-sm peer-checked:bg-giri-red peer-checked:text-giri-white peer-checked:shadow-brutal-sm">
                          Pedas 🌶️
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex items-center border-2 border-giri-black bg-giri-white h-10 shadow-brutal-sm">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeIndex !== undefined && activeIndex >= 0) {
                        form.setValue(
                          `items.${activeIndex}.quantity`,
                          Math.max(quantity - 1, 0)
                        );
                      }
                    }}
                    className="w-10 h-full flex items-center justify-center hover:bg-giri-red hover:text-giri-white font-black text-xl border-r-2 border-giri-black transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-12 h-full text-center font-bold outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (activeIndex !== undefined && activeIndex >= 0) {
                        form.setValue(
                          `items.${activeIndex}.quantity`,
                          quantity + 1
                        );
                      }
                    }}
                    className="w-10 h-full flex items-center justify-center hover:bg-giri-black hover:text-giri-white font-black text-xl border-l-2 border-giri-black transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ SECTION 2: DETAIL PENGIRIMAN ═══ */}
      <section className="relative border-4 border-giri-black bg-giri-white p-6 shadow-brutal md:p-8">
        <div className="absolute -left-4 -top-4 -rotate-3 border-2 border-giri-black bg-giri-yellow px-4 py-1 text-xl font-black shadow-brutal-sm">
          2
        </div>
        <h2 className="mb-6 border-b-2 border-dashed border-gray-300 pb-2 text-2xl font-black uppercase">
          Detail Pengiriman
        </h2>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-black uppercase">
              Nama Pemesan <span className="text-giri-red">*</span>
            </label>
            <input
              {...form.register("customer_name")}
              placeholder="Masukkan nama lengkap..."
              className="brutal-input w-full border-2 border-giri-black bg-giri-white p-3 font-medium transition-shadow"
            />
            {form.formState.errors.customer_name && (
              <p className="mt-1 text-xs font-bold text-giri-red">
                {form.formState.errors.customer_name.message}
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="mb-2 block text-sm font-black uppercase">
              No. WhatsApp <span className="text-giri-red">*</span>
            </label>
            <input
              {...form.register("whatsapp_number")}
              placeholder="08xxxxxxxxxx"
              className="brutal-input w-full border-2 border-giri-black bg-giri-white p-3 font-medium transition-shadow"
            />
            {form.formState.errors.whatsapp_number && (
              <p className="mt-1 text-xs font-bold text-giri-red">
                {form.formState.errors.whatsapp_number.message}
              </p>
            )}
          </div>

          {/* Delivery type */}
          <div>
            <label className="mb-3 block text-sm font-black uppercase">
              Pilih Lokasi Pengiriman{" "}
              <span className="text-giri-red">*</span>
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  value={DELIVERY_TYPES.AUTO2000}
                  {...form.register("delivery_type")}
                  className="peer sr-only"
                />
                <div
                  className={`flex h-full flex-col items-center gap-2 border-2 border-giri-black p-4 text-center font-bold uppercase transition-all hover:-translate-y-1 hover:shadow-brutal ${
                    deliveryType === DELIVERY_TYPES.AUTO2000
                      ? "bg-giri-red text-giri-white shadow-brutal-sm"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">🏢</span>
                  <span>Kantor (Khairi)</span>
                </div>
              </label>
              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  value={DELIVERY_TYPES.EXTERNAL}
                  {...form.register("delivery_type")}
                  className="peer sr-only"
                />
                <div
                  className={`flex h-full flex-col items-center gap-2 border-2 border-giri-black p-4 text-center font-bold uppercase transition-all hover:-translate-y-1 hover:shadow-brutal ${
                    deliveryType === DELIVERY_TYPES.EXTERNAL
                      ? "bg-giri-red text-giri-white shadow-brutal-sm"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">🏠</span>
                  <span>Alamat Lain (Cipayung)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional detail field */}
          <div id="address_container" className="border-l-4 border-giri-black bg-gray-100 p-4">
            {deliveryType === DELIVERY_TYPES.AUTO2000 ? (
              <div>
                <label id="address_label" className="mb-2 block text-sm font-bold uppercase">
                  Nama &amp; Divisi (Contoh: Khairi - IT) <span className="text-giri-red">*</span>
                </label>
                <textarea
                  {...form.register("department")}
                  rows={2}
                  className="w-full resize-none border-2 border-giri-black bg-giri-white p-3 font-medium focus:outline-none focus:shadow-brutal-sm transition-shadow"
                  placeholder="Masukkan detail divisi / meja kantor..."
                />
                {form.formState.errors.department && (
                  <p className="mt-1 text-xs font-bold text-giri-red">
                    {form.formState.errors.department.message}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label id="address_label" className="mb-2 block text-sm font-bold uppercase">
                  Alamat Lengkap (Area Cipayung) <span className="text-giri-red">*</span>
                </label>
                <textarea
                  {...form.register("notes")}
                  rows={2}
                  className="w-full resize-none border-2 border-giri-black bg-giri-white p-3 font-medium focus:outline-none focus:shadow-brutal-sm transition-shadow"
                  placeholder="Masukkan alamat rumah lengkap dengan RT/RW dan patokan..."
                />
                {form.formState.errors.notes && (
                  <p className="mt-1 text-xs font-bold text-giri-red">
                    {form.formState.errors.notes.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Delivery date */}
          <div>
            <label className="mb-2 block text-sm font-black uppercase">
              Tanggal Pengiriman <span className="text-giri-red">*</span>
            </label>
            <input
              type="date"
              {...form.register("delivery_date", { valueAsDate: true })}
              min={minDate.toISOString().slice(0, 10)}
              className="brutal-input border-2 border-giri-black bg-giri-white p-3 font-bold uppercase transition-shadow"
            />
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-giri-red">
              * Minimal H+1 dari tanggal order.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: PEMBAYARAN ═══ */}
      <section className="relative border-4 border-giri-black bg-giri-white p-6 shadow-brutal md:p-8">
        <div className="absolute -left-4 -top-4 -rotate-3 border-2 border-giri-black bg-giri-yellow px-4 py-1 text-xl font-black shadow-brutal-sm">
          3
        </div>
        <h2 className="mb-6 border-b-2 border-dashed border-gray-300 pb-2 text-2xl font-black uppercase">
          Metode Pembayaran
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="cursor-pointer relative">
            <input
              type="radio"
              value="cod"
              {...form.register("payment_method")}
              className="peer sr-only"
            />
            <div
              className={`flex h-full flex-col justify-center border-2 border-giri-black p-4 font-bold uppercase transition-all hover:-translate-y-1 hover:shadow-brutal ${
                paymentMethod === "cod"
                  ? "bg-giri-red text-giri-white shadow-brutal-sm"
                  : "bg-gray-50"
              }`}
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <span className="text-lg">Bayar Langsung</span>
              </div>
              <p className="text-xs font-medium normal-case opacity-80">
                Bayar ke Khairi / Adik saat makanan diantar.
              </p>
            </div>
          </label>
          <label className="cursor-pointer relative">
            <input
              type="radio"
              value="qris"
              {...form.register("payment_method")}
              className="peer sr-only"
            />
            <div
              className={`flex h-full flex-col justify-center border-2 border-giri-black p-4 font-bold uppercase transition-all hover:-translate-y-1 hover:shadow-brutal ${
                paymentMethod === "qris"
                  ? "bg-giri-red text-giri-white shadow-brutal-sm"
                  : "bg-gray-50"
              }`}
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <span className="text-lg">QRIS / Transfer</span>
              </div>
              <p className="text-xs font-medium normal-case opacity-80">
                Lanjut konfirmasi bukti transfer via WhatsApp.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* ═══ FLOATING TOTAL & SUBMIT ═══ */}
      <div className="sticky bottom-4 z-40">
        <div className="flex flex-col items-center justify-between gap-4 border-4 border-giri-red bg-giri-black p-4 shadow-brutal-lg transition-transform hover:-translate-y-1 sm:flex-row md:p-6">
          <div className="text-center text-giri-white sm:text-left">
            <span className="block text-sm font-bold uppercase tracking-widest text-gray-400">
              Total Tagihan
            </span>
            <span className="block text-3xl font-black text-giri-yellow">
              {formatRupiah(total)}
            </span>
          </div>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full border-4 border-giri-white bg-giri-red px-8 py-4 text-lg font-black uppercase text-giri-white shadow-brutal-white transition-colors hover:bg-white hover:text-giri-red sm:w-auto"
          >
            {form.formState.isSubmitting ? "Memproses..." : "Selesaikan PO"}
          </button>
        </div>
        {submitError && (
          <p className="mt-2 border-2 border-giri-red bg-giri-white p-3 text-center text-sm font-bold text-giri-red">
            {submitError}
          </p>
        )}
      </div>
    </form>
  );
}
