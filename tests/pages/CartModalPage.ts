import { Page, Locator, expect } from "@playwright/test";
import { MarketLabels, defaultLabels } from "../fixtures/marketLabels";

// ✅ Escapa caracteres especiales de regex antes de armar un patrón dinámico
// a partir de un texto de labels (por si algún idioma trae paréntesis, etc.)
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class CartModalPage {
  readonly page: Page;
  readonly labels: MarketLabels;

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
  readonly btnSkip: Locator;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    this.page = page;
    this.labels = labels;

    // ✅ Por data-cy
    this.modal = page.locator("#content");
    this.btnClose = page.getByRole("button", { name: labels.closePanel });
    this.productNameInCart = page.locator('[data-test="cart-product-title"]');
    this.productNameInSubs = page.locator(
      '[data-test="subscription-product-title"]',
    );
    this.orderTotalAmount = page.locator(
      '[data-test="checkout-todays-order-total-value"]',
    );
    this.subscriptionTotal = page.locator(
      '[data-test="checkout-subscriptions-total-value"]',
    );

    // ✅ Por texto (no tienen data-cy)
    this.btnContinueShopping = page.locator(
      '[data-test="continue-shopping-button"]',
    );
    this.btnCheckout = page.locator('[data-test="checkout-button"]');

    this.btnNext = page.locator('[data-test="checkout-button"]');

    this.btnSkip = page.getByRole("button", {
      name: new RegExp(escapeRegExp(labels.continueToCheckout), "i"),
    });
  }

  // ✅ Verificar que el modal está visible
  async verifyModalVisible() {
    await expect(this.modal).toBeVisible({ timeout: 15000 });
    await expect(this.btnCheckout).toBeVisible({ timeout: 15000 });
  }
  async verifyModalVisibleOnEnroll() {
    await expect(this.modal).toBeVisible({ timeout: 15000 });
    await expect(this.btnNext).toBeVisible({ timeout: 15000 });
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
    ).toBeVisible({ timeout: 15000 });
  }

  // ✅ Verificar producto en suscripción
  async verifyProductInSubscription(productName: string) {
    await expect(
      this.productNameInSubs.filter({ hasText: productName }).first(),
    ).toBeVisible({ timeout: 15000 });
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
  
  // Ir a seleccionar suscription 
  async proceedToSuscriptionPage() {
    await this.btnCheckout.click();
    await expect(this.page).toHaveURL(/\/subscription/);
  }

  async proceedToNextStep() {
    await this.btnNext.click();
    console.log("✅ Continuando al siguiente paso...");
  }
  async proceedToSkip() {
    await this.btnCheckout.click();
    await this.btnSkip.click();
    console.log("✅ saltar el paso de suscription");
  }
}
