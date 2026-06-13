import { prisma } from "@/lib/prisma";

export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  items: OrderItemInput[];
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

async function generateOrderNumber(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<string> {
  const now = new Date();
  const prefix = `TP${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const count = await tx.order.count({
    where: { orderNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

export async function createOrder(input: CreateOrderInput) {
  const { customerName, customerPhone, customerEmail, notes, items } = input;

  if (!customerName?.trim()) {
    throw new OrderError("Informe seu nome.");
  }

  if (!customerPhone?.trim()) {
    throw new OrderError("Informe seu telefone.");
  }

  if (!items.length) {
    throw new OrderError("Adicione produtos ao pedido.");
  }

  for (const item of items) {
    if (!item.productId) {
      throw new OrderError("Produto inválido.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new OrderError("A quantidade deve ser um número inteiro maior que zero.");
    }
  }

  return prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx);
    let subtotal = 0;
    const orderItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new OrderError("Produto não encontrado.");
      }

      if (!product.active) {
        throw new OrderError(`O produto "${product.name}" está indisponível.`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new OrderError(
          `Estoque insuficiente para "${product.name}". Disponível: ${product.stockQuantity} unidade(s).`
        );
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        total: lineTotal,
      });

      await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, ""),
        customerEmail: customerEmail?.trim() || null,
        notes: notes?.trim() || null,
        status: "PENDING",
        subtotal,
        total: subtotal,
        items: { create: orderItemsData },
      },
      include: {
        items: {
          include: {
            product: {
              select: { code: true, name: true, category: true },
            },
          },
        },
      },
    });

    return order;
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
    throw new OrderError("Status inválido.");
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new OrderError("Pedido não encontrado.");
    }

    if (order.status === status) {
      return order;
    }

    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: { code: true, name: true, category: true },
            },
          },
        },
      },
    });
  });
}
