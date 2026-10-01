import { Page, Locator, expect } from "@playwright/test";
import { CheckoutPage } from "../pages/CheckoutPage";
import { MarketLabels, defaultLabels } from "../fixtures/marketLabels";
import {
  PaymentProvider,
  PaymentCaseBankDetails,
} from "../fixtures/paymentCases";

export type PaymentMethodPreference = "creditCard" | "adyen";

// ✅ Métodos anidados dentro del dropin de Adyen
const ADYEN_NESTED_METHOD_CLASS: Partial<Record<PaymentProvider, string>> = {
  sofort: "directEbanking",
  sepaDirectDebit: "sepadirectdebit",
  klarna: "klarna_paynow",
};

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

  // ✅ GlobalCollect ("Bank Draft - TEST")
  readonly radioGlobalCollectProvider: Locator;
  readonly rowGlobalCollect: Locator;

  // ✅ PayPal (BraintreeWithPayPal)
  readonly radioPayPalProvider: Locator;
  readonly rowPayPal: Locator;

  override readonly inputCardName: Locator;
  override readonly inputCardNumber: Locator;
  override readonly inputExpMonth: Locator;
  override readonly inputExpYear: Locator;
  override readonly inputCVV: Locator;

  protected usingAdyenRedirectMethod: PaymentProvider | null = null;
  protected usingGlobalCollect = false;
  protected usingSepa = false;
  protected usingPayPal = false;

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

    this.radioGlobalCollectProvider = page.locator(
      'input[type="radio"][value="GlobalCollect"]',
    );
    this.rowGlobalCollect = page
      .locator('[data-test="checkout-payment-method-radio"]')
      .filter({ has: this.radioGlobalCollectProvider });

    this.radioPayPalProvider = page.locator(
      'input[type="radio"][value="BraintreeWithPayPal"]',
    );
    this.rowPayPal = page
      .locator('[data-test="checkout-payment-method-radio"]')
      .filter({ has: this.radioPayPalProvider });

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

  // ✅ GlobalCollect ("Bank Draft - TEST")
  private async selectGlobalCollect(bankDetails?: PaymentCaseBankDetails) {
    const isChecked = await this.radioGlobalCollectProvider
      .isChecked()
      .catch(() => false);
    if (!isChecked) {
      await this.rowGlobalCollect
        .locator("label.cursor-pointer")
        .first()
        .click();
    }

    const accountNameInput = this.rowGlobalCollect.locator("#AccountName");
    const ibanInput = this.rowGlobalCollect.locator("#Iban");
    await expect(accountNameInput).toBeVisible({ timeout: 15000 });

    if (bankDetails) {
      await accountNameInput.fill(bankDetails.ownerName);
      await ibanInput.fill(bankDetails.iban);
    }

    this.usingAdyenIframe = false;
    this.usingGlobalCollect = true;
    console.log("✅ GlobalCollect (Bank Draft) seleccionado");
  }

  // ✅ Métodos anidados dentro del dropin de Adyen que no son la tarjeta
  // (Sofort/SEPA/Klarna)
  private async selectAdyenNestedMethod(
    provider: PaymentProvider,
    bankDetails?: PaymentCaseBankDetails,
  ) {
    const isAdyenChecked = await this.radioAdyenProvider
      .isChecked()
      .catch(() => false);
    if (!isAdyenChecked) {
      await this.labelAdyenProvider.click();
    }
    await this.page.waitForTimeout(1000);

    const methodClass = ADYEN_NESTED_METHOD_CLASS[provider];
    const methodContainer = this.page.locator(
      `.adyen-checkout__payment-method--${methodClass}`,
    );
    await methodContainer.locator("button").first().click();
    await this.page.waitForTimeout(1000);

    this.usingAdyenIframe = false;

    if (provider === "sepaDirectDebit") {
      this.usingSepa = true;
      if (bankDetails) {
        await methodContainer
          .locator('input[name="ownerName"]')
          .fill(bankDetails.ownerName);
        await methodContainer
          .locator('input[name="ibanNumber"]')
          .fill(bankDetails.iban);
      }
      console.log("✅ SEPA Lastschrift seleccionado (formulario inline)");
      return;
    }

    // Sofort / Klarna: solo redirect, sin campos propios.
    this.usingAdyenRedirectMethod = provider;
    console.log(`✅ "${provider}" seleccionado (dentro de Adyen, redirect)`);
  }

  override async selectCreditCardPayment(
    preferred: PaymentMethodPreference = "creditCard",
    provider?: PaymentProvider,
    bankDetails?: PaymentCaseBankDetails,
  ) {
    await this.page.waitForLoadState("networkidle", { timeout: 30000 });

    if (provider === "GlobalCollect") {
      await this.selectGlobalCollect(bankDetails);
      return;
    }
    if (
      provider === "sofort" ||
      provider === "klarna" ||
      provider === "sepaDirectDebit"
    ) {
      await this.selectAdyenNestedMethod(provider, bankDetails);
      return;
    }

    if (provider === "Braintree") {
      const selected = await this.trySelectDirectCard();
      if (!selected) {
        throw new Error(
          "Braintree: no se encontró la fila de tarjeta directa ('Credit Card - TEST') en este checkout",
        );
      }
      return;
    }
    if (provider === "Adyen") {
      const selected = await this.trySelectAdyen();
      if (!selected) {
        throw new Error(
          "Adyen: no se encontró la sección de Adyen en este checkout",
        );
      }
      return;
    }
    if (provider === "BraintreeWithPayPal") {
      const isChecked = await this.radioPayPalProvider
        .isChecked()
        .catch(() => false);
      if (!isChecked) {
        await this.rowPayPal.locator("label.cursor-pointer").first().click();
      }
      this.usingAdyenIframe = false;
      this.usingPayPal = true;
      console.log(
        "✅ PayPal seleccionado (sin formulario de tarjeta — el popup se abre al confirmar la orden)",
      );
      return;
    }

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

  // ✅ Llenar tarjeta
  override async fillCardDetails(card: {
    name: string;
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }) {
    if (
      this.usingGlobalCollect ||
      this.usingSepa ||
      this.usingAdyenRedirectMethod ||
      this.usingPayPal
    ) {
      return;
    }
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
      await this.page.waitForTimeout(300);

      for (let attempt = 1; attempt <= 3; attempt++) {
        const rawValue = (
          await numberInput.inputValue().catch(() => "")
        ).replace(/\s/g, "");
        if (rawValue.length >= card.number.length) break;
        console.log(
          `⚠️ Número de tarjeta incompleto en el campo (Adyen: "${rawValue}"), reintentando (${attempt}/3)...`,
        );
        await numberInput.click();
        await this.page.keyboard.press("Control+A");
        await this.page.keyboard.press("Backspace");
        await numberInput.pressSequentially(card.number, { delay: 150 });
        await this.page.waitForTimeout(300);
      }

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
