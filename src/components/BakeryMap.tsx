"use client";

/**
 * Mapa interativo (Leaflet) com marcador na localização da padaria,
 * carregado apenas no cliente para evitar erros de SSR.
 */

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Tipos ---

interface BakeryMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

export default function BakeryMap({
  latitude,
  longitude,
  name,
  address,
}: BakeryMapProps) {
  const [icon, setIcon] = useState<Icon | null>(null);

  // --- Carrega ícone padrão do Leaflet no cliente ---
  useEffect(() => {
    import("leaflet").then((L) => {
      setIcon(
        L.default.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      );
    });
  }, []);

  // --- Placeholder enquanto o ícone não está pronto ---
  if (!icon) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-border bg-secondary">
        <p className="font-display text-muted italic">Carregando mapa…</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-xl border border-border shadow-sm">
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <strong>{name}</strong>
            <br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
