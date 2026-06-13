/**
 * Página de confirmação de pedido (rota dinâmica).
 * Envolve o conteúdo em Suspense para suportar useSearchParams no cliente.
 */

import { Suspense } from "react";
import OrderConfirmationContent from "./OrderConfirmationContent";

// --- Fallback exibido enquanto o conteúdo do pedido carrega ---
function OrderConfirmationFallback() {
  return (
    <div className="flex justify-center py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationFallback />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
