/**
 * @layer e2e
 * @flow checkout
 * Fluxo carrinho → checkout → confirmação (API Pix mockada, sem Mercado Pago real).
 */
import { test, expect } from "@playwright/test";

const ORDER_ID = "e2e-order-checkout-001";
const CUSTOMER_PHONE = "11999998888";

function mockOrderPayload() {
  return {
    id: ORDER_ID,
    orderNumber: "TP20250613-0001",
    customerName: "Cliente E2E",
    customerPhone: CUSTOMER_PHONE,
    customerEmail: "e2e@test.com",
    notes: null,
    status: "PENDING",
    paymentMethod: "PIX",
    paymentStatus: "PENDING",
    mpPaymentId: "mp-e2e-001",
    pixQrCode: "00020126580014br.gov.bcb.pix",
    pixQrCodeBase64: null,
    pixExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    subtotal: 5.5,
    total: 5.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 1,
        unitPrice: 5.5,
        total: 5.5,
        product: { code: "PAO001", name: "Pão Francês", category: "Pães" },
      },
    ],
  };
}

test.describe("Checkout do cliente", () => {
  test("carrinho vazio exibe mensagem na página de checkout", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText(/carrinho está vazio/i)).toBeVisible();
  });

  test("fluxo produtos → carrinho → checkout → confirmação Pix", async ({ page }) => {
    await page.route("**/api/orders", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: ORDER_ID, orderNumber: "TP20250613-0001" }),
        });
        return;
      }
      await route.continue();
    });

    await page.route(`**/api/orders/${ORDER_ID}*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockOrderPayload()),
      });
    });

    await page.goto("/produtos");
    await expect(
      page.getByRole("button", { name: /adicionar ao carrinho/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /adicionar ao carrinho/i }).first().click();

    await page.goto("/carrinho");
    await expect(page.getByText(/item\(ns\) selecionado/i)).toBeVisible();

    await page.getByRole("link", { name: /finalizar pedido/i }).first().click();

    await expect(page).toHaveURL(/\/checkout/);

    await page.getByLabel(/nome completo/i).fill("Cliente E2E");
    await page.getByLabel(/telefone/i).fill("(11) 99999-8888");
    await page.getByLabel(/e-mail/i).fill("e2e@test.com");

    await page.getByRole("button", { name: /pagamento pix/i }).click();

    await expect(page).toHaveURL(
      new RegExp(`/pedidos/confirmacao/${ORDER_ID}`)
    );
    await expect(
      page.getByRole("heading", { name: /pedido registrado/i })
    ).toBeVisible({ timeout: 15_000 });
  });
});
