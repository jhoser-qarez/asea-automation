import { Page, Locator, expect } from "@playwright/test";

export class EnrollCompletePage {
  readonly page: Page;

  // 🎯 Confirmación
  readonly confirmationMessage: Locator;
  readonly downloadReceiptLink: Locator;

  // 🎯 Enrollment Details
  readonly orderNumber: Locator;
  readonly orderDate: Locator;
  readonly associateId: Locator;
  readonly yourUsername: Locator;

  // 🎯 Totales
  readonly orderTotalAmount: Locator;
  readonly subscriptionTotalAmount: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Mensaje de bienvenida
    this.confirmationMessage = page.locator("div.white--text", {
      hasText: "welcome to Asea",
    });

    // ✅ Download receipt
    this.downloadReceiptLink = page.locator("a", {
      hasText: "Download receipt",
    });

    // ✅ Enrollment Details - excluir el oculto
    this.orderNumber = page
      .locator('[data-cy="enrollment-details-orderNumber"]')
      .last();
    this.orderDate = page
      .locator('[data-cy="enrollment-details-orderDate"]')
      .last();
    this.associateId = page
      .locator('[data-cy="enrollment-details-associateId"]')
      .last();
    this.yourUsername = page
      .locator('[data-cy="enrollment-details-yourUsername"]')
      .last();

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
    await expect(this.confirmationMessage).toBeVisible({ timeout: 30000 });
  }

  // ✅ Verificar mensaje de bienvenida
  async verifyWelcomeMessage(firstName: string) {
    await expect(this.confirmationMessage).toContainText(
      `Thank you, ${firstName}, and welcome to Asea!`,
    );
    console.log(`✅ Mensaje de bienvenida: Thank you, ${firstName}`);
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

  // ✅ Verificar totales
  async verifyOrderTotal(expectedTotal: string) {
    await expect(this.orderTotalAmount).toContainText(expectedTotal);
    console.log(`✅ Order Total verificado: ${expectedTotal}`);
  }

  async verifySubscriptionTotal(expectedTotal: string) {
    await expect(this.subscriptionTotalAmount).toContainText(expectedTotal);
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
    await this.verifyWelcomeMessage(firstName);
    await this.verifyEnrollmentDetails();
    await this.verifyDownloadReceiptLink();
    await this.verifyOrderTotal(totals.orderTotal);
    await this.verifySubscriptionTotal(totals.subscriptionTotal);
  }
}
