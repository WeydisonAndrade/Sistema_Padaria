/**
 * Página inicial do site da padaria.
 * Exibe hero, diferenciais, produtos em destaque, informações e botão flutuante do WhatsApp.
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin, Sparkles, ChefHat, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildGeneralWhatsAppMessage, serializeProduct } from "@/lib/utils";
import { BAKERY_NAME, BAKERY_DESCRIPTION, BAKERY_TAGLINE } from "@/lib/constants";
import { HERO_IMAGE } from "@/lib/images";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// --- Card reutilizável para blocos de informação (horário, localização) ---
function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="card-hover flex h-full w-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-start sm:gap-5 sm:p-6 md:p-7">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 sm:h-14 sm:w-14">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="min-w-0 flex-1 text-muted">
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground sm:text-xl">
          {title}
        </h3>
        <div className="mt-2 text-sm leading-relaxed sm:text-base">{children}</div>
      </div>
    </div>
  );
}

// --- Busca configurações da padaria e produtos em destaque no servidor ---
export default async function HomePage() {
  const [settings, featuredProducts] = await Promise.all([
    prisma.bakerySettings.findUnique({ where: { id: "default" } }),
    prisma.product.findMany({
      where: { active: true, stockQuantity: { gt: 0 } },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const bakeryName = settings?.name || BAKERY_NAME;
  const whatsapp = settings?.whatsapp || "5511999999999";

  return (
    <>
      {/* --- Banner principal com CTA para cardápio e WhatsApp --- */}
      <section className="hero-gradient bg-grain relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-24 md:flex-row md:py-32">
          <div className="flex-1 text-center md:text-left animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-widest text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              {BAKERY_TAGLINE}
            </div>

            <h1 className="mb-2 font-display text-5xl font-bold leading-none text-foreground md:text-6xl lg:text-7xl">
              {bakeryName}
            </h1>
            <p className="mb-10 max-w-md text-base leading-relaxed text-muted md:text-lg">
              {settings?.description || BAKERY_DESCRIPTION}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link
                href="/produtos"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl"
              >
                Ver Cardápio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <WhatsAppButton
                phone={whatsapp}
                message={buildGeneralWhatsAppMessage(bakeryName)}
                label="Fazer Pedido"
                variant="outline"
              />
            </div>
          </div>

          <div className="relative flex-1 animate-fade-up">
            <div className="relative mx-auto aspect-[4/5] max-w-sm">
              <div className="absolute -inset-3 rounded-3xl border border-gold/30 bg-gold/5" />
              <div className="relative h-full overflow-hidden rounded-2xl shadow-2xl shadow-accent/20">
                <Image
                  src={HERO_IMAGE}
                  alt="Pães artesanais Tutti Pane"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-accent/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-display text-2xl font-bold text-white">
                    Feito à mão
                  </p>
                  <p className="text-sm text-white/80">Todos os dias, com amor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Diferenciais da padaria (tradição, ingredientes, fornada) --- */}
      <section className="border-y border-border bg-card py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3">
          {[
            { icon: ChefHat, title: "Receitas Tradicionais", desc: "Tradição passada de geração em geração" },
            { icon: Heart, title: "Ingredientes Premium", desc: "Selecionados com rigor e qualidade" },
            { icon: Sparkles, title: "Fornada Diária", desc: "Sempre fresquinho, sempre quentinho" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Grade de produtos em destaque --- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium tracking-widest text-gold uppercase">Cardápio</p>
          <h2 className="section-title font-display text-4xl font-bold text-foreground">
            Nossos Destaques
          </h2>
          <p className="mt-6 text-muted">Os favoritos dos nossos clientes</p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={serializeProduct(product)}
                whatsapp={whatsapp}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">Nenhum produto disponível no momento.</p>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/produtos"
            className="group inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary-dark"
          >
            Ver cardápio completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* --- Horário de funcionamento e localização --- */}
      <section className="bg-secondary/60 py-12 md:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-6">
          <InfoCard icon={Clock} title="Horário de Funcionamento">
            <div className="space-y-1">
              {(settings?.openingHours || "Seg-Sáb: 6h às 20h | Dom: 6h às 14h")
                .split("|")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (
                  <p key={line} className="break-words">
                    {line}
                  </p>
                ))}
            </div>
          </InfoCard>

          <InfoCard icon={MapPin} title="Localização">
            <p className="break-words">
              {settings?.address || "Av. Paulista, 1000 - São Paulo"}
            </p>
            <Link
              href="/contato"
              className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
            >
              Ver no mapa
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </InfoCard>
        </div>
      </section>

      <WhatsAppButton
        phone={whatsapp}
        message={buildGeneralWhatsAppMessage(bakeryName)}
        variant="floating"
        label="WhatsApp"
      />
    </>
  );
}
