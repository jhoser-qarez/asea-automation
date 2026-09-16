import { Page, Locator, expect } from "@playwright/test";
import { MarketLabels, defaultLabels } from "../../fixtures/marketLabels";

// ✅ Convierte un monto tipo "€331,00" en un regex que matchea tanto "," como
// "." como separador decimal
function toFlexibleAmountPattern(amount: string): RegExp {
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = amount.split(/[.,]/).map(escapeRegex);
  return new RegExp(parts.join("[.,]"));
}

export class EnrollCompletePage {
  readonly page: Page;
  readonly labels: MarketLabels;

  // 🎯 Confirmación
  readonly confirmationMessage: Locator;
  readonly confirmationMessageSC: Locator;
  readonly downloadReceiptLink: Locator;

  // 🎯 Enrollment Details
  readonly orderNumber: Locator;
  readonly orderDate: Locator;
  readonly associateId: Locator;
  readonly yourUsername: Locator;

  // 🎯 Totales
  readonly orderTotalAmount: Locator;
  readonly subscriptionTotalAmount: Locator;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    this.page = page;
    this.labels = labels;

    // ✅ Mensaje de bienvenida
    this.confirmationMessage = page.locator("div.text-white", {
      hasText: labels.welcomeToAsea,
    });
    this.confirmationMessageSC = page.locator("div.text-white", {
      hasText: labels.orderReceivedEnroll,
    });

    // ✅ Download receipt
    this.downloadReceiptLink = page.locator("a", {
      hasText: labels.downloadReceipt,
    });

    // ✅ Enrollment Details
    const enrollmentDetailsValues = page
      .locator("div.bg-gray-200", { hasText: labels.enrollmentDetails })
      .locator("div.col-span-6.text-right > div");
    this.orderNumber = enrollmentDetailsValues.nth(0);
    this.orderDate = enrollmentDetailsValues.nth(1);
    this.associateId = enrollmentDetailsValues.nth(2);
    this.yourUsername = enrollmentDetailsValues.nth(3);

    // ✅ Totales
    this.orderTotalAmount = page
      .locator('[data-cy="summary-order-totalAmount"]')
      .last();
    this.subscriptionTotalAmount = page
      .locator('[data-cy="summary-subscription-totalAmount"]')
      .last();
  }

  // ✅ Verificar que estamos en /complete
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/complete/, { timeout: 30000 });
    //await expect(this.confirmationMessage).toBeVisible({ timeout: 30000 });
  }

  async verifyPageLoadedSC() {
    await expect(this.page).toHaveURL(/\/complete/, { timeout: 30000 });
    //await expect(this.confirmationMessageSC).toBeVisible({ timeout: 30000 });
  }

  // ✅ Verificar mensaje de bienvenida
  async verifyWelcomeMessage(firstName: string) {
    await expect(this.confirmationMessage).toContainText(
      this.labels.welcomeMessage(firstName),
    );
    console.log(`✅ Mensaje de bienvenida: Thank you, ${firstName}`);
  }
  async verifyConfirmationMessageSC(firstName: string) {
    await expect(this.confirmationMessageSC).toContainText(
      this.labels.confirmationMessageSC(firstName),
    );
    await expect(this.confirmationMessageSC).toContainText(
      this.labels.orderReceivedEnroll,
    );
  }

  // ✅ Verificar enrollment details
  async verifyEnrollmentDetails() {
    await expect(this.orderNumber).toBeVisible();
    await expect(this.orderDate).toBeVisible();
    await expect(this.associateId).toBeVisible();
    await expect(this.yourUsername).toBeVisible();

    const orderNum = await this.orderNumber.textContent();
    const date = await this.orderDate.textContent();
    const assocId = await this.associateId.textContent();
    const username = await this.yourUsername.textContent();

    console.log(`✅ Order Number:     ${orderNum?.trim()}`);
    console.log(`✅ Order Date:       ${date?.trim()}`);
    console.log(`✅ Associate ID:     ${assocId?.trim()}`);
    console.log(`✅ Username:         ${username?.trim()}`);
  }

  // ✅ Verificar totales — tolerante a "," o "."
  async verifyOrderTotal(expectedTotal: string) {
    await expect(this.orderTotalAmount).toContainText(
      toFlexibleAmountPattern(expectedTotal),
    );
    console.log(`✅ Order Total verificado: ${expectedTotal}`);
  }

  async verifySubscriptionTotal(expectedTotal: string) {
    await expect(this.subscriptionTotalAmount).toContainText(
      toFlexibleAmountPattern(expectedTotal),
    );
    console.log(`✅ Subscription Total verificado: ${expectedTotal}`);
  }

  // ✅ Verificar link de descarga
  async verifyDownloadReceiptLink() {
    await expect(this.downloadReceiptLink).toBeVisible();
    console.log("✅ Link de descarga visible");
  }

  // ✅ Verificación completa
  async verifyCompleteEnrollment(
    firstName: string,
    totals: { orderTotal: string; subscriptionTotal: string },
  ) {
    await this.verifyPageLoaded();
    //await this.verifyWelcomeMessage(firstName);
    await this.verifyEnrollmentDetails();
    await this.verifyDownloadReceiptLink();
    await this.verifyOrderTotal(totals.orderTotal);
    await this.verifySubscriptionTotal(totals.subscriptionTotal);
  }

  // ✅ Verificación completa
  async verifyCompleteEnrollmentSC(
    firstName: string,
    totals: { orderTotal: string; subscriptionTotal: string },
  ) {
    await this.verifyPageLoadedSC();
    //await this.verifyWelcomeMessage(firstName);
    await this.verifyEnrollmentDetails();
    //await this.verifyDownloadReceiptLink();
    await this.verifyOrderTotal(totals.orderTotal);
    await this.verifySubscriptionTotal(totals.subscriptionTotal);
  }
  async verifyCompleteEnrollmentC(
    firstName: string,
    totals: { orderTotal: string; subscriptionTotal: string },
  ) {
    await this.verifyPageLoadedSC();
    //await this.verifyWelcomeMessage(firstName);
    await this.verifyEnrollmentDetails();
    //await this.verifyDownloadReceiptLink();
    await this.verifyOrderTotal(totals.orderTotal);
  }

  async verifyCompleteEnrollmentRC(
    firstName: string,
    totals: { orderTotal: string; subscriptionTotal: string },
  ) {
    await this.verifyPageLoadedSC();
    //await this.verifyWelcomeMessage(firstName);
    await this.verifyEnrollmentDetails();
    //await this.verifyDownloadReceiptLink();
    await this.verifyOrderTotal(totals.orderTotal);
    //await this.verifySubscriptionTotal(totals.subscriptionTotal);
  }
}
