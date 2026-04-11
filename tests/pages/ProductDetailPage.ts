import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;

  // 🎯 Locators
  readonly checkboxCart:         Locator;
  readonly checkboxSubscription: Locator;
  readonly btnPlus:              Locator;
  readonly btnMinus:             Locator;
  readonly inputQuantity:        Locator;
  readonly btnAddToCart:         Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Por id (únicos en la página)
    this.checkboxCart         = page.locator('#purchaseOption-cart');
    this.checkboxSubscription = page.locator('#purchaseOption-suscriptionBox');

    // ✅ Por data-cy (estables)
    this.btnPlus       = page.locator('[data-cy="plus-box"]');
    this.btnMinus      = page.locator('[data-cy="minus-box"]');
    this.inputQuantity = page.locator('[data-cy="quantity-field"]');
    this.btnAddToCart  = page.locator('[data-cy="modify-product-from-detail"]');
  }

  // ✅ Verificar que estamos en la página de detalle
  async verifyPageLoaded() {
    await expect(this.btnAddToCart).toBeVisible();
    await expect(this.inputQuantity).toBeVisible();
  }

  // ✅ Seleccionar tipo de compra
  async selectPurchaseType(type: 'cart' | 'subscription') {
    if (type === 'cart') {
      await this.checkboxCart.check({ force: true });
    } else {
      await this.checkboxSubscription.check({ force: true });
    }
  }

  // ✅ Establecer cantidad manualmente
  async setQuantity(quantity: number) {
    await this.inputQuantity.clear();
    await this.inputQuantity.pressSequentially(quantity.toString(), { delay: 100 });
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
  async addProductToCart(type: 'cart' | 'subscription', quantity: number = 1) {
    await this.verifyPageLoaded();
    await this.selectPurchaseType(type);
    await this.setQuantity(quantity);
    await this.addToCart();
  }
}