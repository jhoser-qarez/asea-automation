import { Page, Locator, expect } from "@playwright/test";
import { urls } from "../fixtures/urls";

export class SubscriptionPage {
  readonly page: Page;

  // 🎯 Locators
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly btnSubscribeAndSave: Locator;
  readonly btnViewProduct: Locator;
  readonly btnNextSlide: Locator;
  readonly btnPrevSlide: Locator;
  readonly btnContinueCheckoutHeader: Locator;
  readonly btnContinueCheckoutFooter: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Selectores técnicos (Independientes del idioma)
    this.productCards = page.locator('.subscription-slider .card');
    this.productNames = page.locator('[data-cy="card-info-name"]');
    
    // Botón principal de la card (Subscribe & Save)
    this.btnSubscribeAndSave = page.locator('[data-cy="add-to-box-from-list-page-btn"]');
    
    // Botón que aparece al hacer hover (View Product)
    this.btnViewProduct = page.locator('.move-btn [data-cy="view-details"]');

    // Navegación del Carrusel
    this.btnNextSlide = page.locator('.v-window__next button');
    this.btnPrevSlide = page.locator('.v-window__prev button');

    // Botones de Checkout (basados en posición/clase, no en texto)
    this.btnContinueCheckoutHeader = page.locator('.subscription-header .justify-end a');
    this.btnContinueCheckoutFooter = page.locator('.footer .order-sm-last button');
  }

  

  // ✅ Esperar que la página cargue validando el primer nombre de producto
  async verifyPageLoaded() {
    await expect(this.productNames.first()).toBeVisible();
  }

  /**
   * Selecciona un producto por su ID técnico en el link.
   * Útil para evitar el uso de nombres que cambian con el idioma.
   * @param productId Ejemplo: '5749'
   */
  async selectProductById(productId: string) {
    await this.page
      .locator(`a[data-cy="view-details"][href*="/products/${productId}"]`)
      .first()
      .click();
  }

  // ✅ Seleccionar el primer botón de suscripción disponible
  async subscribeToFirstProduct() {
    await this.btnSubscribeAndSave.first().click();
  }

  // ✅ Navegar en el carrusel
  async nextSlide() {
    await this.btnNextSlide.click();
  }

  /**
   * Hace hover sobre una card específica (usando index) y hace clic en View Product
   * @param index Posición de la card
   */
  async hoverAndViewProductByIndex(index: number = 0) {
    const card = this.productCards.nth(index);
    await card.hover();
    await card.locator(this.btnViewProduct).click();
  }

  // ✅ Continuar al checkout usando el botón del footer
  async clickContinueToCheckout() {
    await this.btnContinueCheckoutFooter.click();
  }
}