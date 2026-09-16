import { Page, Locator, expect } from "@playwright/test";
import { MarketLabels, defaultLabels } from "../../fixtures/marketLabels";

export class EnrollStep1Page {
  readonly page: Page;
  readonly labels: MarketLabels;

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

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    this.page = page;
    this.labels = labels;

    // ✅ Stepper steps
    this.step1 = page.locator('[data-step="1"]');
    this.step2 = page.locator('[data-step="2"]');
    this.step3 = page.locator('[data-step="3"]');

    // ✅ Sponsor name en el header
    this.sponsorName = page.locator(".name-sponsor", {
      hasText: labels.sponsorNamePrefix,
    });

    // ✅ Cards de packs
    this.packCards = page.locator('[data-cy="view-details"]');

    // ✅ Botones ADD TO CART de los packs
    this.btnAddToCart = page.getByRole("button", { name: labels.addToCart });

    // ✅ Botón BUILD YOUR PACK
    this.btnBuildPack = page.locator("button", {
      hasText: labels.buildYourPack,
    });
  }

  // ✅ Verificar que estamos en Step 1
  async verifyPageLoaded() {
    //await expect(this.page).toHaveURL(/shop\.aseastage\.com/);
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
    const escapedName = packName
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    const packHeading = this.page.locator("h1", {
      hasText: new RegExp(`^\\s*${escapedName}\\s*$`),
    });
    const btnAdd = packHeading.locator("xpath=following::button[1]");
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
