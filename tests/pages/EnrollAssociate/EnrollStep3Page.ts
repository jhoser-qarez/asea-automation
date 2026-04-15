import { Page, Locator, expect } from "@playwright/test";

export class EnrollStep3Page {
  readonly page: Page;

  // 🎯 Stepper
  readonly step3: Locator;
  readonly stepTitle: Locator;

  // 🎯 Promo codes aplicados
  readonly promoCodes: Locator;

  // 🎯 Enrollment Perks
  readonly perksSection: Locator;
  readonly btnAddPerkToCart: Locator;

  // 🎯 Totales
  readonly orderTotalAmount: Locator;
  readonly subscriptionTotalAmount: Locator;

  // 🎯 Botones
  readonly btnSaveAddress: Locator;
  readonly btnContinueToCheckout: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Stepper
    this.step3 = page.locator('[data-step="3"]');
    this.stepTitle = page.locator("h2", { hasText: "Step 3" });

    // ✅ Promo codes
    this.promoCodes = page.locator(".v-chip__content span.mr-2");

    // ✅ Enrollment Perks
    this.perksSection = page.locator('[role="alert"]', {
      hasText: "Enrollment Pack Perks",
    });
    this.btnAddPerkToCart = page.locator("button", {
      hasText: "ADD TO CART",
    });

    // ✅ Totales
    this.orderTotalAmount = page.locator(
      '[data-cy="summary-order-totalAmount"]',
    );
    this.subscriptionTotalAmount = page.locator(
      '[data-cy="summary-subscription-totalAmount"]',
    );

    // ✅ Botones
    this.btnSaveAddress = page.getByRole("button", { name: "SAVE ADDRESS" });
    this.btnContinueToCheckout = page.locator('[data-test="continue"]');
    this.loadingSpinner = page.locator(".loading-view");
  }

  // ✅ Verificar Step 3 activo
  async verifyPageLoaded() {
    await expect(this.step3).toHaveClass(/active/, { timeout: 15000 });
    await expect(this.stepTitle).toBeVisible();
    console.log("✅ Step 3 - Finish your enrollment");
  }

  // ✅ Llenar datos básicos del nuevo usuario
  async fillBasicInfo(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    // Reutilizamos los mismos selectores de InfoPage
    const inputEmail = this.page.locator('[data-test="email-field"]');
    const inputFirstName = this.page.locator('[data-test="firstName-field"]');
    const inputLastName = this.page.locator('[data-test="lastName-field"]');
    const inputPhone = this.page.locator('[data-test="Phone-field"]');

    await inputEmail.clear();
    await inputEmail.pressSequentially(data.email, { delay: 100 });

    await inputFirstName.clear();
    await inputFirstName.pressSequentially(data.firstName, { delay: 100 });

    await inputLastName.clear();
    await inputLastName.pressSequentially(data.lastName, { delay: 100 });

    await inputPhone.clear();
    await inputPhone.pressSequentially(data.phone, { delay: 100 });

    console.log(`✅ Datos básicos: ${data.email}`);
  }

  // ✅ Verificar promo codes aplicados
  async verifyPromoCodes(expectedCodes: string[]) {
    for (const code of expectedCodes) {
      await expect(
        this.page.locator(".v-chip__content span.mr-2", { hasText: code }),
      ).toBeVisible();
      console.log(`✅ Promo code aplicado: ${code}`);
    }
  }

  // ✅ Verificar enrollment perks visibles
  async verifyEnrollmentPerks() {
    await expect(this.perksSection).toBeVisible();
    console.log("✅ Enrollment Pack Perks visibles");
  }

  // ✅ Guardar dirección y esperar loading
  async saveAddress() {
    await this.btnSaveAddress.click();

    await expect(this.loadingSpinner)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});

    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 15000 });
    console.log("✅ Dirección guardada");
  }

  // ✅ Continuar al checkout
  async continueToCheckout() {
    await this.btnContinueToCheckout.click();
    console.log("✅ Continuando al checkout...");
  }
}
