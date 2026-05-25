import Image from "next/image";
import Link from "next/link";

interface PaymentInstructionsProps {
  paymentMethod: "qris" | "cod";
  qrisUrl: string;
  orderId: string;
}

export function PaymentInstructions({
  paymentMethod,
  qrisUrl,
  orderId,
}: PaymentInstructionsProps) {
  return (
    <div className="border-4 border-giri-black bg-giri-white p-6 shadow-brutal md:p-8">
      <h3 className="mb-4 text-2xl font-black uppercase">
        {paymentMethod === "qris" ? "📱 Instruksi QRIS" : "💵 Bayar di Tempat"}
      </h3>

      {paymentMethod === "qris" ? (
        <div className="space-y-4">
          {qrisUrl ? (
            <div className="mx-auto w-fit border-4 border-giri-black bg-giri-white p-3 shadow-brutal-sm">
              <Image
                src={qrisUrl}
                alt="QRIS Code"
                width={240}
                height={240}
                className="object-contain"
              />
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-500">
              QRIS belum dikonfigurasi. Hubungi admin.
            </p>
          )}
          <p className="font-medium text-gray-600">
            Scan QR di atas menggunakan aplikasi e-wallet kamu, lalu kirim bukti transfer via WhatsApp.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-l-4 border-giri-yellow bg-gray-50 p-4">
            <p className="font-bold text-giri-black">
              Siapkan uang pas saat pesanan diantar ya! 💰
            </p>
          </div>
          <p className="font-medium text-gray-600">
            Pembayaran langsung ke Khairi / Adik saat makanan tiba di lokasi.
          </p>
        </div>
      )}

      <div className="mt-6 border-t-4 border-dashed border-giri-black pt-4">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Order ID: #{orderId.slice(-8)}
        </p>
        <Link
          href={`/guest/order-history/${orderId}`}
          className="mt-2 inline-block border-2 border-giri-black bg-giri-yellow px-4 py-2 text-sm font-black uppercase shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Lacak Pesanan →
        </Link>
      </div>
    </div>
  );
}
