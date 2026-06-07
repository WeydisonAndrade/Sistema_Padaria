"use client";

import { X, Tag, CircleDollarSign, Package, Hash, Boxes, Calendar } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import {
  formatPrice,
  formatDate,
  getProductStatusLabel,
} from "@/lib/utils";
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
        {product.imageUrl && (
          <div className="relative aspect-video overflow-hidden bg-secondary">
            <ProductImage src={product.imageUrl} alt={product.name} sizes="512px" />
          </div>
        )}

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-xs font-medium tracking-widest text-gold uppercase">
              Consulta de Produto
            </p>
            <h2 className="font-display text-xl font-bold text-foreground">
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-sm font-medium text-primary">{product.code}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                product.active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {getProductStatusLabel(product.active)}
            </span>
          </div>

          <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
            {[
              { icon: Hash, label: "Código", value: product.code },
              { icon: Package, label: "Nome", value: product.name },
              { icon: Tag, label: "Categoria", value: product.category },
              {
                icon: CircleDollarSign,
                label: "Preço de venda",
                value: formatPrice(product.price),
              },
              {
                icon: Boxes,
                label: "Quantidade em estoque",
                value: String(product.stockQuantity),
              },
              {
                icon: Calendar,
                label: "Data de validade",
                value: formatDate(product.expirationDate),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="w-36 text-muted">{label}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
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
