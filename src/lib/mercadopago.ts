/**
 * Cliente Mercado Pago e criação de pagamentos Pix.
 */

import { MercadoPagoConfig, Payment } from "mercadopago";

// --- Configuração do access token ---
function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN não configurado. Adicione ao arquivo .env."
    );
  }
  return token;
}

function getPaymentClient(): Payment {
  const client = new MercadoPagoConfig({ accessToken: getAccessToken() });
  return new Payment(client);
}

export interface PixPaymentResult {
  mpPaymentId: string;
  pixQrCode: string;
  pixQrCodeBase64: string;
  pixExpiresAt: Date;
  ticketUrl: string | null;
}

// --- Cria cobrança Pix vinculada ao pedido ---
export async function createPixPayment(input: {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}): Promise<PixPaymentResult> {
  const payment = getPaymentClient();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const nameParts = input.customerName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "Cliente";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const response = await payment.create({
    body: {
      transaction_amount: input.amount,
      description: `Pedido ${input.orderNumber} - Tutti Pane`,
      payment_method_id: "pix",
      external_reference: input.orderId,
      date_of_expiration: expiresAt.toISOString(),
      payer: {
        email: input.customerEmail,
        first_name: firstName,
        last_name: lastName,
      },
    },
    requestOptions: {
      idempotencyKey: `order-${input.orderId}`,
    },
  });

  const transactionData = response.point_of_interaction?.transaction_data;

  if (!response.id || !transactionData?.qr_code || !transactionData.qr_code_base64) {
    throw new Error("Resposta inválida do Mercado Pago ao gerar Pix.");
  }

  return {
    mpPaymentId: String(response.id),
    pixQrCode: transactionData.qr_code,
    pixQrCodeBase64: transactionData.qr_code_base64,
    pixExpiresAt: expiresAt,
    ticketUrl: transactionData.ticket_url ?? null,
  };
}

// --- Consulta status de um pagamento no Mercado Pago ---
export async function getMercadoPagoPayment(mpPaymentId: string) {
  const payment = getPaymentClient();
  return payment.get({ id: mpPaymentId });
}
