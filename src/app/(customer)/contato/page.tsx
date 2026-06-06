import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactMapSection from "@/components/ContactMapSection";
import { buildGeneralWhatsAppMessage } from "@/lib/utils";
import { BAKERY_NAME, BAKERY_TAGLINE } from "@/lib/constants";

export default async function ContactPage() {
  const settings = await prisma.bakerySettings.findUnique({
    where: { id: "default" },
  });

  const bakeryName = settings?.name || BAKERY_NAME;
  const whatsapp = settings?.whatsapp || "5511999999999";
  const latitude = settings?.latitude ?? -23.5614;
  const longitude = settings?.longitude ?? -46.6559;
  const address = settings?.address || "Av. Paulista, 1000 - São Paulo";

  return (
    <>
      <div className="hero-gradient border-b border-border py-16 text-center">
        <p className="mb-2 text-xs font-medium tracking-widest text-gold uppercase">
          {BAKERY_TAGLINE}
        </p>
        <h1 className="section-title font-display text-4xl font-bold text-foreground md:text-5xl">
          Contato & Localização
        </h1>
        <p className="mx-auto mt-8 max-w-md text-muted">
          Venha nos visitar ou faça seu pedido pelo WhatsApp
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <ContactMapSection
              latitude={latitude}
              longitude={longitude}
              name={bakeryName}
              address={address}
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <h2 className="mb-6 font-display text-2xl font-semibold text-foreground">
                Informações
              </h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Endereço", value: address },
                  { icon: Phone, label: "Telefone", value: settings?.phone || whatsapp },
                  {
                    icon: Clock,
                    label: "Horário",
                    value: settings?.openingHours || "Seg-Sáb: 6h às 20h | Dom: 6h às 14h",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium tracking-widest text-gold uppercase">
                        {label}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#25D366]/20 bg-gradient-to-br from-[#25D366]/5 to-[#25D366]/10 p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/20">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  WhatsApp
                </h2>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-muted">
                Faça seu pedido diretamente pelo WhatsApp. Respondemos rapidamente!
              </p>
              <WhatsAppButton
                phone={whatsapp}
                message={buildGeneralWhatsAppMessage(bakeryName)}
                label="Iniciar Conversa no WhatsApp"
                className="w-full justify-center rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
