import { Page, Locator, expect } from "@playwright/test";
import { CheckoutPage } from "../pages/CheckoutPage";

export class CheckoutPageEuropean extends CheckoutPage {
  // 🎯 Agreements checkboxes - dentro de .row.border-check
  readonly checkboxesAgreements: Locator;
  readonly rowCreditCardEU: Locator;

  constructor(page: Page) {
    super(page);

    // ✅ Todos los checkboxes dentro del bloque Vereinbarungen
    // Usamos .row.border-check que es independiente del idioma
    this.checkboxesAgreements = page.locator(
      '.row.border-check input[role="checkbox"]',
    );
    this.rowCreditCardEU = page.locator('[data-test="box-billing-method-0"]');
  }

  // ✅ Marcar todos los checkboxes de agreements
  async acceptAgreements() {
    const count = await this.checkboxesAgreements.count();
    console.log(`📋 Aceptando ${count} agreements...`);

    for (let i = 0; i < count; i++) {
      const checkbox = this.checkboxesAgreements.nth(i);
      const isChecked = await checkbox.evaluate((el) =>
        el.getAttribute("aria-checked"),
      );
      if (isChecked !== "true") {
        // Click en el label correspondiente para evitar problemas de visibilidad
        await checkbox.click({ force: true });
        console.log(`✅ Agreement ${i + 1} aceptado`);
      }
    }
  }

  override async selectCreditCardPayment() {
    const isChecked = await this.page.evaluate(() => {
      const input = document.querySelector(
        '[data-test="box-billing-method-0"]',
      );
      return input?.getAttribute("aria-checked");
    });

    if (isChecked !== "true") {
      await this.rowCreditCardEU.click({ force: true });
    }

    await expect(this.inputCardName).toBeVisible({ timeout: 10000 });
    console.log("✅ Credit Card EU seleccionada");
  }

  // ✅ Flujo completo EU
  async completeCheckoutEuropean(card: {
    name: string;
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();

    // 1. Seleccionar Credit Card (mismo data-test que US)
    await this.selectCreditCardPayment();
    await this.fillCardDetails(card);

    // 2. Billing address - usar misma dirección del shipping
    await this.verifySubscriptionBillingAddress();

    // 3. Aceptar agreements EU (en lugar de personal consumption)
    await this.acceptAgreements();

    // 4. Capturar totales antes de confirmar
    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    // 5. Confirmar orden
    await this.placeOrder();

    return { orderTotal, subscriptionTotal };
  }
}
