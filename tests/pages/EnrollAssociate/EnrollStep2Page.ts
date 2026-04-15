import { Page, Locator, expect } from "@playwright/test";

export class EnrollStep2Page {
  readonly page: Page;

  // 🎯 Stepper
  readonly step1: Locator;
  readonly step2: Locator;
  readonly step3: Locator;

  // 🎯 Header
  readonly sponsorName: Locator;
  readonly stepTitle: Locator;

  // 🎯 Bundles
  readonly btnAddToSubscription: Locator;

  // 🎯 Botones de navegación
  readonly btnSkipStep: Locator;
  readonly btnBuildMyBundle: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Stepper
    this.step1 = page.locator('[data-step="1"]');
    this.step2 = page.locator('[data-step="2"]');
    this.step3 = page.locator('[data-step="3"]');

    // ✅ Header
    this.sponsorName = page.locator(".v-chip__content", {
      hasText: "Sponsor Name:",
    });
    this.stepTitle = page.locator("h2", {
      hasText: "Step 2",
    });

    // ✅ Botón ADD TO SUBSCRIPTION
    this.btnAddToSubscription = page.locator(
      '[data-cy="add-to-box-from-list-page-btn"]',
    );

    // ✅ Botones de navegación
    this.btnSkipStep = page
      .locator("button", { hasText: "SKIP THIS STEP" })
      .first();
    this.btnBuildMyBundle = page.locator("button", {
      hasText: "BUILD MY BUNDLE",
    });
  }

  // ✅ Verificar Step 2 activo
  async verifyPageLoaded() {
    await expect(this.step2).toHaveClass(/active/, { timeout: 15000 });
    await expect(this.stepTitle).toBeVisible();
    console.log("✅ Step 2 - Subscribe for success");
  }

  // ✅ Verificar sponsor name
  async verifySponsorName(sponsorName: string) {
    await expect(this.sponsorName).toContainText(sponsorName);
    console.log(`✅ Sponsor: ${sponsorName}`);
  }

  // ✅ Agregar bundle por nombre
  async addBundleToSubscription(bundleName: string) {
    const bundleCard = this.page.locator(".card", {
      hasText: bundleName,
    });
    const btnAdd = bundleCard.locator(
      '[data-cy="add-to-box-from-list-page-btn"]',
    );
    await btnAdd.click();
    console.log(`✅ Bundle agregado a suscripción: ${bundleName}`);
  }

  // ✅ Verificar cantidad de bundles disponibles
  async verifyBundlesVisible(count: number) {
    await expect(this.btnAddToSubscription).toHaveCount(count);
    console.log(`✅ ${count} bundles de suscripción visibles`);
  }

  // ✅ Saltar este paso
  async skipStep() {
    await this.btnSkipStep.click();
    console.log("⏭️ Step 2 omitido");
  }
}
