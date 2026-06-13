"use client";

/**
 * Seção de mapa na página de contato: carrega o mapa dinamicamente
 * e oferece link externo para abrir a localização no Google Maps.
 */

import dynamic from "next/dynamic";

// --- Carregamento dinâmico do mapa (sem SSR) ---

const BakeryMap = dynamic(() => import("@/components/BakeryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center bg-secondary">
      <p className="font-display text-muted italic">Carregando mapa…</p>
    </div>
  ),
});

// --- Tipos ---

interface ContactMapSectionProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

export default function ContactMapSection({
  latitude,
  longitude,
  name,
  address,
}: ContactMapSectionProps) {
  return (
    <div>
      <BakeryMap
        latitude={latitude}
        longitude={longitude}
        name={name}
        address={address}
      />
      {/* --- Link para abrir no Google Maps --- */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
      >
        Abrir no Google Maps →
      </a>
    </div>
  );
}
