/**
 * Cabeçalho visual reutilizável das páginas do cliente.
 * Transmite a atmosfera de café da manhã com luz suave e vapor decorativo.
 */

import { BAKERY_TAGLINE } from "@/lib/constants";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export default function PageHero({
  title,
  subtitle,
  eyebrow = BAKERY_TAGLINE,
}: PageHeroProps) {
  return (
    <div className="hero-gradient bg-bread-texture page-hero relative">
      <div className="page-hero-steam" aria-hidden="true">
        <span className="steam-wisp" />
        <span className="steam-wisp" />
        <span className="steam-wisp" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <p className="section-eyebrow mb-4">{eyebrow}</p>
        <h1 className="section-title font-display text-4xl font-bold text-foreground md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-muted">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
