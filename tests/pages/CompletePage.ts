import { Page, Locator, expect } from "@playwright/test";
import { MarketLabels, defaultLabels } from "../fixtures/marketLabels";

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class CompletePage {
  readonly page: Page;
  readonly labels: MarketLabels;

  // 🎯 Confirmación
  readonly confirmationMessage: Locator;
  readonly orderNumber: Locator;
  readonly subscriptionOrderNumber: Locator;
  readonly orderDate: Locator;
  readonly downloadReceiptLink: Locator;

  // 🎯 Totales orden
  readonly orderTotalAmount: Locator;
  readonly orderTotalShipping: Locator;
  readonly orderTotalTax: Locator;

  // 🎯 Totales suscripción
  readonly subscriptionTotalAmount: Locator;
  readonly subscriptionTotalTax: Locator;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    this.page = page;
    this.labels = labels;

    // ✅ Confirmación

    this.confirmationMessage = page
      .locator("div", {
        hasText: new RegExp(
          `${escapeRegExp(labels.orderReceived)}|${escapeRegExp(defaultLabels.orderReceived)}`,
          "i",
        ),
      })
      .last();

    const orderSummaryBox = page.locator("div.bg-gray-200", {
      hasText: labels.orderNumberLabel,
    });
    this.orderNumber = orderSummaryBox
      .locator(".col-span-6.text-right > div")
      .nth(0);
    this.orderDate = orderSummaryBox
      .locator(".col-span-6.text-right > div")
      .nth(1);

    this.subscriptionOrderNumber = page
      .locator("div.bg-gray-200", {
        hasText:
          /Order Number|Subscription number|Bestellnummer|Abonnementnummer|Número de suscripción|Előfizetési szám|订阅号/i,
      })
      .locator(".col-span-6.text-right > div")
      .first();

    this.downloadReceiptLink = page.locator("a", {
      hasText: labels.downloadReceipt,
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

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/complete/, { timeout: 30000 });
    await expect(this.confirmationMessage).toBeVisible({ timeout: 30000 });
  }

  async verifyConfirmationMessage(firstName: string) {
    await expect(this.confirmationMessage).toContainText(firstName);
    console.log(`✅ Mensaje de confirmación contiene: ${firstName}`);
  }

  // ✅ Verificar número de orden (que existe y no está vacío)
  async verifyOrderNumber() {
    await expect(this.orderNumber).toBeVisible();
    const orderNum = await this.orderNumber.textContent();
    expect(orderNum?.trim()).toBeTruthy();
    console.log(`✅ Orden generada: ${orderNum?.trim()}`);
    return orderNum?.trim();
  }

  // ✅ Verificar número de suscripción (carrito solo de suscripción, sin
  // "Order Number" — ver subscriptionOrderNumber)
  async verifySubscriptionOrderNumber() {
    await expect(this.subscriptionOrderNumber).toBeVisible();
    const num = await this.subscriptionOrderNumber.textContent();
    expect(num?.trim()).toBeTruthy();
    console.log(`✅ Orden generada: ${num?.trim()}`);
    return num?.trim();
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

  private normalizeAmount(value: string): string {
    const cleaned = value.replace(/[^\d.,]/g, "");
    const match = cleaned.match(/^(.*)[.,](\d{2})$/);
    if (match) {
      return `${match[1].replace(/[.,]/g, "")}.${match[2]}`;
    }
    return `${cleaned.replace(/[.,]/g, "")}.00`;
  }

  // ✅ Verificar order total (solo si existe)
  async verifyOrderTotal(expectedTotal: string) {
    if (!expectedTotal) {
      console.log("⏭️ Sin Today Order, se omite verificación");
      return;
    }
    const orderTotal = await this.orderTotalAmount.textContent();
    console.log(`💰 Order Total en complete: ${orderTotal?.trim()}`);
    expect(this.normalizeAmount(orderTotal ?? "")).toContain(
      this.normalizeAmount(expectedTotal),
    );
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
    expect(this.normalizeAmount(subscriptionTotal ?? "")).toContain(
      this.normalizeAmount(expectedTotal),
    );
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
    await this.verifyOrderTotal(totals.orderTotal);
    await this.verifySubscriptionTotal(totals.subscriptionTotal);
  }
  // ✅ Verificación completa incluyendo totales
  async verifyCompleteSuscripcion(
    firstName: string,
    totals: {
      orderTotal: string;
      subscriptionTotal: string;
    },
  ) {
    await this.verifyPageLoaded();
    await this.verifyConfirmationMessage(firstName);
    await this.verifySubscriptionOrderNumber();
    //await this.verifyOrderDate();
    //await this.verifyDownloadReceiptLink();
    //await this.verifyOrderTotal(totals.orderTotal);
    await this.verifySubscriptionTotal(totals.subscriptionTotal);
  }
}
