/**
 * Conteúdo da confirmação de pedido (componente cliente).
 * Exibe QR Code Pix, detalhes do pedido e ações pós-compra (WhatsApp).
 * O PixPaymentBox faz polling até detectar pagamento aprovado.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, MessageCircle, QrCode } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import PixPaymentBox from "@/components/PixPaymentBox";
import {
  formatPrice,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  buildOrderWhatsAppMessage,
} from "@/lib/utils";
import { BAKERY_NAME, BAKERY_TAGLINE } from "@/lib/constants";
import type { Order } from "@/types";

export default function OrderConfirmationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const phone = searchParams.get("phone") ?? "";

  const [order, setOrder] = useState<Order | null>(null);
  const [whatsapp, setWhatsapp] = useState("5511999999999");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Carrega pedido e configurações (validação por telefone na query) ---
  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const [orderRes, settingsRes] = await Promise.all([
          fetch(
            `/api/orders/${orderId}?phone=${encodeURIComponent(phone.replace(/\D/g, ""))}`
          ),
          fetch("/api/settings"),
        ]);

        const orderData = await orderRes.json();
        const settingsData = await settingsRes.json();

        if (!orderRes.ok) {
          setError(orderData.error || "Pedido não encontrado.");
          setLoading(false);
          return;
        }

        setOrder(orderData);
        if (settingsData?.whatsapp) setWhatsapp(settingsData.whatsapp);
      } catch {
        setError("Erro ao carregar pedido.");
      }
      setLoading(false);
    }

    if (orderId && phone) {
      loadOrder();
    } else {
      setError("Pedido inválido.");
      setLoading(false);
    }
  }, [orderId, phone]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-red-600">{error || "Pedido não encontrado."}</p>
        <Link href="/pedidos" className="mt-4 inline-block text-primary hover:underline">
          Consultar pedidos
        </Link>
      </div>
    );
  }

  // --- Mensagem WhatsApp adaptada ao status do pagamento Pix ---
  const whatsappMessage = buildOrderWhatsAppMessage(
    BAKERY_NAME,
    order.orderNumber,
    order.total,
    order.customerName,
    order.paymentStatus === "PAID"
  );

  const isPaid = order.paymentStatus === "PAID";

  return (
    <>
      {/* --- Hero: ícone e texto mudam conforme pagamento Pix --- */}
      <div className="hero-gradient border-b border-border py-16 text-center">
        <p className="mb-2 text-xs font-medium tracking-widest text-gold uppercase">
          {BAKERY_TAGLINE}
        </p>
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isPaid ? "bg-green-100" : "bg-amber-100"
          }`}
        >
          {isPaid ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <QrCode className="h-8 w-8 text-amber-600" />
          )}
        </div>
        <h1 className="section-title font-display text-4xl font-bold text-foreground md:text-5xl">
          {isPaid ? "Pedido Confirmado!" : "Pedido registrado!"}
        </h1>
        <p className="mx-auto mt-8 max-w-md text-muted">
          {isPaid
            ? "Pagamento Pix recebido com sucesso"
            : "Pague com Pix abaixo para confirmar seu pedido"}
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* --- Bloco Pix: QR Code, copia e cola e verificação automática --- */}
          <PixPaymentBox
            order={order}
            phone={phone}
            onPaymentConfirmed={setOrder}
          />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Número do pedido</p>
              <p className="font-mono text-xl font-bold text-primary">
                {order.orderNumber}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusColor(order.status)}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <div className="mb-6 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted">Cliente</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-muted">Data</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="mb-6 divide-y divide-border rounded-xl border border-border">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span>
                  {item.quantity}x {item.product?.name ?? "Produto"}
                </span>
                <span className="font-medium">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-primary">
              {formatPrice(order.total)}
            </span>
          </div>

          <div className="space-y-3">
            <WhatsAppButton
              phone={whatsapp}
              message={whatsappMessage}
              label={
                isPaid
                  ? "Combinar entrega pelo WhatsApp"
                  : "Tirar dúvidas pelo WhatsApp"
              }
              className="w-full justify-center rounded-full"
            />
            <Link
              href="/pedidos"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium text-muted hover:bg-secondary"
            >
              <MessageCircle className="h-4 w-4" />
              Ver meus pedidos
            </Link>
            <Link
              href="/produtos"
              className="block text-center text-sm text-primary hover:underline"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
