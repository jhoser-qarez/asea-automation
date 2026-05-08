import { Page, Locator, expect } from "@playwright/test";

export class CartModalPage {
  readonly page: Page;

  // 🎯 Locators
  readonly modal: Locator;
  readonly btnClose: Locator;
  readonly productNameInCart: Locator;
  readonly productNameInSubs: Locator;
  readonly orderTotalAmount: Locator;
  readonly subscriptionTotal: Locator;
  readonly btnContinueShopping: Locator;
  readonly btnCheckout: Locator;
  readonly btnNext: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Por data-cy
    this.modal = page.locator('[data-cy="summary-cart-displayed"]');
    this.btnClose = page.locator('[data-cy="summary-cart-close-btn"]');
    this.productNameInCart = page.locator(
      '[data-cy="row-summary-cart-name-product"]',
    );
    this.productNameInSubs = page.locator(
      '[data-cy="row-summary-box-name-product"]',
    );
    this.orderTotalAmount = page.locator(
      '[data-cy="summary-order-totalAmount"]',
    );
    this.subscriptionTotal = page.locator(
      '[data-cy="summary-subscription-totalAmount"]',
    );

    // ✅ Por texto (no tienen data-cy)
    this.btnContinueShopping = page.locator(
      ".checkout-page-button-continue button.v-btn--outlined",
    );
    this.btnCheckout = page.locator(
      ".checkout-page-button-continue button.primary:not(.v-btn--outlined)",
    );
    this.btnNext = page.locator(
      ".checkout-page-button-continue button.primary:not(.v-btn--outlined)",
    );
  }

  // ✅ Verificar que el modal está visible
  async verifyModalVisible() {
    await expect(this.modal).toBeVisible({ timeout: 15000 });
    await expect(this.btnCheckout).toBeVisible({ timeout: 15000 });
  }
  async verifyModalVisibleOnEnroll() {
    await this.page.waitForTimeout(5000);
    await expect(this.modal).toBeVisible();
    await expect(this.btnNext).toBeVisible();
  }

  // ✅ Cerrar modal sin ir al checkout
  async closeModal() {
    await this.btnClose.click();
    await expect(this.modal).not.toBeVisible({ timeout: 5000 });
    console.log("✅ Modal cerrado");
  }

  // ✅ Verificar producto en la orden normal
  async verifyProductInCart(productName: string) {
    await expect(
      this.productNameInCart.filter({ hasText: productName }).first(),
    ).toBeVisible();
  }

  // ✅ Verificar producto en suscripción
  async verifyProductInSubscription(productName: string) {
    await expect(
      this.productNameInSubs.filter({ hasText: productName }).first(),
    ).toBeVisible();
  }

  // ✅ Verificar ambas secciones
  async verifyBothSections(productName: string) {
    await this.verifyModalVisible();
    await this.verifyProductInCart(productName);
    await this.verifyProductInSubscription(productName);
    console.log("✅ Producto en ambas secciones del carrito");
  }

  // ✅ Verificar el total de la orden
  async verifyOrderTotal(expectedTotal: string) {
    await expect(this.orderTotalAmount).toContainText(expectedTotal);
  }

  // ✅ Continuar comprando
  async continueShopping() {
    await this.btnContinueShopping.click();
    await expect(this.modal).not.toBeVisible();
  }

  // ✅ Ir al checkout
  async proceedToCheckout() {
    await this.btnCheckout.click();
    await expect(this.page).toHaveURL(/\/info/);
  }

  async proceedToNextStep() {
    await this.btnNext.click();
    console.log("✅ Continuando al siguiente paso...");
  }
}
