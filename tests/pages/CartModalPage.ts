import { Page, Locator, expect } from '@playwright/test';

export class CartModalPage {
  readonly page: Page;

  // 🎯 Locators
  readonly modal:                  Locator;
  readonly btnClose:               Locator;
  readonly productNameInCart:      Locator;
  readonly productNameInSubs:      Locator;
  readonly orderTotalAmount:       Locator;
  readonly subscriptionTotal:      Locator;
  readonly btnContinueShopping:    Locator;
  readonly btnCheckout:            Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Por data-cy
    this.modal             = page.locator('[data-cy="summary-cart-displayed"]');
    this.btnClose          = page.locator('[data-cy="summary-cart-close-btn"]');
    this.productNameInCart = page.locator('[data-cy="row-summary-cart-name-product"]');
    this.productNameInSubs = page.locator('[data-cy="row-summary-box-name-product"]');
    this.orderTotalAmount  = page.locator('[data-cy="summary-order-totalAmount"]');
    this.subscriptionTotal = page.locator('[data-cy="summary-subscription-totalAmount"]');

    // ✅ Por texto (no tienen data-cy)
    this.btnContinueShopping = page.getByRole('button', { name: 'Continue Shopping' });
    this.btnCheckout         = page.getByRole('button', { name: 'Checkout' });
  }

  // ✅ Verificar que el modal está visible
  async verifyModalVisible() {
    await expect(this.modal).toBeVisible();
    await expect(this.btnCheckout).toBeVisible();
  }

  // ✅ Verificar producto en la orden normal
  async verifyProductInCart(productName: string) {
    await expect(this.productNameInCart).toContainText(productName);
  }

  // ✅ Verificar producto en suscripción
  async verifyProductInSubscription(productName: string) {
    await expect(this.productNameInSubs).toContainText(productName);
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
}