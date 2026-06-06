"use client";

import { X, Scale, Leaf, Tag, CircleDollarSign, Package } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onEdit,
}: ProductDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card shadow-xl">
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {product.imageUrl ? (
            <ProductImage src={product.imageUrl} alt={product.name} sizes="512px" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted italic">
              Sem imagem
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-card/90 p-2 shadow-sm hover:bg-card"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
              product.available
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.available ? "Disponível" : "Indisponível"}
          </span>
        </div>

        <div className="p-6">
          <p className="mb-1 text-xs font-medium tracking-widest text-gold uppercase">
            {product.category}
          </p>
          <h2 className="font-display text-2xl font-bold text-foreground">{product.name}</h2>
          <p className="mt-1 font-display text-xl font-semibold text-primary">
            {formatPrice(product.price)}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>

          <div className="mt-6 space-y-3 rounded-xl bg-secondary/50 p-4">
            <h3 className="text-xs font-medium tracking-widest text-muted uppercase">
              Especificações
            </h3>
            {product.weight && (
              <div className="flex items-center gap-2 text-sm">
                <Scale className="h-4 w-4 text-primary" />
                <span className="text-muted">Peso/Tamanho:</span>
                <span className="font-medium">{product.weight}</span>
              </div>
            )}
            {product.ingredients && (
              <div className="flex items-start gap-2 text-sm">
                <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted">Ingredientes:</span>
                <span className="font-medium">{product.ingredients}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-muted">Categoria:</span>
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CircleDollarSign className="h-4 w-4 text-primary" />
              <span className="text-muted">Preço:</span>
              <span className="font-medium">{formatPrice(product.price)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-muted">ID:</span>
              <span className="font-mono text-xs">{product.id}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Editar produto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
