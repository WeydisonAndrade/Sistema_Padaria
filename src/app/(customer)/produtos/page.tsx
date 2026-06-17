/**
 * Página de cardápio do cliente.
 * Lista produtos ativos com filtro por categoria e integração ao carrinho/WhatsApp.
 */

"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import PageHero from "@/components/PageHero";
import { PRODUCT_CATEGORIES } from "@/lib/utils";
import type { Product, BakerySettings } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<BakerySettings | null>(null);
  const [category, setCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  // --- Recarrega produtos e configurações ao mudar a categoria ---
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [productsRes, settingsRes] = await Promise.all([
        fetch(`/api/products?category=${category === "Todos" ? "" : category}`),
        fetch("/api/settings"),
      ]);
      const productsData = await productsRes.json();
      const settingsData = await settingsRes.json();
      setProducts(Array.isArray(productsData) ? productsData : []);
      setSettings(settingsData?.id ? settingsData : null);
      setLoading(false);
    }
    loadData();
  }, [category]);

  return (
    <>
      <PageHero
        title="Nosso Cardápio"
        subtitle="Pães, queijos, cafés e doces para começar o dia com sabor"
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {["Todos", ...PRODUCT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                category === cat
                  ? "btn-warm text-white"
                  : "border border-border bg-card text-muted hover:border-gold/50 hover:text-coffee"
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
