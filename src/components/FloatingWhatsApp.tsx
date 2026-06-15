import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "556298341044";

export function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Gostaria de mais informações sobre os produtos da VGM Medical.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar no WhatsApp"
      className="fixed bottom-6 left-6 z-[60] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe57]"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Consultar no WhatsApp</span>
    </a>
  );
}
