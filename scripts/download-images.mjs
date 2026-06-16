/**
 * Baixa imagens externas para public/images/.
 * Uso: node scripts/download-images.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public", "images");

const downloads = [
  {
    dir: "products",
    file: "pao-frances.jpg",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  },
  {
    dir: "products",
    file: "hero-padaria.jpg",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=85",
  },
  {
    dir: "products",
    file: "pao-forma-integral.jpg",
    url: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&q=80",
  },
  {
    dir: "products",
    file: "bolo-chocolate.jpg",
    url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80",
  },
  {
    dir: "products",
    file: "croissant.jpg",
    url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
  },
  {
    dir: "products",
    file: "empada-frango.jpg",
    url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  },
  {
    dir: "products",
    file: "cafe-expresso.jpg",
    url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
  },
  {
    dir: "map",
    file: "marker-icon.png",
    url: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  },
  {
    dir: "map",
    file: "marker-icon-2x.png",
    url: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  },
  {
    dir: "map",
    file: "marker-shadow.png",
    url: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar ${url}: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buffer);
}

async function main() {
  for (const item of downloads) {
    const dir = join(publicDir, item.dir);
    await mkdir(dir, { recursive: true });
    const dest = join(dir, item.file);
    process.stdout.write(`Baixando ${item.dir}/${item.file}... `);
    await download(item.url, dest);
    process.stdout.write("ok\n");
  }
  console.log("Imagens salvas em public/images/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
