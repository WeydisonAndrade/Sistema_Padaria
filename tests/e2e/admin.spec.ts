/**
 * @layer e2e
 * @flow admin
 * Fluxos críticos do painel administrativo.
 */
import { test, expect } from "@playwright/test";

test.describe("Painel admin", () => {
  test("rota /admin redireciona para login sem sessão", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login com credenciais inválidas exibe erro", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/e-mail/i).fill("invalido@test.com");
    await page.getByLabel(/senha/i).fill("senhaerrada");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(/credenciais|inválid/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("login com credenciais válidas acessa dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/e-mail/i).fill("admin@padaria.com");
    await page.getByLabel(/senha/i).fill("admin123");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
    await expect(page.getByText(/olá|dashboard|painel/i).first()).toBeVisible();
  });
});
