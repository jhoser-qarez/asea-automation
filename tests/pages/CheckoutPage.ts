import { Page, Locator, FrameLocator, expect } from "@playwright/test";
import { MarketLabels, defaultLabels } from "../fixtures/marketLabels";

export class CheckoutPage {
  readonly page: Page;
  readonly labels: MarketLabels;

  // 🎯 Adyen ("Alternative Payments")
  readonly radioAdyenProvider: Locator;
  readonly inputHolderName: Locator;
  protected usingAdyenIframe = false;

  // 🎯 TODAY'S ORDER - Payment Methods
  readonly radioCartCreditCard: Locator; // para verificar estado
  readonly rowCreditCard: Locator; // para verificar visibilidad
  readonly labelCartCreditCard: Locator; // para hacer clic

  // 🎯 TODAY'S ORDER - Card fields
  readonly inputCardName: Locator;
  readonly inputCardNumber: Locator;
  readonly inputExpMonth: Locator;
  readonly inputExpYear: Locator;
  readonly inputCVV: Locator;

  // 🎯 TODAY'S ORDER - Billing Address
  readonly labelUseShippingAddress: Locator;
  readonly labelUseDifferentAddress: Locator;

  // 🎯 SUBSCRIPTION - Payment Methods
  readonly radioBoxSameAsCart: Locator;
  readonly labelBoxSameAsCart: Locator;

  // 🎯 SUBSCRIPTION - Billing Address
  readonly labelBoxUseSameAddress: Locator;

  // 🎯 Personal consumption checkbox
  readonly checkboxPersonalConsumption: Locator;
  readonly labelPersonalConsumption: Locator;

  // 🎯 Totales
  readonly orderTotalAmount: Locator;
  readonly subscriptionTotalAmount: Locator;

  // 🎯 Botones
  readonly btnCheckout: Locator;
  readonly btnBackToInformation: Locator;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    this.page = page;
    this.labels = labels;

    // ✅ Input real (oculto, solo para verificar aria-checked)
    this.radioCartCreditCard = page.locator(
      '[data-test="cart-billing-method-0"]',
    );

    // ✅ Fila visible del método de pago

    this.rowCreditCard = page
      .locator(".border-l.border-b.border-r")
      .filter({ hasText: labels.creditCard })
      .first();

    // ✅ Label para hacer clic
    this.labelCartCreditCard = page
      .locator("label", {
        hasText: labels.creditCard,
      })
      .first();

    // ✅ TODAY'S ORDER - Payment
    this.radioCartCreditCard = page.locator(
      '[data-test="cart-billing-method-0"]',
    );
    this.labelCartCreditCard = page
      .locator("label", {
        hasText: labels.creditCard,
      })
      .first();

    // ✅ Card fields - por data-test
    this.inputCardName = page.locator(
      '[data-test="checkout-card-name-input"] input',
    );
    this.inputCardNumber = page.locator(
      '[data-test="checkout-card-number-input"] input',
    );
    this.inputExpMonth = page.locator(
      '[data-test="checkout-card-exp-month-input"] input',
    );
    this.inputExpYear = page.locator(
      '[data-test="checkout-card-exp-year-input"] input',
    );
    this.inputCVV = page.locator('[data-test="checkout-card-cvv-input"] input');

    // ✅ TODAY'S ORDER - Billing Address
    this.labelUseShippingAddress = page.locator("label", {
      hasText: labels.useMyShippingAddress,
    });
    this.labelUseDifferentAddress = page
      .locator("label", {
        hasText: labels.useDifferentAddress,
      })
      .first();

    // ✅ SUBSCRIPTION - Payment
    this.radioBoxSameAsCart = page.locator(
      '[data-test="box-billing-method-0"]',
    );
    this.labelBoxSameAsCart = page.locator("label", {
      hasText: labels.sameAsCartBillingMethod,
    });

    // ✅ SUBSCRIPTION - Billing Address
    this.labelBoxUseSameAddress = page.locator("label", {
      hasText: labels.useSameAddressAsTodaysOrder,
    });

    // ✅ Personal consumption

    this.checkboxPersonalConsumption = page.locator(
      "#chkProductWillNotBeResold",
    );
    this.labelPersonalConsumption = page.locator(
      'label[for="chkProductWillNotBeResold"]',
    );

    // ✅ Totales
    this.orderTotalAmount = page.locator(
      '[data-test="checkout-todays-order-total-value"]',
    );
    this.subscriptionTotalAmount = page.locator(
      '[data-test="checkout-subscriptions-total-value"]',
    );

    // ✅ Botones
    this.btnCheckout = page.locator(
      '[data-test="checkout-final-checkout-button"]',
    );
    this.btnBackToInformation = page.getByRole("button", {
      name: labels.backToInformation,
    });

    // ✅ Adyen
    this.radioAdyenProvider = page.locator(
      'input[type="radio"][value="Adyen"]',
    );
    this.inputHolderName = page.locator('input[name="holderName"]');
  }

  protected cardNumberFrame(): FrameLocator {
    return this.page.frameLocator(
      'span[data-cse="encryptedCardNumber"] iframe',
    );
  }
  protected cardExpiryFrame(): FrameLocator {
    return this.page.frameLocator(
      'span[data-cse="encryptedExpiryDate"] iframe',
    );
  }
  protected cardCvvFrame(): FrameLocator {
    return this.page.frameLocator(
      'span[data-cse="encryptedSecurityCode"] iframe',
    );
  }

  // ✅ Verificar que estamos en /checkout y todo cargó
  async verifyPageLoaded() {
    // 1. Esperar URL
    await expect(this.page).toHaveURL(/\/checkout/, { timeout: 30000 });

    // 2. Esperar networkidle
    await this.page.waitForLoadState("networkidle", { timeout: 60000 });

    // 3. Esperar contenedor principal

    await expect(this.page.locator('[role="radiogroup"]').first()).toBeVisible({
      timeout: 30000,
    });

    // 4. ✅ Buscar la FILA visible, no el input oculto

    const creditCardRowVisible = await this.rowCreditCard
      .waitFor({ state: "visible", timeout: 30000 })
      .then(() => true)
      .catch(() => false);
    if (!creditCardRowVisible) {
      await expect(this.radioAdyenProvider).toBeAttached({ timeout: 5000 });
    }
  }

  // ✅ Seleccionar Credit Card para TODAY'S ORDER

  async selectCreditCardPayment() {
    const adyenPresent = await this.radioAdyenProvider
      .waitFor({ state: "attached", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    let adyenIsDefault = false;
    if (adyenPresent) {
      const deadline = Date.now() + 12000;
      while (Date.now() < deadline) {
        adyenIsDefault = await this.radioAdyenProvider
          .isChecked()
          .catch(() => false);
        if (adyenIsDefault) break;
        await this.page.waitForTimeout(500);
      }
    }

    if (adyenIsDefault) {
      await expect(
        this.cardNumberFrame().locator(
          'input[data-fieldtype="encryptedCardNumber"]',
        ),
      ).toBeVisible({ timeout: 30000 });
      this.usingAdyenIframe = true;
      console.log("✅ Adyen seleccionado");
      return;
    }

    this.usingAdyenIframe = false;

    // ⚠️ Confirmado con evidencia real: cuando el checkout tiene Today's
    // Order + Suscripción a la vez, cada sección trae su PROPIO radio group
    // de pago (2 inputs value="Braintree" en el DOM, uno por sección) — se
    // escopa a la primera (Today's Order, la que maneja este método; la de
    // Suscripción se resuelve aparte vía verifySubscriptionSamePayment()).
    // ⚠️ Confirmado con evidencia real (Taiwan, RENUAdvanced): la fila de
    // Today's Order puede venir por defecto en la variante "Credit Card -
    // TEST 3ds" (desafío 3D-Secure real) — un intento anterior de "evitarla"
    // terminó clickeando el radio de la sección de Suscripción por error (el
    // único "no-3ds" en el DOM pertenece a ESA sección, no a Today's Order).
    // La fila 3ds de Today's Order es la correcta para esa sección — se deja
    // el default tal cual y el desafío se resuelve en placeOrder() vía
    // handle3dsChallenge().
    const radioBraintree = this.page
      .locator('input[type="radio"][value="Braintree"]')
      .first();
    const braintreePresent = (await radioBraintree.count()) > 0;

    if (braintreePresent) {
      const isBraintreeChecked = await radioBraintree
        .isChecked()
        .catch(() => false);
      if (!isBraintreeChecked) {
        const id = await radioBraintree.getAttribute("id");
        await this.page.locator(`label[for="${id}"]`).first().click();
        console.log("✅ Braintree (Credit Card) seleccionado explícitamente");
      }
    } else {
      const isChecked = await this.page.evaluate(() => {
        const input = document.querySelector(
          '[data-test="cart-billing-method-0"]',
        );
        return input?.getAttribute("aria-checked");
      });

      if (isChecked !== "true") {
        await this.rowCreditCard.click();
      }
    }

    await expect(this.inputCardName).toBeVisible({ timeout: 10000 });
  }

  // ✅ Llenar datos de la tarjeta
  async fillCardDetails(card: {
    name: string;
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }) {
    if (this.usingAdyenIframe) {
      await this.fillCardDetailsAdyen(card);
      return;
    }

    await this.inputCardName.clear();
    await this.inputCardName.pressSequentially(card.name, { delay: 100 });

    await this.inputCardNumber.clear();
    await this.inputCardNumber.pressSequentially(card.number, { delay: 100 });

    await this.page.waitForTimeout(500);
    await this.inputExpMonth.click();
    await this.inputExpMonth.clear();
    await this.inputExpMonth.pressSequentially(card.expMonth, { delay: 100 });
    await expect(this.inputExpMonth).toHaveValue(card.expMonth, {
      timeout: 5000,
    });

    await this.page.waitForTimeout(500);
    await this.inputExpYear.click();
    await this.inputExpYear.clear();
    await this.inputExpYear.pressSequentially(card.expYear, { delay: 100 });
    await expect(this.inputExpYear).toHaveValue(card.expYear, {
      timeout: 5000,
    });

    await this.page.waitForTimeout(500);
    await this.inputCVV.click();
    await this.inputCVV.clear();
    await this.inputCVV.pressSequentially(card.cvv, { delay: 100 });
    await expect(this.inputCVV).toHaveValue(card.cvv, { timeout: 5000 });
  }

  // ✅ Rama Adyen (dropin embebido en iframes)
  private async fillCardDetailsAdyen(card: {
    name: string;
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }) {
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
      const rawValue = (await numberInput.inputValue().catch(() => "")).replace(
        /\s/g,
        "",
      );
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
  }

  // ✅ Billing Address TODAY'S ORDER
  // Por defecto ya viene "Use my shipping address" marcado

  async verifyTodayOrderBillingAddress() {
    const isChecked = await this.page.evaluate(() => {
      const inputs = document.querySelectorAll('input[value="radio-1"]');
      // El segundo radio-1 es el de suscripción
      const last = inputs[inputs.length - 1];
      return last?.getAttribute("aria-checked");
    });

    if (isChecked !== "true") {
      await this.labelUseShippingAddress.click();
    }
    console.log("✅ Billing address Today Order = mismo del shipping address");
  }

  // ✅Verificar billing address suscripción
  // Por defecto ya viene "Use my shipping address" marcado
  async verifySubscriptionBillingAddress() {
    const isChecked = await this.page.evaluate(() => {
      const inputs = document.querySelectorAll('input[value="radio-1"]');
      // El segundo radio-1 es el de suscripción
      const last = inputs[inputs.length - 1];
      return last?.getAttribute("aria-checked");
    });

    if (isChecked !== "true") {
      await this.labelBoxUseSameAddress.click();
    }
    console.log("✅ Billing address suscripción = misma dirección de hoy");
  }

  // ✅ Subscription: usar mismo método de pago
  // Por defecto ya viene "Same as Cart Billing" marcado

  async verifySubscriptionSamePayment() {
    const present = await this.labelBoxSameAsCart
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!present) {
      console.log(
        "⏭️ Sin opción 'Same as Your Cart Billing Method' (carrito solo de suscripción)",
      );
      return;
    }

    // ✅ evaluate en lugar de getAttribute
    const isChecked = await this.page.evaluate(() => {
      const input = document.querySelector(
        '[data-test="box-billing-method-0"]',
      );
      return input?.getAttribute("aria-checked");
    });

    if (isChecked !== "true") {
      await this.labelBoxSameAsCart.click();
    }
  }

  // ✅ Marcar checkbox personal consumption

  async checkPersonalConsumption() {
    const present = await this.checkboxPersonalConsumption
      .waitFor({ state: "attached", timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (!present) {
      console.log(
        "⏭️ Sin checkbox de personal consumption en este mercado (no aplica)",
      );
      return;
    }

    // ✅ Checkbox nativo: leer estado con isChecked(), no aria-checked
    const isChecked = await this.checkboxPersonalConsumption.isChecked();

    if (!isChecked) {
      console.log("⏳ Marcando personal consumption...");

      await this.labelPersonalConsumption.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);

      // ✅ Clic + esperar API
      await Promise.all([
        this.page
          .waitForResponse(
            (response) => response.url().includes("ProductsWillNotBeResold"),
            { timeout: 30000 },
          )
          .catch(() => {
            console.log("⏭️ Sin respuesta API, continuando...");
          }),
        this.labelPersonalConsumption.click(),
      ]);

      // ✅ Esperar loading
      const loadingSpinner = this.page.locator(".loading-view");
      await expect(loadingSpinner)
        .toBeVisible({ timeout: 5000 })
        .catch(() => {
          console.log("⏭️ Loading muy rápido, continuando...");
        });

      await expect(loadingSpinner).not.toBeVisible({ timeout: 15000 });
      await this.page.waitForLoadState("networkidle", { timeout: 15000 });

      console.log("✅ Recálculo completado, montos actualizados");
    }
  }

  // ✅ Verificar totales
  async verifyTotals(orderTotal: string, subscriptionTotal: string) {
    await expect(this.orderTotalAmount).toContainText(orderTotal);
    await expect(this.subscriptionTotalAmount).toContainText(subscriptionTotal);
  }

  // ✅ Hacer checkout final
  // ⚠️ Confirmado con evidencia real (Taiwan, RENUAdvanced): algunos
  // productos/cuentas quedan por defecto en una variante "3ds" de Braintree
  // que dispara un desafío 3D-Secure real — sin manejarlo, el checkout se
  // queda colgado en /checkout para siempre. Se detecta automáticamente
  // (sin necesitar saber de antemano si aplica) y se resuelve con la misma
  // lógica ya probada en EnrollCheckoutPage.handle3dsChallenge().
  async placeOrder() {
    await this.btnCheckout.click();
    await this.handle3dsChallenge();
    await expect(this.page).toHaveURL(/\/complete/, { timeout: 60000 });
  }

  // ✅ Challenge 3DS — detecta si aparece (en cualquier iframe) y lo
  // resuelve; si no aparece en el margen corto, no bloquea el flujo normal.
  protected async handle3dsChallenge(): Promise<boolean> {
    const inputSel = '#password-input, input[name="answer"]';
    const deadline = Date.now() + 10000;
    let target: import("@playwright/test").Frame | undefined;
    while (Date.now() < deadline && !target) {
      if (/\/complete/.test(this.page.url())) return false;
      for (const f of this.page.frames()) {
        const visible = await f
          .locator(inputSel)
          .first()
          .isVisible()
          .catch(() => false);
        if (visible) {
          target = f;
          break;
        }
      }
      if (!target) await this.page.waitForTimeout(500);
    }
    if (!target) return false;

    console.log(`🔐 Challenge 3DS (iframe): ${target.url()}`);
    await target.locator(inputSel).first().fill("password");
    await target
      .locator('#buttonSubmit, button[type="submit"]')
      .first()
      .click();
    console.log('✅ 3DS challenge: "password" + Continue');
    return true;
  }

  // ✅ Capturar order total (opcional, puede no existir)
  async captureOrderTotal(): Promise<string> {
    try {
      const orderTotal = await this.page.evaluate(() => {
        const elements = document.querySelectorAll(
          '[data-cy="summary-order-totalAmount"]',
        );
        for (const el of Array.from(elements).reverse()) {
          const style = window.getComputedStyle(el);
          if (style.display !== "none" && style.visibility !== "hidden") {
            return el.textContent?.trim() ?? "";
          }
        }
        return "";
      });

      if (orderTotal) {
        console.log(`💰 Order Total en checkout: ${orderTotal}`);
        return orderTotal;
      }
      console.log("💰 No hay Today Order en este checkout");
      return "";
    } catch {
      console.log("💰 No hay Today Order en este checkout");
      return "";
    }
  }

  // ✅ Capturar subscription total (opcional, puede no existir)
  async captureSubscriptionTotal(): Promise<string> {
    try {
      // ✅ Lee el DOM directamente sin esperar visibilidad
      const subscriptionTotal = await this.page.evaluate(() => {
        const elements = document.querySelectorAll(
          '[data-cy="summary-subscription-totalAmount"]',
        );
        // Toma el último elemento visible
        for (const el of Array.from(elements).reverse()) {
          const style = window.getComputedStyle(el);
          if (style.display !== "none" && style.visibility !== "hidden") {
            return el.textContent?.trim() ?? "";
          }
        }
        return "";
      });

      if (subscriptionTotal) {
        console.log(`💰 Subscription Total en checkout: ${subscriptionTotal}`);
        return subscriptionTotal;
      }
      console.log("💰 No hay Subscription en este checkout");
      return "";
    } catch {
      console.log("💰 No hay Subscription en este checkout");
      return "";
    }
  }

  async completeCheckout(card: {
    name: string;
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment();
    await this.fillCardDetails(card);
    await this.verifyTodayOrderBillingAddress();
    await this.verifySubscriptionBillingAddress();
    await this.checkPersonalConsumption();

    // ✅ Capturamos ANTES de hacer clic en checkout
    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    await this.placeOrder();

    // ✅ Retornamos los totales para usarlos en CompletePage
    return { orderTotal, subscriptionTotal };
  }

  async completeCheckoutOnlySuscriptionType(card: {
    name: string;
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment();
    await this.verifySubscriptionSamePayment();
    await this.fillCardDetails(card);
    //await this.verifyShippingAddressSelected();

    //await this.checkPersonalConsumption();

    // ✅ Capturamos ANTES de hacer clic en checkout
    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    await this.placeOrder();

    // ✅ Retornamos los totales para usarlos en CompletePage
    return { orderTotal, subscriptionTotal };
  }

  // Llenar billing address en /checkout (necesario para Will Call)
  async fillBillingAddress(data: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  }) {
    const inputs = {
      address1: this.page.locator('[data-test="AddressLine1-field"]').first(),
      address2: this.page.locator('[data-test="AddressLine2-field"]').first(),
      city: this.page.locator('[data-test="CountryCity-field"]').first(),
      state: this.page.locator('[data-test="State-field"]').first(),
      zip: this.page.locator('[data-test="Zip-field"]').first(),
    };

    await inputs.address1.clear();
    await inputs.address1.pressSequentially(data.address1, { delay: 100 });

    if (data.address2) {
      await inputs.address2.clear();
      await inputs.address2.pressSequentially(data.address2, { delay: 100 });
    }

    await inputs.city.clear();
    await inputs.city.pressSequentially(data.city, { delay: 100 });

    await inputs.state.clear();
    await inputs.state.pressSequentially(data.state, { delay: 100 });
    await this.page.getByText(data.state, { exact: true }).first().click();

    await inputs.zip.clear();
    await inputs.zip.pressSequentially(data.zip, { delay: 100 });

    console.log("Billing address (Order) llenada");
  }

  //  Llenar billing address de suscripción en /checkout (Will Call)
  async fillSubscriptionBillingAddress(data: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  }) {
    const inputs = {
      address1: this.page.locator('[data-test="AddressLine1-field"]').last(),
      address2: this.page.locator('[data-test="AddressLine2-field"]').last(),
      city: this.page.locator('[data-test="CountryCity-field"]').last(),
      state: this.page.locator('[data-test="State-field"]').last(),
      zip: this.page.locator('[data-test="Zip-field"]').last(),
    };

    await inputs.address1.clear();
    await inputs.address1.pressSequentially(data.address1, { delay: 100 });

    if (data.address2) {
      await inputs.address2.clear();
      await inputs.address2.pressSequentially(data.address2, { delay: 100 });
    }

    await inputs.city.clear();
    await inputs.city.pressSequentially(data.city, { delay: 100 });

    await inputs.state.clear();
    await inputs.state.pressSequentially(data.state, { delay: 100 });
    await this.page.getByText(data.state, { exact: true }).first().click();

    await inputs.zip.clear();
    await inputs.zip.pressSequentially(data.zip, { delay: 100 });

    console.log(" Billing address (Suscripción) llenada");
  }

  //  Flujo completo de checkout para Will Call (Order + Suscripción)
  async completeCheckoutWillCall(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    billingAddress: {
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zip: string;
    },
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();

    // 1. Seleccionar Credit Card
    await this.selectCreditCardPayment();
    await this.fillCardDetails(card);

    // 2. Billing address de Today's Order (obligatorio en Will Call)
    await this.fillBillingAddress(billingAddress);

    // 3. Subscription: mismo método de pago
    await this.verifySubscriptionSamePayment();

    // 4. Billing address de Suscripción (mismo que order)
    await this.fillSubscriptionBillingAddress(billingAddress);

    // 5. Personal consumption
    await this.checkPersonalConsumption();

    // 6. Capturar totales
    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    // 7. Confirmar orden
    await this.placeOrder();

    return { orderTotal, subscriptionTotal };
  }

  //  Flujo checkout Will Call solo suscripción
  async completeCheckoutWillCallOnlySubscription(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    billingAddress: {
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zip: string;
    },
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();

    // 1. Seleccionar Credit Card
    await this.selectCreditCardPayment();
    await this.verifySubscriptionSamePayment();
    await this.fillCardDetails(card);

    // 2. Billing address de Suscripción (obligatorio en Will Call)
    await this.fillSubscriptionBillingAddress(billingAddress);

    // 3. Capturar totales
    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    // 4. Confirmar orden
    await this.placeOrder();

    return { orderTotal, subscriptionTotal };
  }
}
