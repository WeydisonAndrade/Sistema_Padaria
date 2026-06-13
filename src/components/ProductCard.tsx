"use client";

import { useState } from "react";
import { Tag, Boxes, ShoppingCart, Check } from "lucide-react";
import ProductImage from "./ProductImage";
import WhatsAppButton from "./WhatsAppButton";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, buildProductWhatsAppMessage } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  whatsapp: string;
}

export default function ProductCard({ product, whatsapp }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const message = buildProductWhatsAppMessage(product.name, product.price);
  const outOfStock = product.stockQuantity <= 0;

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
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {product.imageUrl ? (
          <ProductImage src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary to-card text-muted">
            <span className="font-display text-4xl font-bold text-primary/20">
              {product.name.charAt(0)}
            </span>
            <span className="text-xs italic">Sem imagem</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full border border-gold/30 bg-primary/90 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
          {product.category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-card/95 px-3 py-1 font-display text-base font-bold text-primary shadow-sm backdrop-blur-sm">
          {formatPrice(product.price)}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[10px] text-muted backdrop-blur-sm">
          {product.code}
        </span>
      </div>

      <div className="p-5">
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
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
