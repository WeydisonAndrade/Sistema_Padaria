import { Scale, Leaf } from "lucide-react";
import ProductImage from "./ProductImage";
import WhatsAppButton from "./WhatsAppButton";
import { formatPrice, buildProductWhatsAppMessage } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  whatsapp: string;
}

export default function ProductCard({ product, whatsapp }: ProductCardProps) {
  const message = buildProductWhatsAppMessage(product.name, product.price);

  return (
    <article className="card-hover group overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {product.imageUrl ? (
          <ProductImage src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-muted italic">
            Sem imagem
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full border border-gold/30 bg-primary/90 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
          {product.category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-card/95 px-3 py-1 font-display text-base font-bold text-primary shadow-sm backdrop-blur-sm">
          {formatPrice(product.price)}
        </span>
      </div>

      <div className="p-5">
        <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
          {product.name}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted">
          {product.description}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {product.weight && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted">
              <Scale className="h-3 w-3" />
              {product.weight}
            </span>
          )}
          {product.ingredients && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted">
              <Leaf className="h-3 w-3" />
              {product.ingredients.slice(0, 30)}
              {product.ingredients.length > 30 ? "…" : ""}
            </span>
          )}
        </div>

        <WhatsAppButton
          phone={whatsapp}
          message={message}
          className="w-full justify-center rounded-full"
        />
      </div>
    </article>
  );
}
