import { Page, Locator, expect } from "@playwright/test";
import { urls } from "../fixtures/urls";

export class ProductsPage {
  readonly page: Page;

  // 🎯 Locators
  readonly productNames: Locator;
  readonly productCards: Locator;
  readonly btnViewProduct: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Selectores con data-cy (estables)
    this.productNames = page.locator('[data-cy="card-info-name"]');
    this.productCards = page.locator('a[data-cy="view-details"]:has(button)');
    this.btnViewProduct = page.locator('a[data-cy="view-details"]:has(button)');
  }

  async goto() {
    await this.page.goto(urls.shop.products);
  }

  async gotoByEnv(env: "stage" | "live", port?: string) {
    await this.page.goto(
      env === "live" ? urls.shopLive.products : urls.shop.products,
    );
    if (port) {
      const url = new URL(this.page.url());
      url.port = port;
      console.log(`🔀 Redirigiendo productos a puerto ${port}: ${url.href}`);
      await this.page.goto(url.href);
    }
  }

  // ✅ Esperar que la página cargue
  async verifyPageLoaded() {
    await expect(this.productNames.first()).toBeVisible();
  }

  // ✅ Seleccionar producto por nombre
  async selectProductByName(productName: string) {
    await this.page
      .locator('a[data-cy="view-details"]')
      .getByText(productName, { exact: true })
      .click();
  }

  // ✅ Seleccionar el primer producto
  async selectFirstProduct() {
    await this.productCards.first().click();
  }

  // ✅ Hacer hover y clic en View Product
  async hoverAndViewProduct(productName: string) {
    const product = this.page.locator('[data-cy="card-info-name"]', {
      hasText: productName,
    });
    await product.hover();
    await this.page
      .locator('a[data-cy="view-details"]:has(button)', {
        hasText: productName,
      })
      .click();
  }
}
