import { Page, Locator, expect } from "@playwright/test";

export class ProductDetailPage {
  readonly page: Page;

  // 🎯 Locators
  readonly checkboxCart: Locator;
  readonly checkboxSubscription: Locator;
  readonly labelCheckboxCart: Locator;
  readonly labelCheckboxSubscription: Locator;
  readonly btnPlus: Locator;
  readonly btnMinus: Locator;
  readonly inputQuantity: Locator;
  readonly btnAddToCart: Locator;

  constructor(page: Page) {
    this.page = page;

    this.checkboxCart = page.locator(
      '[data-test="one-time-checkbox"] input[type="checkbox"]',
    );
    this.checkboxSubscription = page.locator(
      '[data-test="subscribe-checkbox"] input[type="checkbox"]',
    );

    this.labelCheckboxCart = page.locator(
      '[data-test="one-time-checkbox"] label:has(input[type="checkbox"])',
    );
    this.labelCheckboxSubscription = page.locator(
      '[data-test="subscribe-checkbox"] label:has(input[type="checkbox"])',
    );

    const productDetail = page
      .locator('[data-cy="modify-product-from-detail"]')
      .locator("..");

    // ✅ Por data-cy (estables)
    this.btnPlus = page
      .locator('[data-test="quantity-increase-button"]')
      .first();
    this.btnMinus = page
      .locator('[data-test="quantity-decrease-button"]')
      .first();
    this.inputQuantity = page.locator('[data-test="quantity-value"]').first();
    this.btnAddToCart = page.locator('[data-test="add-to-cart-button"]');
  }

  // ✅ Verificar que estamos en la página de detalle
  async verifyPageLoaded() {
    await expect(this.btnAddToCart).toBeVisible();
    await expect(this.inputQuantity).toBeVisible();

    await this.page.waitForTimeout(800);
  }

  private async isEventuallyPresent(
    locator: Locator,
    timeout = 5000,
  ): Promise<boolean> {
    return locator
      .waitFor({ state: "attached", timeout })
      .then(() => true)
      .catch(() => false);
  }

  private async setCheckboxState(
    checkbox: Locator,
    clickTarget: Locator,
    want: boolean,
    label: string,
  ) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (isChecked === want) return;
      await clickTarget.click({ force: true });
      await this.page.waitForTimeout(300);
    }

    const finalState = await checkbox.isChecked().catch(() => false);
    if (finalState !== want) {
      console.log(
        `⚠️ Checkbox '${label}' no quedó en el estado esperado (quería ${want}, quedó en ${finalState})`,
      );
    }
  }

  async selectPurchaseType(type: "cart" | "subscription") {
    const wantCartChecked = type === "cart";
    const wantSubscriptionChecked = type === "subscription";

    if (await this.isEventuallyPresent(this.checkboxCart)) {
      await this.setCheckboxState(
        this.checkboxCart,
        this.labelCheckboxCart,
        wantCartChecked,
        "one-time",
      );
    } else if (wantCartChecked) {
      console.log(
        "⏭️ Sin checkbox 'one-time' en este producto (probablemente solo-suscripción)",
      );
    }

    if (await this.isEventuallyPresent(this.checkboxSubscription)) {
      await this.setCheckboxState(
        this.checkboxSubscription,
        this.labelCheckboxSubscription,
        wantSubscriptionChecked,
        "subscribe",
      );
    } else if (wantSubscriptionChecked) {
      console.log(
        "⏭️ Sin checkbox 'subscribe' en este producto (ya viene seleccionado por defecto o no aplica)",
      );
    }

    if (await this.isEventuallyPresent(this.checkboxCart)) {
      await this.setCheckboxState(
        this.checkboxCart,
        this.labelCheckboxCart,
        wantCartChecked,
        "one-time",
      );
    }
    if (await this.isEventuallyPresent(this.checkboxSubscription)) {
      await this.setCheckboxState(
        this.checkboxSubscription,
        this.labelCheckboxSubscription,
        wantSubscriptionChecked,
        "subscribe",
      );
    }
  }

  async setQuantity(quantity: number) {
    const currentText = await this.inputQuantity.textContent();
    const current = parseInt(currentText?.trim() || "2", 10);
    const diff = quantity - current;

    if (diff > 0) {
      await this.increaseQuantity(diff);
    } else if (diff < 0) {
      await this.decreaseQuantity(-diff);
    }
  }

  // ✅ Aumentar cantidad con el botón +
  async increaseQuantity(times: number = 1) {
    for (let i = 0; i < times; i++) {
      await this.btnPlus.click();
    }
  }

  // ✅ Disminuir cantidad con el botón -
  async decreaseQuantity(times: number = 1) {
    for (let i = 0; i < times; i++) {
      await this.btnMinus.click();
    }
  }

  // ✅ Agregar al carrito
  async addToCart() {
    await this.btnAddToCart.click();
  }

  // ✅ Flujo completo: seleccionar tipo + cantidad + agregar
  async addProductToCart(type: "cart" | "subscription", quantity: number = 1) {
    await this.verifyPageLoaded();
    await this.selectPurchaseType(type);
    await this.setQuantity(quantity);
    await this.addToCart();
  }
}
