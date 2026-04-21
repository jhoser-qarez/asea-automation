import { Page, Locator, expect } from "@playwright/test";

export class InfoPage {
  readonly page: Page;

  // 🎯 Basic Info
  readonly inputEmail: Locator;
  readonly inputFirstName: Locator;
  readonly inputLastName: Locator;
  readonly inputPhone: Locator;

  // 🎯 Shipping Address
  readonly inputAddress1: Locator;
  readonly inputAddress2: Locator;
  readonly inputCity: Locator;
  readonly inputState: Locator;
  readonly inputZip: Locator;

  // 🎯 Save Address
  readonly btnSaveAddress: Locator;
  readonly loadingSpinner: Locator;

  // 🎯 Shipping Method - Order
  readonly labelOrderStandard: Locator;
  readonly labelOrderUSPS: Locator;

  // 🎯 Shipping Method - Subscription
  readonly labelSubscriptionStandard: Locator;
  readonly labelSubscriptionUSPS: Locator;

  // 🎯 Totales
  readonly orderTotalAmount: Locator;
  readonly orderTotalShipping: Locator;
  readonly orderTotalTax: Locator;

  // 🎯 Botones
  readonly btnContinueToCheckout: Locator;
  readonly btnBackToShopping: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Basic Info
    this.inputEmail = page.locator('[data-test="email-field"]');
    this.inputFirstName = page.locator('[data-test="firstName-field"]');
    this.inputLastName = page.locator('[data-test="lastName-field"]');
    this.inputPhone = page.locator('[data-test="Phone-field"]');

    // ✅ Shipping Address
    this.inputAddress1 = page.locator('[data-test="AddressLine1-field"]');
    this.inputAddress2 = page.locator('[data-test="AddressLine2-field"]');
    this.inputCity = page.locator('[data-test="CountryCity-field"]');
    this.inputState = page.locator('[data-test="State-field"]');
    this.inputZip = page.locator('[data-test="Zip-field"]');

    // ✅ Save Address y loading
    this.btnSaveAddress = page
      .locator("div.row.justify-center button.primary")
      .first();
    this.loadingSpinner = page.locator(".loading-view");

    // ✅ Shipping Method Order - por data-cy + texto
    this.labelOrderStandard = page.locator(
      '[data-cy="order-shipping-selector"] label',
      { hasText: "Standard" },
    );
    this.labelOrderUSPS = page.locator(
      '[data-cy="order-shipping-selector"] label',
      { hasText: "USPS Direct" },
    );

    // ✅ Shipping Method Subscription
    this.labelSubscriptionStandard = page.locator(
      '[data-cy="subscription-shipping-selector"] label',
      { hasText: "Standard" },
    );
    this.labelSubscriptionUSPS = page.locator(
      '[data-cy="subscription-shipping-selector"] label',
      { hasText: "USPS Direct" },
    );

    // ✅ Totales
    this.orderTotalAmount = page.locator(
      '[data-cy="summary-order-totalAmount"]',
    );
    this.orderTotalShipping = page.locator(
      '[data-cy="summary-order-totalShipping"]',
    );
    this.orderTotalTax = page.locator('[data-cy="summary-order-totalTax"]');

    // ✅ Botones
    this.btnContinueToCheckout = page.locator('[data-test="continue"]');
    this.btnBackToShopping = page
      .getByRole("button", { name: "BACK TO SHOPPING" })
      .first();
  }

  // ✅ Verificar que estamos en /info
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/info/);
    await expect(this.inputEmail).toBeVisible();
  }

  // ✅ Llenar datos básicos (para usuarios nuevos sin datos precargados)
  async fillBasicInfo(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    await this.inputEmail.clear();
    await this.inputEmail.pressSequentially(data.email, { delay: 100 });

    await this.inputFirstName.clear();
    await this.inputFirstName.pressSequentially(data.firstName, { delay: 100 });

    await this.inputLastName.clear();
    await this.inputLastName.pressSequentially(data.lastName, { delay: 100 });

    if (data.phone) {
      await this.inputPhone.clear();
      await this.inputPhone.pressSequentially(data.phone, { delay: 100 });
    }

    console.log(`✅ Basic info llenada: ${data.email}`);
  }

  // ✅ Verificar datos básicos precargados (no llenar)
  async verifyBasicInfoPreloaded(data: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    await expect(this.inputEmail).toHaveValue(data.email);
    await expect(this.inputFirstName).toHaveValue(data.firstName);
    await expect(this.inputLastName).toHaveValue(data.lastName);
  }

  async fillPhoneIfNeeded(phone?: string) {
    if (phone) {
      await this.inputPhone.clear();
      await this.inputPhone.pressSequentially(phone, { delay: 100 });
      console.log(`✅ Phone llenado: ${phone}`);
    }
  }

  // ✅ Llenar dirección de envío
  async fillShippingAddress(data: {
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    zip: string;
  }) {
    await this.inputAddress1.clear();
    await this.inputAddress1.pressSequentially(data.address1, { delay: 100 });

    if (data.address2) {
      await this.inputAddress2.clear();
      await this.inputAddress2.pressSequentially(data.address2, { delay: 100 });
    }

    await this.inputCity.clear();
    await this.inputCity.pressSequentially(data.city, { delay: 100 });

    if (data.state) {
      await this.inputState.clear();
      await this.inputState.pressSequentially(data.state, { delay: 100 });
      await this.page.getByText(data.state, { exact: true }).first().click();
    }

    await this.inputZip.clear();
    await this.inputZip.pressSequentially(data.zip, { delay: 100 });
  }

  // ✅ Guardar dirección y esperar loading
  async saveAddress() {
    await this.btnSaveAddress.click();

    // Esperar que aparezca el spinner
    await expect(this.loadingSpinner)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Si el spinner es muy rápido y no lo alcanza a ver, está bien
      });

    // Esperar que el spinner desaparezca antes de continuar
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 15000 });
  }

  // ✅ Seleccionar shipping method para la orden
  async selectOrderShipping(method: "standard" | "usps" = "standard") {
    // Esperar que los shipping methods sean visibles después del loading
    await expect(this.labelOrderStandard).toBeVisible({ timeout: 10000 });

    if (method === "standard") {
      await this.labelOrderStandard.click();
    } else {
      await this.labelOrderUSPS.click();
    }
  }

  // ✅ Seleccionar shipping method para suscripción
  async selectSubscriptionShipping(method: "standard" | "usps" = "standard") {
    await expect(this.labelSubscriptionStandard).toBeVisible({
      timeout: 10000,
    });

    if (method === "standard") {
      await this.labelSubscriptionStandard.click();
    } else {
      await this.labelSubscriptionUSPS.click();
    }
  }

  // ✅ Continuar al checkout
  async continueToCheckout() {
    await this.btnContinueToCheckout.click();
    //await expect(this.page).toHaveURL(/\/checkout/);
  }

  // ✅ Flujo completo de la página info
  async completeInfoPage(
    address: {
      address1: string;
      address2?: string;
      city: string;
      state?: string;
      zip: string;
    },
    basicInfo: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
    },
    orderShipping: "standard" | "usps" = "standard",
    subscriptionShipping: "standard" | "usps" = "standard",
  ) {
    // 1. Verificar datos precargados
    await this.verifyBasicInfoPreloaded(basicInfo);
    await this.fillPhoneIfNeeded(basicInfo.phone);

    // 2. Llenar dirección
    await this.fillShippingAddress(address);

    // 3. Guardar y esperar loading
    await this.saveAddress();

    // 4. Seleccionar shipping methods
    //await this.selectOrderShipping(orderShipping);
    await this.selectSubscriptionShipping(subscriptionShipping);

    // 5. Continuar
    await this.continueToCheckout();
  }
}
