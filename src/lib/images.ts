/**
 * Caminhos das imagens locais em public/images/.
 * Arquivos servidos pelo Next.js a partir da pasta public/.
 */

// --- Hero da página inicial ---
export const HERO_IMAGE = "/images/products/hero-padaria.jpg";

// --- Imagens padrão dos produtos de exemplo (seed) ---
export const PRODUCT_IMAGES = {
  PAO001: "/images/products/pao-frances.jpg",
  PAO002: "/images/products/pao-forma-integral.jpg",
  BOL001: "/images/products/bolo-chocolate.jpg",
  DOC001: "/images/products/croissant.jpg",
  SAL001: "/images/products/empada-frango.jpg",
  BEB001: "/images/products/cafe-expresso.jpg",
} as const;

// --- Ícones do mapa (Leaflet) ---
export const MAP_MARKER_ICON = "/images/map/marker-icon.png";
export const MAP_MARKER_ICON_2X = "/images/map/marker-icon-2x.png";
export const MAP_MARKER_SHADOW = "/images/map/marker-shadow.png";
