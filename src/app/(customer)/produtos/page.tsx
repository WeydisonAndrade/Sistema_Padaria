"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { PRODUCT_CATEGORIES } from "@/lib/utils";
import { BAKERY_TAGLINE } from "@/lib/constants";
import type { Product, BakerySettings } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<BakerySettings | null>(null);
  const [category, setCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [productsRes, settingsRes] = await Promise.all([
        fetch(`/api/products?category=${category === "Todos" ? "" : category}`),
        fetch("/api/settings"),
      ]);
      const productsData = await productsRes.json();
      const settingsData = await settingsRes.json();
      setProducts(productsData);
      setSettings(settingsData);
      setLoading(false);
    }
    loadData();
  }, [category]);

  return (
    <>
      <div className="hero-gradient border-b border-border py-16 text-center">
        <p className="mb-2 text-xs font-medium tracking-widest text-gold uppercase">
          {BAKERY_TAGLINE}
        </p>
        <h1 className="section-title font-display text-4xl font-bold text-foreground md:text-5xl">
          Nosso Cardápio
        </h1>
        <p className="mx-auto mt-8 max-w-md text-muted">
          Escolha seus favoritos e peça pelo WhatsApp — entregamos fresquinho!
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {["Todos", ...PRODUCT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                category === cat
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "border border-border bg-card text-muted hover:border-gold/50 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted">Carregando produtos…</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsapp={settings?.whatsapp || "5511999999999"}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-xl text-muted">
              Nenhum produto nesta categoria.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
