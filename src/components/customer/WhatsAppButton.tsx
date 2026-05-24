import { MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message: string;
}

export function WhatsAppButton({ phoneNumber, message }: WhatsAppButtonProps) {
  const href = generateWhatsAppLink(phoneNumber, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-3 border-4 border-giri-black bg-[#25D366] px-6 py-4 text-lg font-black uppercase text-giri-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm"
    >
      <MessageCircle className="h-6 w-6" />
      Konfirmasi via WhatsApp
    </a>
  );
}
