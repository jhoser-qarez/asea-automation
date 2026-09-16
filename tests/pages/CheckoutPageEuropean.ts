import { Page, Locator, FrameLocator, expect } from "@playwright/test";
import { CheckoutPage } from "../pages/CheckoutPage";
import { MarketLabels, defaultLabels } from "../fixtures/marketLabels";

export type PaymentMethodPreference = "creditCard" | "adyen";

export class CheckoutPageEuropean extends CheckoutPage {
  readonly checkboxAgreePolicyAndTerms: Locator;
  readonly checkboxAgreePrivacyPolicy: Locator;
  readonly labelAgreePolicyAndTerms: Locator;
  readonly labelAgreePrivacyPolicy: Locator;

  readonly rowCreditCardEU: Locator;

  readonly rowCreditCardSubscription: Locator;

  readonly radioAdyenProvider: Locator;
  readonly labelAdyenProvider: Locator;
  readonly inputHolderName: Locator; // único campo de Adyen fuera de un iframe

  override readonly inputCardName: Locator;
  override readonly inputCardNumber: Locator;
  override readonly inputExpMonth: Locator;
  override readonly inputExpYear: Locator;
  override readonly inputCVV: Locator;

  private usingAdyenIframe = false;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    super(page, labels);

    this.checkboxAgreePolicyAndTerms = page.locator("#chkAgreePolicyAndTerms");
    this.checkboxAgreePrivacyPolicy = page.locator("#chkAgreePrivayPolicy");
    this.labelAgreePolicyAndTerms = page.locator(
      'label[for="chkAgreePolicyAndTerms"]',
    );
    this.labelAgreePrivacyPolicy = page.locator(
      'label[for="chkAgreePrivayPolicy"]',
    );

    this.rowCreditCardEU = page.locator('[data-test="box-billing-method-0"]');

    this.rowCreditCardSubscription = page
      .locator(".border-l.border-b.border-r")
      .filter({ hasText: labels.creditCard })
      .last();

    this.radioAdyenProvider = page
      .locator('input[type="radio"][value="Adyen"]')
      .last();
    const adyenRow = page
      .locator(".border-l.border-b.border-r")
      .filter({ has: page.locator('input[type="radio"][value="Adyen"]') })
      .last();
    this.labelAdyenProvider = adyenRow.locator("label.cursor-pointer").first();
    this.inputHolderName = page.locator('input[name="holderName"]').last();

    this.inputCardName = page
      .locator('[data-test="checkout-card-name-input"] input')
      .last();
    this.inputCardNumber = page
      .locator('[data-test="checkout-card-number-input"] input')
      .last();
    this.inputExpMonth = page
      .locator('[data-test="checkout-card-exp-month-input"] input')
      .last();
    this.inputExpYear = page
      .locator('[data-test="checkout-card-exp-year-input"] input')
      .last();
    this.inputCVV = page
      .locator('[data-test="checkout-card-cvv-input"] input')
      .last();
  }

  // ✅ Los campos de número/vencimiento/CVV de Adyen viven cada uno en su
  // propio iframe seguro, ubicados por el atributo data-cse (identificador
  // técnico interno de Adyen, estable sin importar el idioma).
  private cardNumberFrame(): FrameLocator {
    return this.page.frameLocator(
      'span[data-cse="encryptedCardNumber"] iframe',
    );
  }
  private cardExpiryFrame(): FrameLocator {
    return this.page.frameLocator(
      'span[data-cse="encryptedExpiryDate"] iframe',
    );
  }
  private cardCvvFrame(): FrameLocator {
    return this.page.frameLocator(
      'span[data-cse="encryptedSecurityCode"] iframe',
    );
  }

  private async isEventuallyVisible(
    locator: Locator,
    timeout = 8000,
  ): Promise<boolean> {
    return locator
      .waitFor({ state: "visible", timeout })
      .then(() => true)
      .catch(() => false);
  }

  // ✅ Marcar los 2 checkboxes de agreements (términos + privacidad)
  async acceptAgreements() {
    const agreements = [
      {
        input: this.checkboxAgreePolicyAndTerms,
        label: this.labelAgreePolicyAndTerms,
      },
      {
        input: this.checkboxAgreePrivacyPolicy,
        label: this.labelAgreePrivacyPolicy,
      },
    ];

    for (let i = 0; i < agreements.length; i++) {
      const { input, label } = agreements[i];
      const isChecked = await input.isChecked().catch(() => false);
      if (!isChecked) {
        await label.click();
        console.log(`✅ Agreement ${i + 1} aceptado`);
      }
    }
  }

  override async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/checkout/, { timeout: 30000 });
    await this.page.waitForLoadState("networkidle", { timeout: 60000 });
    await expect(this.btnCheckout).toBeVisible({ timeout: 30000 });
  }

  // ✅ Intenta seleccionar la fila directa "Credit Card" (formulario plano).
  // Devuelve true si la sección existe y quedó seleccionada.
  private async trySelectDirectCard(): Promise<boolean> {
    const visible = await this.isEventuallyVisible(
      this.rowCreditCardSubscription,
      6000,
    );
    if (!visible) return false;

    const radioInput = this.rowCreditCardSubscription.locator(
      'input[type="radio"]',
    );
    const isChecked = await radioInput.isChecked().catch(() => false);

    if (!isChecked) {
      await this.rowCreditCardSubscription
        .locator("label.cursor-pointer")
        .first()
        .click();
    }

    await expect(this.inputCardName).toBeVisible({ timeout: 30000 });
    this.usingAdyenIframe = false;
    console.log("✅ Credit Card EU seleccionada (formulario directo)");
    return true;
  }

  // ✅ Intenta seleccionar Adyen ("Alternative Zahlungsmethoden", iframes
  // seguros). Devuelve true si la sección existe y quedó seleccionada.
  private async trySelectAdyen(): Promise<boolean> {
    const visible = await this.isEventuallyVisible(
      this.labelAdyenProvider,
      6000,
    );
    if (!visible) return false;

    const isChecked = await this.radioAdyenProvider
      .isChecked()
      .catch(() => false);

    if (!isChecked) {
      await this.labelAdyenProvider.click();
    }

    await expect(
      this.cardNumberFrame().locator(
        'input[data-fieldtype="encryptedCardNumber"]',
      ),
    ).toBeVisible({ timeout: 30000 });
    this.usingAdyenIframe = true;
    console.log("✅ Adyen (Alternative Zahlungsmethoden) seleccionado");
    return true;
  }

  override async selectCreditCardPayment(
    preferred: PaymentMethodPreference = "creditCard",
  ) {
    await this.page.waitForLoadState("networkidle", { timeout: 30000 });

    const attempts =
      preferred === "adyen"
        ? [() => this.trySelectAdyen(), () => this.trySelectDirectCard()]
        : [() => this.trySelectDirectCard(), () => this.trySelectAdyen()];

    for (const attempt of attempts) {
      if (await attempt()) return;
    }

    console.log(
      "⏭️ Sin selección de método de pago (la cuenta ya tiene uno guardado)",
    );
  }

  // ✅ Llenar tarjeta — vía iframes de Adyen o inputs planos, según lo que
  // selectCreditCardPayment() haya encontrado disponible en este mercado.
  override async fillCardDetails(card: {
    name: string;
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }) {
    if (this.usingAdyenIframe) {
      const expiry = `${card.expMonth}/${card.expYear.slice(-2)}`;

      const numberInput = this.cardNumberFrame().locator(
        'input[data-fieldtype="encryptedCardNumber"]',
      );
      const expiryInput = this.cardExpiryFrame().locator(
        'input[data-fieldtype="encryptedExpiryDate"]',
      );
      const cvvInput = this.cardCvvFrame().locator(
        'input[data-fieldtype="encryptedSecurityCode"]',
      );

      await numberInput.pressSequentially(card.number, { delay: 100 });

      await this.page.waitForTimeout(500);
      await expiryInput.click();
      await expiryInput.pressSequentially(expiry, { delay: 100 });

      await expect(expiryInput).toHaveValue(expiry, { timeout: 5000 });

      await this.page.waitForTimeout(500);
      await cvvInput.click();
      await cvvInput.pressSequentially(card.cvv, { delay: 100 });
      await expect(cvvInput).toHaveValue(card.cvv, { timeout: 5000 });

      await this.inputHolderName.click();
      await this.inputHolderName.pressSequentially(card.name, { delay: 100 });

      console.log("✅ Datos de tarjeta llenados (Adyen)");
      return;
    }

    const visible = await this.isEventuallyVisible(this.inputCardName, 5000);

    if (!visible) {
      console.log(
        "⏭️ Sin formulario de tarjeta que llenar (método de pago ya guardado)",
      );
      return;
    }

    await super.fillCardDetails(card);
  }

  override async verifySubscriptionBillingAddress() {
    const visible = await this.isEventuallyVisible(this.labelBoxUseSameAddress);

    if (!visible) {
      console.log("⏭️ Sin selección de billing address (ya hay una guardada)");
      return;
    }

    await super.verifySubscriptionBillingAddress();
  }

  // ✅ Flujo completo EU
  async completeCheckoutEuropean(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    paymentMethod: PaymentMethodPreference = "creditCard",
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();

    // 1. Seleccionar método de pago y llenar la tarjeta
    await this.selectCreditCardPayment(paymentMethod);
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
