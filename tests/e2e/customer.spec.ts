/**
 * @layer e2e
 * @flow customer
 * Fluxos críticos do site público.
 */
import { test, expect } from "@playwright/test";

test.describe("Site do cliente", () => {
  test("página inicial carrega com nome da padaria", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Tutti Pane|padaria/i).first()).toBeVisible();
  });

  test("navega para o cardápio e exibe título", async ({ page }) => {
    await page.goto("/produtos");
    await expect(
      page.getByRole("heading", { name: /cardápio/i })
    ).toBeVisible();
  });

  test("página de contato exibe mapa ou informações", async ({ page }) => {
    await page.goto("/contato");
    await expect(
      page.getByRole("heading", { name: /contato/i })
    ).toBeVisible();
  });
});
