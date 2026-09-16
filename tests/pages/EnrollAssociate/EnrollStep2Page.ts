import { Page, Locator, expect } from "@playwright/test";
import { MarketLabels, defaultLabels } from "../../fixtures/marketLabels";

export class EnrollStep2Page {
  readonly page: Page;
  readonly labels: MarketLabels;

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

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    this.page = page;
    this.labels = labels;

    // ✅ Stepper
    this.step1 = page.locator('[data-step="1"]');
    this.step2 = page.locator('[data-step="2"]');
    this.step3 = page.locator('[data-step="3"]');

    // ✅ Header
    this.sponsorName = page.locator(".name-sponsor", {
      hasText: labels.sponsorNamePrefix,
    });
    this.stepTitle = page.locator("h2", {
      hasText: labels.stepTwoTitle,
    });

    // ✅ Botón ADD TO SUBSCRIPTION
    this.btnAddToSubscription = page.getByRole("button", {
      name: labels.addToSubscription,
    });

    // ✅ Botones de navegación
    this.btnSkipStep = page
      .locator("button", { hasText: labels.skipThisStep })
      .first();
    this.btnBuildMyBundle = page.locator("button", {
      hasText: labels.buildMyBundle,
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
    const escapedName = bundleName
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    const packHeading = this.page.locator("h1", {
      hasText: new RegExp(`^\\s*${escapedName}\\s*$`),
    });
    const btnAdd = packHeading.locator("xpath=following::button[1]");

    await this.page
      .locator('[data-test="cart-drawer-close-button"]')
      .first()
      .click({ timeout: 3000 })
      .catch(() => {});

    await btnAdd.click();
    console.log(`✅ Pack agregado: ${bundleName}`);
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
