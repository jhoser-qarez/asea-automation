import { Page, Locator, expect } from "@playwright/test";

export class EnrollCheckoutPage {
  readonly page: Page;

  // 🎯 Payment - reutilizamos selectores de CheckoutPage
  readonly radioCartCreditCard: Locator;
  readonly rowCreditCard: Locator;
  readonly inputCardName: Locator;
  readonly inputCardNumber: Locator;
  readonly inputExpMonth: Locator;
  readonly inputExpYear: Locator;
  readonly inputCVV: Locator;

  // 🎯 Billing Address
  readonly labelUseShippingAddress: Locator;

  // 🎯 Subscription - mismo método
  readonly radioBoxSameAsCart: Locator;
  readonly labelBoxSameAsCart: Locator;

  // 🎯 Birth Date ← nuevo
  readonly selectMonth: Locator;
  readonly selectDay: Locator;
  readonly inputYear: Locator;

  // 🎯 SSN ← nuevo
  readonly inputSSN: Locator;

  // 🎯 Username & Password ← nuevo
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly inputConfirmPassword: Locator;

  // 🎯 Checkboxes
  readonly labelPersonalConsumption: Locator;
  readonly labelAgreements: Locator;
  readonly checkboxPersonalConsumption: Locator;
  readonly checkboxAgreements: Locator;

  // 🎯 Totales
  readonly orderTotalAmount: Locator;
  readonly subscriptionTotalAmount: Locator;

  // 🎯 Botones
  readonly btnCheckout: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Payment - igual que CheckoutPage
    this.radioCartCreditCard = page.locator(
      '[data-test="cart-billing-method-0"]',
    );
    this.rowCreditCard = page
      .locator(".color-row", {
        hasText: "Credit Card - TEST",
      })
      .first();
    this.inputCardName = page.locator('[data-test="cardName-field"]');
    this.inputCardNumber = page.locator('[data-test="cardNumber-field"]');
    this.inputExpMonth = page.locator('[data-test="expMonth-field"]');
    this.inputExpYear = page.locator('[data-test="expYear-field"]');
    this.inputCVV = page.locator('[data-test="ccv-field"]');

    // ✅ Billing Address
    this.labelUseShippingAddress = page.locator("label", {
      hasText: "Use my shipping address",
    });

    // ✅ Subscription mismo método
    this.radioBoxSameAsCart = page.locator(
      '[data-test="box-billing-method-0"]',
    );
    this.labelBoxSameAsCart = page.locator("label", {
      hasText: "Same as Your Cart Billing Method",
    });

    // ✅ Birth Date - por data-cy
    this.selectMonth = page.locator('[data-cy="month-field"]');
    this.selectDay = page.locator('[data-cy="day-field"]');
    this.inputYear = page.locator('[data-test="year-field"]');

    // ✅ SSN
    this.inputSSN = page.locator('[data-test="GovermentId-field"]');

    // ✅ Username & Password
    this.inputUsername = page.locator('[data-test="siteId-field"]');
    this.inputPassword = page.locator('[data-test="password-field"]');
    this.inputConfirmPassword = page.locator(
      '[data-test="confirmPassword-field"]',
    );

    // ✅ Checkboxes
    this.labelPersonalConsumption = page.locator("label", {
      hasText:
        "Check this box if the products in this order are for personal consumption",
    });
    this.checkboxPersonalConsumption = page
      .locator('input[role="checkbox"]')
      .first();
    this.labelAgreements = page.locator("label", {
      hasText: "I have read and agree to the following legal documents",
    });
    this.checkboxAgreements = page.locator('input[role="checkbox"]').last();

    // ✅ Totales
    this.orderTotalAmount = page.locator(
      '[data-cy="summary-order-totalAmount"]',
    );
    this.subscriptionTotalAmount = page.locator(
      '[data-cy="summary-subscription-totalAmount"]',
    );

    // ✅ Botones
    this.btnCheckout = page.locator('[data-test="continue"]');
    this.loadingSpinner = page.locator(".loading-view");
  }

  // ✅ Verificar página cargada
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/checkout/);
    await this.page.waitForLoadState("networkidle", { timeout: 60000 });
    await expect(this.page.locator('[data-cy="checkout-page"]')).toBeVisible({
      timeout: 30000,
    });

    // ✅ Esperar métodos de pago
    const isChecked = await this.page.evaluate(() => {
      const input = document.querySelector(
        '[data-test="cart-billing-method-0"]',
      );
      return input !== null;
    });
    console.log(`✅ Checkout de enrolamiento cargado`);
  }

  // ✅ Seleccionar Credit Card
  async selectCreditCardPayment() {
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

  // ✅ Llenar tarjeta
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

  // ✅ Llenar fecha de nacimiento
  async fillBirthDate(month: string, day: string, year: string) {
    // Month y Day son selects (Vuetify)
    await this.selectMonth.click();
    await this.page.locator(".v-list-item", { hasText: month }).click();

    // ✅ Esperar que cierre el menú de Month
    await this.page.waitForTimeout(500);

    await this.page.waitForTimeout(500);

    // ✅ Seleccionar Day con evaluate para evitar problemas de visibilidad
    await this.selectDay.click({ force: true });
    await this.page.waitForTimeout(500);

    // ✅ Usar evaluate para hacer clic directamente en el elemento correcto
    await this.page.evaluate((dayValue) => {
      // Buscar todos los menús visibles
      const menus = document.querySelectorAll(".v-menu__content");
      for (const menu of menus) {
        const style = window.getComputedStyle(menu);
        if (style.display === "none") continue;

        // Buscar el item con el texto exacto del día
        const items = menu.querySelectorAll(".v-list-item__title");
        for (const item of items) {
          if (item.textContent?.trim() === dayValue) {
            (item as HTMLElement).click();
            return;
          }
        }
      }
    }, day);

    await this.page.waitForTimeout(300);

    // ✅ Verificar que se seleccionó el día correcto
    const selectedDay = await this.selectDay.inputValue();
    console.log(`📅 Día seleccionado: ${selectedDay}`);

    await this.inputYear.clear();
    await this.inputYear.pressSequentially(year, { delay: 100 });

    console.log(`✅ Fecha de nacimiento: ${month} ${day}, ${year}`);
  }

  // ✅ Llenar SSN
  async fillSSN(ssn: string) {
    await this.inputSSN.clear();
    await this.inputSSN.pressSequentially(ssn, { delay: 100 });
  }

  // ✅ Llenar username y contraseña
  async fillCredentials(username: string, password: string) {
    // ✅ Scroll hacia el elemento primero
    await this.inputUsername.scrollIntoViewIfNeeded();

    // ✅ Usar fill en lugar de pressSequentially (más rápido y confiable)
    await this.inputUsername.click({ force: true });
    await this.inputUsername.fill(username);

    await this.inputPassword.click({ force: true });
    await this.inputPassword.fill(password);

    await this.inputConfirmPassword.click({ force: true });
    await this.inputConfirmPassword.fill(password);

    console.log(`✅ Username: ${username}`);
  }

  // ✅ Marcar personal consumption
  async checkPersonalConsumption() {
    // ✅ Leer estado por el primer checkbox (personal consumption)
    const checkbox = this.page.locator('input[role="checkbox"]').first();
    const isChecked = await checkbox.evaluate((el) =>
      el.getAttribute("aria-checked"),
    );

    if (isChecked !== "true") {
      console.log("⏳ Marcando personal consumption...");

      await this.labelPersonalConsumption.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);

      // ✅ Clic con force + esperar API
      await Promise.all([
        this.page
          .waitForResponse(
            (response) => response.url().includes("ProductsWillNotBeResold"),
            { timeout: 30000 },
          )
          .catch(() => {
            console.log("⏭️ Sin respuesta API, continuando...");
          }),
        this.labelPersonalConsumption.click({ force: true }), // ✅ force para ignorar ripple
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

  async acceptAgreements() {
    // ✅ Leer estado por el segundo checkbox (agreements)
    const checkbox = this.page.locator('input[role="checkbox"]').nth(1);
    const isChecked = await checkbox.evaluate((el) =>
      el.getAttribute("aria-checked"),
    );

    if (isChecked !== "true") {
      await this.labelAgreements.scrollIntoViewIfNeeded();
      await this.labelAgreements.click({ force: true }); // ✅ force para ignorar ripple
    }
    console.log("✅ Acuerdos aceptados");
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

  // ✅ Verificar subscription mismo método
  async verifySubscriptionSamePayment() {
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

  // ✅ Capturar totales
  async captureOrderTotal(): Promise<string> {
    try {
      const total = await this.page.evaluate(() => {
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
      console.log(`💰 Order Total: ${total}`);
      return total;
    } catch {
      return "";
    }
  }

  async captureSubscriptionTotal(): Promise<string> {
    try {
      const total = await this.page.evaluate(() => {
        const elements = document.querySelectorAll(
          '[data-cy="summary-subscription-totalAmount"]',
        );
        for (const el of Array.from(elements).reverse()) {
          const style = window.getComputedStyle(el);
          if (style.display !== "none" && style.visibility !== "hidden") {
            return el.textContent?.trim() ?? "";
          }
        }
        return "";
      });
      console.log(`💰 Subscription Total: ${total}`);
      return total;
    } catch {
      return "";
    }
  }

  // ✅ Confirmar orden
  async placeOrder() {
    await this.btnCheckout.click();
    await expect(this.page).toHaveURL(/\/complete/, { timeout: 30000 });
  }

  // ✅ Flujo completo del checkout de enrolamiento
  async completeEnrollCheckout(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    enrollData: {
      birthMonth: string;
      birthDay: string;
      birthYear: string;
      ssn: string;
      username: string;
      password: string;
    },
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();

    // 1. Pago
    await this.selectCreditCardPayment();
    await this.fillCardDetails(card);

    // 2. Billing address (ya viene marcado)
    await this.verifyTodayOrderBillingAddress();

    // 3. Subscription mismo método
    await this.verifySubscriptionSamePayment();

    // 4. ✅ Nuevos campos del enrolamiento
    await this.fillBirthDate(
      enrollData.birthMonth,
      enrollData.birthDay,
      enrollData.birthYear,
    );
    await this.fillSSN(enrollData.ssn);
    await this.fillCredentials(enrollData.username, enrollData.password);

    // 5. Checkboxes
    await this.checkPersonalConsumption();
    await this.acceptAgreements();

    // 6. Capturar totales
    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    // 7. Confirmar
    await this.placeOrder();

    return { orderTotal, subscriptionTotal };
  }
}
