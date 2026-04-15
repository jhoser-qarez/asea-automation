import { Page, Locator, expect } from "@playwright/test";

export class EnrollStep1Page {
  readonly page: Page;

  // 🎯 Stepper
  readonly step1: Locator;
  readonly step2: Locator;
  readonly step3: Locator;

  // 🎯 Header
  readonly sponsorName: Locator;

  // 🎯 Packs
  readonly packCards: Locator;
  readonly btnAddToCart: Locator;
  readonly btnBuildPack: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Stepper steps
    this.step1 = page.locator('[data-step="1"]');
    this.step2 = page.locator('[data-step="2"]');
    this.step3 = page.locator('[data-step="3"]');

    // ✅ Sponsor name en el header
    this.sponsorName = page.locator(".v-chip__content", {
      hasText: "Sponsor Name:",
    });

    // ✅ Cards de packs
    this.packCards = page.locator('[data-cy="view-details"]');

    // ✅ Botones ADD TO CART de los packs
    this.btnAddToCart = page.locator(
      '[data-cy="add-to-cart-from-list-page-btn"]',
    );

    // ✅ Botón BUILD YOUR PACK
    this.btnBuildPack = page.locator("button", { hasText: "BUILD YOUR PACK" });
  }

  // ✅ Verificar que estamos en Step 1
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/shop\.aseastage\.com/);
    await expect(this.step1).toBeVisible({ timeout: 15000 });
    await expect(this.step1).toHaveClass(/active/);
    console.log("✅ Step 1 - Pick your pack");
  }

  // ✅ Verificar sponsor name
  async verifySponsorName(sponsorName: string) {
    await expect(this.sponsorName).toContainText(sponsorName);
    console.log(`✅ Sponsor: ${sponsorName}`);
  }

  // ✅ Agregar pack por nombre
  async addPackToCart(packName: string) {
    // Encontrar el botón ADD TO CART del pack específico
    const packCard = this.page.locator(".card", {
      hasText: packName,
    });
    const btnAdd = packCard.locator(
      '[data-cy="add-to-cart-from-list-page-btn"]',
    );
    await btnAdd.click();
    console.log(`✅ Pack agregado: ${packName}`);
  }

  // ✅ Agregar primer pack disponible
  async addFirstPackToCart() {
    await this.btnAddToCart.first().click();
    console.log("✅ Primer pack agregado al carrito");
  }

  // ✅ Ver detalle de un pack específico
  async viewPackDetails(packName: string) {
    const packLink = this.page.locator('[data-cy="view-details"]', {
      hasText: packName,
    });
    await packLink.click();
    console.log(`✅ Viendo detalle de: ${packName}`);
  }

  // ✅ Verificar que todos los packs están visibles
  async verifyAllPacksVisible() {
    await expect(this.btnAddToCart).toHaveCount(6);
    console.log("✅ Los 6 packs de enrolamiento están visibles");
  }
}
