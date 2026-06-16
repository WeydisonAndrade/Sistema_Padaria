/**
 * Componente de pagamento Pix na confirmação do pedido.
 *
 * Exibe QR Code, código copia e cola e verifica automaticamente
 * a cada 5 segundos se o pagamento foi aprovado no Mercado Pago.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Copy, Loader2, QrCode } from "lucide-react";
import { formatPrice, getPaymentStatusLabel, getPaymentStatusColor } from "@/lib/utils";
import type { Order } from "@/types";

interface PixPaymentBoxProps {
  order: Order;
  phone: string;
  /** Callback quando o polling detecta pagamento aprovado */
  onPaymentConfirmed?: (order: Order) => void;
}

export default function PixPaymentBox({
  order,
  phone,
  onPaymentConfirmed,
}: PixPaymentBoxProps) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  // --- Estados derivados do pagamento ---
  const isPaid = currentOrder.paymentStatus === "PAID";
  const isExpired =
    currentOrder.paymentStatus === "EXPIRED" ||
    currentOrder.paymentStatus === "CANCELLED";
  const hasPix = Boolean(currentOrder.pixQrCode && currentOrder.pixQrCodeBase64);

  // --- Consulta API /api/orders/:id/payment para sincronizar com o MP ---
  const checkPayment = useCallback(async () => {
    if (isPaid || isExpired || !currentOrder.mpPaymentId) return;

    setChecking(true);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, "") }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentOrder(data);
        if (data.paymentStatus === "PAID") {
          onPaymentConfirmed?.(data);
        }
      }
    } finally {
      setChecking(false);
    }
  }, [currentOrder.id, currentOrder.mpPaymentId, isExpired, isPaid, onPaymentConfirmed, phone]);

  // --- Polling automático a cada 5s enquanto aguarda pagamento ---
  useEffect(() => {
    if (isPaid || isExpired) return;

    const interval = setInterval(() => {
      void checkPayment();
    }, 5000);

    return () => clearInterval(interval);
  }, [checkPayment, isExpired, isPaid]);

  // --- Copia código Pix copia e cola para a área de transferência ---
  async function handleCopy() {
    if (!currentOrder.pixQrCode) return;
    await navigator.clipboard.writeText(currentOrder.pixQrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // --- UI: pagamento já confirmado ---
  if (isPaid) {
    return (
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-600" />
        <p className="font-semibold text-green-800">Pagamento Pix confirmado!</p>
        <p className="mt-1 text-sm text-green-700">
          Recebemos {formatPrice(currentOrder.total)}. Seu pedido está confirmado.
        </p>
      </div>
    );
  }

  // --- UI: Pix expirado ou cancelado ---
  if (isExpired) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
        <p className="font-semibold text-red-800">Pagamento Pix expirado ou cancelado</p>
        <p className="mt-1 text-sm text-red-700">
          O prazo para pagamento encerrou. Faça um novo pedido se ainda desejar comprar.
        </p>
      </div>
    );
  }

  // --- UI: falha ao gerar dados do Pix ---
  if (!hasPix) {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-800">
        Não foi possível carregar os dados do Pix. Entre em contato com a padaria.
      </div>
    );
  }

  // --- UI: QR Code + copia e cola + botão de verificação manual ---
  return (
    <div className="mb-6 rounded-xl border border-border bg-secondary/30 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Pague com Pix</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusColor(currentOrder.paymentStatus)}`}
        >
          {getPaymentStatusLabel(currentOrder.paymentStatus)}
        </span>
      </div>

      <p className="mb-4 text-sm text-muted">
        Escaneie o QR Code ou copie o código abaixo. O pagamento expira em 30 minutos.
      </p>

      {/* Imagem do QR Code gerada pelo Mercado Pago (base64) */}
      <div className="mx-auto mb-4 flex max-w-[220px] justify-center rounded-xl border border-border bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${currentOrder.pixQrCodeBase64}`}
          alt="QR Code Pix"
          width={200}
          height={200}
          className="h-auto w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted">Pix copia e cola</label>
        <div className="flex gap-2">
          <input
            readOnly
            value={currentOrder.pixQrCode ?? ""}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void checkPayment()}
        disabled={checking}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-medium hover:bg-card disabled:opacity-50"
      >
        {checking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verificando pagamento…
          </>
        ) : (
          "Já paguei — verificar agora"
        )}
      </button>
    </div>
  );
}
