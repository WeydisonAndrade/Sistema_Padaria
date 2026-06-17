"use client";

/**
 * Card de produto na vitrine do cliente: exibe imagem, preço, estoque
 * e ações para adicionar ao carrinho ou pedir via WhatsApp.
 */

import { useState } from "react";
import { Tag, Boxes, ShoppingCart, Check } from "lucide-react";
import ProductImage from "./ProductImage";
import WhatsAppButton from "./WhatsAppButton";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, buildProductWhatsAppMessage } from "@/lib/utils";
import type { Product } from "@/types";

// --- Tipos ---

interface ProductCardProps {
  product: Product;
  whatsapp: string;
}

export default function ProductCard({ product, whatsapp }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const message = buildProductWhatsAppMessage(product.name, product.price);
  const outOfStock = product.stockQuantity <= 0;

  // --- Adiciona item ao carrinho com feedback visual temporário ---
  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article className="card-hover group overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary to-butter/30">
        {product.imageUrl ? (
          <ProductImage src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary to-card text-muted">
            <span className="font-display text-4xl font-bold text-coffee/20">
              {product.name.charAt(0)}
            </span>
            <span className="text-xs italic">Sem imagem</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-coffee/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-coffee/85 px-3 py-1 text-xs font-medium tracking-wide text-cream backdrop-blur-sm">
          {product.category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full border border-gold/20 bg-cream/95 px-3 py-1 font-display text-base font-bold text-coffee shadow-sm backdrop-blur-sm">
          {formatPrice(product.price)}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[10px] text-muted backdrop-blur-sm">
          {product.code}
        </span>
      </div>

      <div className="border-t border-border/60 bg-gradient-to-b from-card to-cream/50 p-5">
        <h3 className="mb-3 font-display text-xl font-semibold text-foreground">
          {product.name}
        </h3>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted">
          <Boxes className="h-4 w-4 shrink-0 text-primary" />
          <span>
            {outOfStock
              ? "Sem estoque no momento"
              : `${product.stockQuantity} unidade(s) em estoque`}
          </span>
        </div>

        <div className="mb-5 flex items-center gap-2 text-sm text-muted">
          <Tag className="h-4 w-4 shrink-0 text-primary" />
          <span>{product.category}</span>
        </div>

        {outOfStock ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-full bg-secondary py-2.5 text-sm font-medium text-muted"
          >
            Indisponível
          </button>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-warm flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-white"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Adicionado!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar ao carrinho
                </>
              )}
            </button>
            <WhatsAppButton
              phone={whatsapp}
              message={message}
              label="Pedir pelo WhatsApp"
              variant="outline"
              className="w-full justify-center rounded-full py-2 text-sm"
            />
          </div>
        )}
      </div>
    </article>
  );
}
