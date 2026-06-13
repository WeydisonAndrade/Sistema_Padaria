import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  label?: string;
  variant?: "primary" | "outline" | "floating";
  className?: string;
}

export default function WhatsAppButton({
  phone,
  message,
  label = "Pedir pelo WhatsApp",
  variant = "primary",
  className = "",
}: WhatsAppButtonProps) {
  const href = buildWhatsAppLink(phone, message);

  const variants = {
    primary:
      "bg-[#25D366] text-white hover:bg-[#1da851] px-5 py-2.5 rounded-lg font-medium inline-flex items-center gap-2 transition-all hover:shadow-md",
    outline:
      "border-2 border-primary/30 text-primary bg-card hover:bg-primary hover:text-white hover:border-primary px-6 py-3 rounded-full font-medium inline-flex items-center gap-2 transition-all",
    floating:
      "fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/10 transition-all hover:bg-[#1da851] hover:scale-105 active:scale-95 md:bottom-5 md:right-5",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${variants[variant]} ${className}`}
      aria-label={label}
    >
      <MessageCircle className={variant === "floating" ? "h-5 w-5" : "h-5 w-5"} />
      {variant !== "floating" && label}
    </a>
  );
}
