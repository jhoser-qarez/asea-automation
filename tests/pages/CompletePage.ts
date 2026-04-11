import { Page, Locator, expect } from "@playwright/test";

export class CompletePage {
  readonly page: Page;

  // 🎯 Confirmación
  readonly confirmationMessage: Locator;
  readonly orderNumber: Locator;
  readonly orderDate: Locator;
  readonly downloadReceiptLink: Locator;

  // 🎯 Totales orden
  readonly orderTotalAmount: Locator;
  readonly orderTotalShipping: Locator;
  readonly orderTotalTax: Locator;

  // 🎯 Totales suscripción
  readonly subscriptionTotalAmount: Locator;
  readonly subscriptionTotalTax: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Confirmación
    this.confirmationMessage = page.locator("div.white--text", {
      hasText: "Your order has been received!",
    });
    this.orderNumber = page
      .locator('[data-cy="enrollment-details-orderNumber"]')
      .last();

    this.orderDate = page
      .locator('[data-cy="enrollment-details-orderDate"]')
      .last();
    this.downloadReceiptLink = page.locator("a", {
      hasText: "Download receipt",
    });

    // ✅ Totales orden
    this.orderTotalAmount = page
      .locator('[data-cy="summary-order-totalAmount"]')
      .last();
    this.orderTotalShipping = page
      .locator('[data-cy="summary-order-totalShipping"]')
      .last();
    this.orderTotalTax = page
      .locator('[data-cy="summary-order-totalTax"]')
      .last();

    // ✅ Totales suscripción
    this.subscriptionTotalAmount = page
      .locator('[data-cy="summary-subscription-totalAmount"]')
      .last();
    this.subscriptionTotalTax = page
      .locator('[data-cy="summary-subscription-totalTax"]')
      .last();
  }

  // ✅ Verificar que estamos en /complete
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/complete/, { timeout: 30000 });
    await expect(this.confirmationMessage).toBeVisible({ timeout: 30000 });
  }

  // ✅ Verificar mensaje de confirmación con nombre del usuario
  async verifyConfirmationMessage(firstName: string) {
    await expect(this.confirmationMessage).toContainText(
      `Thank you, ${firstName}`,
    );
    await expect(this.confirmationMessage).toContainText(
      "Your order has been received!",
    );
  }

  // ✅ Verificar número de orden (que existe y no está vacío)
  async verifyOrderNumber() {
    await expect(this.orderNumber).toBeVisible();
    const orderNum = await this.orderNumber.textContent();
    expect(orderNum?.trim()).toBeTruthy();
    console.log(`✅ Orden generada: ${orderNum?.trim()}`);
    return orderNum?.trim();
  }

  // ✅ Verificar fecha de orden
  async verifyOrderDate() {
    await expect(this.orderDate).toBeVisible();
    const date = await this.orderDate.textContent();
    expect(date?.trim()).toBeTruthy();
    console.log(`✅ Fecha de orden: ${date?.trim()}`);
  }

  // ✅ Verificar totales de la orden
  async verifyOrderTotals(expectedTotal: string) {
    await expect(this.orderTotalAmount).toContainText(expectedTotal);
  }

  // ✅ Verificar totales de suscripción
  async verifySubscriptionTotals(expectedTotal: string) {
    await expect(this.subscriptionTotalAmount).toContainText(expectedTotal);
  }

  // ✅ Verificar link de descarga de recibo
  async verifyDownloadReceiptLink() {
    await expect(this.downloadReceiptLink).toBeVisible();
    await expect(this.downloadReceiptLink).toHaveAttribute("href", /office/);
  }

  // ✅ Verificar order total (solo si existe)
  async verifyOrderTotal(expectedTotal: string) {
    if (!expectedTotal) {
      console.log("⏭️ Sin Today Order, se omite verificación");
      return;
    }
    const orderTotal = await this.orderTotalAmount.textContent();
    console.log(`💰 Order Total en complete: ${orderTotal?.trim()}`);
    await expect(this.orderTotalAmount).toContainText(expectedTotal);
  }

  // ✅ Verificar subscription total (solo si existe)
  async verifySubscriptionTotal(expectedTotal: string) {
    if (!expectedTotal) {
      console.log("⏭️ Sin Subscription, se omite verificación");
      return;
    }
    const subscriptionTotal = await this.subscriptionTotalAmount.textContent();
    console.log(
      `💰 Subscription Total en complete: ${subscriptionTotal?.trim()}`,
    );
    await expect(this.subscriptionTotalAmount).toContainText(expectedTotal);
  }

  // ✅ Verificación completa incluyendo totales
  async verifyCompleteOrder(
    firstName: string,
    totals: {
      orderTotal: string;
      subscriptionTotal: string;
    },
  ) {
    await this.verifyPageLoaded();
    await this.verifyConfirmationMessage(firstName);
    await this.verifyOrderNumber();
    //await this.verifyOrderDate();
    //await this.verifyDownloadReceiptLink();
    //await this.verifyOrderTotal(totals.orderTotal);
    await this.verifySubscriptionTotal(totals.subscriptionTotal);
  }
}
