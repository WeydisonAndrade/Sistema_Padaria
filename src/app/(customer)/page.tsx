/**
 * Página inicial do site da padaria.
 * Hero acolhedor de café da manhã, destaques e informações práticas.
 */

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Coffee,
  Croissant,
  Sandwich,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildGeneralWhatsAppMessage, serializeProduct } from "@/lib/utils";
import { BAKERY_NAME, BAKERY_DESCRIPTION, BAKERY_TAGLINE } from "@/lib/constants";
import { BREAKFAST_IMAGES, HERO_IMAGE } from "@/lib/images";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

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
    <div className="card-hover flex h-full w-full flex-col gap-4 rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-start sm:gap-5 sm:p-6 md:p-7">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-butter/40 to-gold/20 sm:h-14 sm:w-14">
        <Icon className="h-6 w-6 text-coffee" />
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

  const breakfastHighlights = [
    {
      image: BREAKFAST_IMAGES.bread,
      icon: Croissant,
      title: "Pão Quentinho",
      desc: "Crocante por fora, macio por dentro — saindo do forno todas as manhãs.",
      alt: "Pão francês artesanal recém-assado",
    },
    {
      image: BREAKFAST_IMAGES.pastry,
      icon: Sandwich,
      title: "Pão com Queijo",
      desc: "Combinações clássicas com queijos selecionados e frios fresquinhos.",
      alt: "Croissant e combinações para o café da manhã",
    },
    {
      image: BREAKFAST_IMAGES.coffee,
      icon: Coffee,
      title: "Café Quentinho",
      desc: "Aromático e encorpado — o par perfeito para começar o seu dia.",
      alt: "Xícara de café expresso fumegante",
    },
  ];

  return (
    <>
      {/* --- Hero: manhã acolhedora --- */}
      <section className="hero-gradient bg-bread-texture bg-grain relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-butter/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-coffee/10 blur-3xl" />
        <div className="absolute right-[10%] top-[20%] hidden opacity-40 lg:block" aria-hidden="true">
          <span className="steam-wisp" style={{ left: "0", position: "relative", display: "block" }} />
          <span className="steam-wisp" style={{ left: "12px", position: "relative", display: "block", animationDelay: "1s" }} />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-20 md:flex-row md:py-28">
          <div className="flex-1 text-center md:text-left animate-fade-up">
            <div className="section-eyebrow mb-6">
              <Coffee className="h-3.5 w-3.5 text-coffee" />
              {BAKERY_TAGLINE}
            </div>

            <h1 className="mb-3 font-display text-5xl font-bold leading-[1.05] text-foreground md:text-6xl lg:text-7xl">
              {bakeryName}
            </h1>
            <p className="mb-2 font-display text-lg italic text-coffee-light md:text-xl">
              Pão, queijo e café quentinho
            </p>
            <p className="mb-10 max-w-md text-base leading-relaxed text-muted md:text-lg">
              {settings?.description || BAKERY_DESCRIPTION}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link
                href="/produtos"
                className="btn-warm group inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-medium text-white"
              >
                Ver Cardápio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <WhatsAppButton
                phone={whatsapp}
                message={buildGeneralWhatsAppMessage(bakeryName)}
                label="Pedir Café da Manhã"
                variant="outline"
              />
            </div>
          </div>

          <div className="relative flex-1 animate-fade-up">
            <div className="relative mx-auto aspect-[4/5] max-w-sm animate-gentle-float">
              <div className="absolute -inset-4 rounded-3xl border border-gold/25 bg-gradient-to-br from-butter/20 to-crust/10" />
              <div className="relative h-full overflow-hidden rounded-2xl morning-glow">
                <Image
                  src={HERO_IMAGE}
                  alt="Mesa de café da manhã com pães artesanais"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-coffee/70 via-coffee/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-display text-2xl font-bold text-cream">
                    Feito à mão
                  </p>
                  <p className="text-sm text-cream/85">
                    Todos os dias, com o carinho de casa
                  </p>
                </div>
                <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                  ☕ Quentinho agora
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Três pilares do café da manhã --- */}
      <section className="border-y border-border bg-cream/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <p className="section-eyebrow mb-4">O ritual da manhã</p>
            <h2 className="section-title font-display text-3xl font-bold text-foreground md:text-4xl">
              Seu café da manhã perfeito
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-muted">
              O cheiro do pão assando, o queijo derretendo e o café servido na hora certa.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {breakfastHighlights.map(({ image, icon: Icon, title, desc, alt }) => (
              <article
                key={title}
                className="card-hover group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-coffee/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 shadow-sm">
                      <Icon className="h-4 w-4 text-coffee" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                  </div>
                </div>
                <p className="p-5 text-sm leading-relaxed text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- Diferenciais --- */}
      <section className="bg-secondary/40 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          {[
            {
              icon: Croissant,
              title: "Fornada Diária",
              desc: "Pães saindo quentinhos desde as primeiras horas do dia",
            },
            {
              icon: Sparkles,
              title: "Ingredientes Frescos",
              desc: "Queijos, frios e grãos selecionados para o seu café da manhã",
            },
            {
              icon: Coffee,
              title: "Café Especial",
              desc: "Moído na hora, servido quente — como manda a tradição",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-card shadow-sm">
                <Icon className="h-6 w-6 text-coffee" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Produtos em destaque --- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="section-eyebrow mb-4">Cardápio</p>
          <h2 className="section-title font-display text-4xl font-bold text-foreground">
            Favoritos da Manhã
          </h2>
          <p className="mt-6 text-muted">Os queridinhos de quem começa o dia conosco</p>
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
            className="group inline-flex items-center gap-2 font-medium text-coffee transition-colors hover:text-primary"
          >
            Ver cardápio completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* --- Horário e localização --- */}
      <section className="bg-bread-texture border-t border-border py-12 md:py-20">
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
            <p className="mt-3 text-xs italic text-coffee-light">
              Chegue cedo e pegue o pão ainda quentinho!
            </p>
          </InfoCard>

          <InfoCard icon={MapPin} title="Localização">
            <p className="break-words">
              {settings?.address || "Av. Paulista, 1000 - São Paulo"}
            </p>
            <Link
              href="/contato"
              className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-coffee hover:text-primary"
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
