import { Page, Locator, expect } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;

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

  constructor(page: Page) {
    this.page = page;

    // ✅ Input real (oculto, solo para verificar aria-checked)
    this.radioCartCreditCard = page.locator(
      '[data-test="cart-billing-method-0"]',
    );

    // ✅ Fila visible del método de pago
    this.rowCreditCard = page
      .locator(".color-row", {
        hasText: "Credit Card",
      })
      .first();

    // ✅ Label para hacer clic
    this.labelCartCreditCard = page
      .locator("label", {
        hasText: "Credit Card",
      })
      .first();

    // ✅ TODAY'S ORDER - Payment
    this.radioCartCreditCard = page.locator(
      '[data-test="cart-billing-method-0"]',
    );
    this.labelCartCreditCard = page
      .locator("label", {
        hasText: "Credit Card",
      })
      .first();

    // ✅ Card fields - por data-test
    this.inputCardName = page.locator('[data-test="cardName-field"]');
    this.inputCardNumber = page.locator('[data-test="cardNumber-field"]');
    this.inputExpMonth = page.locator('[data-test="expMonth-field"]');
    this.inputExpYear = page.locator('[data-test="expYear-field"]');
    this.inputCVV = page.locator('[data-test="ccv-field"]');

    // ✅ TODAY'S ORDER - Billing Address
    this.labelUseShippingAddress = page.locator("label", {
      hasText: "Use my shipping address",
    });
    this.labelUseDifferentAddress = page
      .locator("label", {
        hasText: "Use Different Address",
      })
      .first();

    // ✅ SUBSCRIPTION - Payment
    this.radioBoxSameAsCart = page.locator(
      '[data-test="box-billing-method-0"]',
    );
    this.labelBoxSameAsCart = page.locator("label", {
      hasText: "Same as Your Cart Billing Method",
    });

    // ✅ SUBSCRIPTION - Billing Address
    this.labelBoxUseSameAddress = page.locator("label", {
      hasText: "Use same address as today's order",
    });

    // ✅ Personal consumption
    this.checkboxPersonalConsumption = page
      .locator('input[role="checkbox"]')
      .last();
    this.labelPersonalConsumption = page.locator("label", {
      hasText: "Check this box if the products",
    });

    // ✅ Totales
    this.orderTotalAmount = page.locator(
      '[data-cy="summary-order-totalAmount"]',
    );
    this.subscriptionTotalAmount = page.locator(
      '[data-cy="summary-subscription-totalAmount"]',
    );

    // ✅ Botones
    this.btnCheckout = page.locator('[data-test="continue"]');
    this.btnBackToInformation = page.getByRole("button", {
      name: "Back to Information",
    });
  }

  // ✅ Verificar que estamos en /checkout y todo cargó
  async verifyPageLoaded() {
    // 1. Esperar URL
    await expect(this.page).toHaveURL(/\/checkout/, { timeout: 30000 });

    // 2. Esperar networkidle
    await this.page.waitForLoadState("networkidle", { timeout: 60000 });

    // 3. Esperar contenedor principal
    await expect(this.page.locator('[data-cy="checkout-page"]')).toBeVisible({
      timeout: 30000,
    });

    // 4. ✅ Buscar la FILA visible, no el input oculto
    await expect(this.rowCreditCard).toBeVisible({ timeout: 30000 });
  }

  // ✅ Seleccionar Credit Card para TODAY'S ORDER
  async selectCreditCardPayment() {
    // ✅ evaluate lee el DOM sin esperar visibilidad
    const isChecked = await this.page.evaluate(() => {
      const input = document.querySelector(
        '[data-test="cart-billing-method-0"]',
      );
      return input?.getAttribute("aria-checked");
    });

    if (isChecked !== "true") {
      await this.rowCreditCard.click();
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
    await this.inputCardName.clear();
    await this.inputCardName.pressSequentially(card.name, { delay: 100 });

    await this.inputCardNumber.clear();
    await this.inputCardNumber.pressSequentially(card.number, { delay: 100 });

    await this.inputExpMonth.clear();
    await this.inputExpMonth.pressSequentially(card.expMonth, { delay: 100 });

    await this.inputExpYear.clear();
    await this.inputExpYear.pressSequentially(card.expYear, { delay: 100 });

    await this.inputCVV.clear();
    await this.inputCVV.pressSequentially(card.cvv, { delay: 100 });
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
    const isChecked = await this.page.evaluate(() => {
      const inputs = document.querySelectorAll('input[role="checkbox"]');
      const last = inputs[inputs.length - 1];
      return last?.getAttribute("aria-checked");
    });

    if (isChecked !== "true") {
      console.log("⏳ Marcando personal consumption...");

      // ✅ Clic + esperar API
      await Promise.all([
        this.page.waitForResponse(
          (response) => response.url().includes("ProductsWillNotBeResold"),
          { timeout: 15000 },
        ),
        this.labelPersonalConsumption.click(),
      ]);

      // ✅ Esperar que aparezca el loading
      const loadingSpinner = this.page.locator(".loading-view");
      await expect(loadingSpinner)
        .toBeVisible({ timeout: 5000 })
        .catch(() => {
          console.log("⏭️ Loading muy rápido, continuando...");
        });

      // ✅ Esperar que desaparezca el loading
      await expect(loadingSpinner).not.toBeVisible({ timeout: 15000 });

      // ✅ Esperar networkidle
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
  async placeOrder() {
    await this.btnCheckout.click();
    await expect(this.page).toHaveURL(/\/complete/, { timeout: 30000 });
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
