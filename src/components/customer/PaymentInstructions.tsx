import Link from "next/link";

interface PaymentInstructionsProps {
  paymentMethod: "qris" | "cod";
  qrisUrl: string;
  orderId: string;
}

export function PaymentInstructions({ paymentMethod, qrisUrl, orderId }: PaymentInstructionsProps) {
  return (
    <div className="mt-8 border-4 border-giri-black bg-giri-white p-6 shadow-[8px_8px_0px_0px_#2b2b2b]">
      <h2 className="font-heading text-2xl font-bold text-giri-black">Instruksi Pembayaran</h2>
      {paymentMethod === "qris" ? (
        <div className="mt-4">
          <p className="text-giri-black">Silakan transfer via QRIS berikut:</p>
          <a href={qrisUrl} target="_blank" className="mt-3 inline-block text-giri-red underline">
            Buka QRIS
          </a>
        </div>
      ) : (
        <p className="mt-4 text-giri-black">Pembayaran COD: bayar saat pengiriman.</p>
      )}
      <p className="mt-4 text-sm text-giri-black">Order ID: #{orderId.slice(-8)}</p>
      <Link href={`/guest/order-history/${orderId}`} className="text-giri-red underline">
        Lihat status pesanan
      </Link>
    </div>
  );
}
