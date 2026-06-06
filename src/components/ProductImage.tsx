"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  sizes?: string;
}

export default function ProductImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: ProductImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-secondary text-muted">
        <ImageOff className="h-8 w-8" />
        <span className="text-xs italic">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-110"
      sizes={sizes}
      onError={() => setError(true)}
    />
  );
}
