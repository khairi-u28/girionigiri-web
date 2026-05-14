import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message: string;
}

export function WhatsAppButton({ phoneNumber, message }: WhatsAppButtonProps) {
  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex items-center gap-2 border-4 border-giri-black bg-[#25D366] px-4 py-3 font-heading font-bold text-giri-white shadow-[4px_4px_0px_0px_#2b2b2b] transition-transform duration-100 hover:-translate-x-1 hover:-translate-y-1"
    >
      <MessageCircle className="h-5 w-5" />
      Kirim ke WhatsApp
    </a>
  );
}
