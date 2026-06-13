/**
 * Registro de vendas no balcão: valida itens, debita estoque
 * e persiste cada linha de venda em transação atômica.
 */

import { prisma } from "@/lib/prisma";

// --- Erro de domínio ---
export class SaleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SaleError";
  }
}

// --- Tipos de entrada e resultado ---
export interface SaleItemInput {
  productId: string;
  quantity: number;
}

export interface RegisteredSale {
  sale: {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    createdAt: Date;
  };
  product: {
    id: string;
    code: string;
    name: string;
    stockQuantity: number;
  };
}

// --- Registro de venda com validação e débito de estoque ---
export async function registerSale(
  items: SaleItemInput[]
): Promise<RegisteredSale[]> {
  if (!items.length) {
    throw new SaleError("Informe ao menos um produto para a venda.");
  }

  for (const item of items) {
    if (!item.productId) {
      throw new SaleError("Produto inválido.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new SaleError("A quantidade deve ser um número inteiro maior que zero.");
    }
  }

  return prisma.$transaction(async (tx) => {
    const results: RegisteredSale[] = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new SaleError("Produto não encontrado.");
      }

      if (!product.active) {
        throw new SaleError(`O produto "${product.name}" está inativo.`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new SaleError(
          `Estoque insuficiente para "${product.name}". Disponível: ${product.stockQuantity} unidade(s).`
        );
      }

      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });

      const sale = await tx.sale.create({
        data: {
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          total: item.quantity * product.price,
        },
      });

      results.push({
        sale,
        product: {
          id: updatedProduct.id,
          code: updatedProduct.code,
          name: updatedProduct.name,
          stockQuantity: updatedProduct.stockQuantity,
        },
      });
    }

    return results;
  });
}
