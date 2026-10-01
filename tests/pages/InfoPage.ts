import { Page, Locator, expect } from "@playwright/test";
import { MarketLabels, defaultLabels } from "../fixtures/marketLabels";

export class InfoPage {
  readonly page: Page;
  readonly labels: MarketLabels;

  // 🎯 Basic Info
  readonly inputEmail: Locator;
  readonly inputFirstName: Locator;
  readonly inputLastName: Locator;
  readonly inputPhone: Locator;

  // 🎯 Shipping Address
  readonly inputAddress1: Locator;
  readonly inputAddress2: Locator;
  readonly inputCity: Locator;
  readonly inputCityPlain: Locator;
  readonly inputStateCombo: Locator;
  readonly inputStatePlain: Locator;
  readonly inputZip: Locator;

  // 🎯 Campos exclusivos de Taiwan
  readonly inputGender: Locator; // combobox de solo clic, igual patrón que City
  readonly inputBankAccountName: Locator; // #FullNameBeneficiary ("戶名")
  readonly inputBankName: Locator; // #BankName ("銀行名稱")
  readonly inputBankCity: Locator; // #BankCity ("銀行所在城市")
  readonly inputBankCode: Locator; // #SortCode ("銀行代碼")
  readonly inputNationalId: Locator; // #TaxId ("身分證字號")

  // 🎯 Campos exclusivos de México
  readonly inputMunicipio: Locator; // #AddressLine3 ("Municipio *"), sin data-test
  readonly radioAccountTypeIndividual: Locator; // #Individual — viene marcado por defecto
  readonly radioAccountTypeBusiness: Locator; // #Business
  readonly inputCurp: Locator; // #SSN ("CURP *", 18 caracteres) — solo con Individuo
  readonly inputRfc: Locator; // #EIN ("RFC *", 13 caracteres) — Individuo y Negocio Registrado

  // 🎯 Consentimiento de comunicaciones
  readonly labelCompanyCommsYes: Locator; // label[for="CPF1_1"]
  readonly labelCompanyCommsNo: Locator; // label[for="CPF1_0"]
  readonly labelUplineCommsYes: Locator; // label[for="CPF2_1"]
  readonly labelUplineCommsNo: Locator; // label[for="CPF2_0"]

  // 🎯 Save Address
  readonly btnSaveAddress: Locator;
  readonly loadingSpinner: Locator;

  // 🎯 Shipping Method - Order
  readonly orderShippingMethodOptions: Locator;

  // 🎯 Shipping Method - Subscription
  readonly subscriptionShippingMethodOptions: Locator;

  // 🎯 Totales
  readonly orderTotalAmount: Locator;
  readonly orderTotalShipping: Locator;
  readonly orderTotalTax: Locator;

  // 🎯 Botones
  readonly btnContinueToCheckout: Locator;
  readonly btnBackToShopping: Locator;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    this.page = page;
    this.labels = labels;

    // ✅ Basic Info
    this.inputEmail = page.locator('[data-test="checkout-email-input"] input');
    this.inputFirstName = page.locator(
      '[data-test="checkout-first-name-input"] input',
    );
    this.inputLastName = page.locator(
      '[data-test="checkout-last-name-input"] input',
    );
    this.inputPhone = page.locator('[data-test="checkout-phone-input"] input');

    // ✅ Shipping Address
    this.inputAddress1 = page.locator(
      '[data-test="checkout-address-line1-input"] input',
    );
    this.inputAddress2 = page.locator(
      '[data-test="checkout-address-line2-input"] input',
    );
    this.inputCity = page.locator('[data-test="checkout-city-input"] input');
    this.inputCityPlain = page.locator('input[name="CountryCity"]');
    this.inputStateCombo = page.locator(
      '[data-test="checkout-state-select"] input',
    );
    this.inputStatePlain = page.locator("#State");
    this.inputZip = page.locator('[data-test="checkout-zip-input"] input');

    // ✅ Campos exclusivos de Taiwan (ver comentario junto a las
    // declaraciones arriba).
    this.inputGender = page.locator('input[name="Gender"]');
    this.inputBankAccountName = page.locator("#FullNameBeneficiary");
    this.inputBankName = page.locator("#BankName");
    this.inputBankCity = page.locator("#BankCity");
    this.inputBankCode = page.locator("#SortCode");
    this.inputNationalId = page.locator("#TaxId");

    // ✅ Campos exclusivos de México (ver comentario junto a las
    // declaraciones arriba).
    this.inputMunicipio = page.locator("#AddressLine3");
    this.radioAccountTypeIndividual = page.locator("#Individual");
    this.radioAccountTypeBusiness = page.locator("#Business");
    this.inputCurp = page.locator("#SSN");
    this.inputRfc = page.locator("#EIN");

    this.labelCompanyCommsYes = page.locator('label[for="CPF1_1"]').last();
    this.labelCompanyCommsNo = page.locator('label[for="CPF1_0"]').last();
    this.labelUplineCommsYes = page.locator('label[for="CPF2_1"]').last();
    this.labelUplineCommsNo = page.locator('label[for="CPF2_0"]').last();

    // ✅ Save Address y loading
    this.btnSaveAddress = page
      .locator('[data-test="checkout-save-address-button"]')
      .first();
    this.loadingSpinner = page.locator(".loading-view");

    this.orderShippingMethodOptions = page.locator(
      '[data-test="checkout-shipping-methods-group"] [data-test="checkout-subscriptions-shipping-method-label"]',
    );

    // ✅ Shipping Method Subscription
    this.subscriptionShippingMethodOptions = page.locator(
      '[data-test="checkout-subscriptions-shipping-methods-group"] [data-test="checkout-subscriptions-shipping-method-label"]',
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
    this.btnContinueToCheckout = page.locator(
      '[data-test="checkout-continue-to-checkout-button"]',
    );
    this.btnBackToShopping = page
      .getByRole("button", { name: labels.backToShopping })
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
    const actualEmail = await this.inputEmail.inputValue();
    const actualFirstName = await this.inputFirstName.inputValue();
    const actualLastName = await this.inputLastName.inputValue();

    expect(actualEmail.trim()).toBeTruthy();
    expect(actualFirstName.trim()).toBeTruthy();
    expect(actualLastName.trim()).toBeTruthy();

    if (actualEmail !== data.email) {
      console.log(
        `ℹ️ Email precargado ("${actualEmail}") difiere del esperado ("${data.email}") — perfil real de la cuenta, no bloqueante`,
      );
    }
  }

  async fillPhoneIfNeeded(phone?: string) {
    if (!phone) return;

    const fieldPresent = await this.inputPhone
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (!fieldPresent) {
      console.log("⏭️ Sin campo de teléfono en este mercado");
      return;
    }

    const currentValue = await this.inputPhone.inputValue().catch(() => "");
    if (currentValue.trim()) {
      console.log(
        `⏭️ Ya hay un teléfono precargado ("${currentValue}") — no se sobreescribe`,
      );
      return;
    }

    await this.inputPhone.clear();
    await this.inputPhone.pressSequentially(phone, { delay: 100 });
    console.log(`✅ Phone llenado: ${phone}`);
  }

  // ✅ Consentimiento de comunicaciones
  async selectCommunicationPreferences(consent: "yes" | "no" = "no") {
    const companyLabel =
      consent === "yes" ? this.labelCompanyCommsYes : this.labelCompanyCommsNo;
    const uplineLabel =
      consent === "yes" ? this.labelUplineCommsYes : this.labelUplineCommsNo;

    const visible = await companyLabel
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!visible) {
      console.log(
        "⏭️ Sin bloque de consentimiento de comunicaciones en este mercado",
      );
      return;
    }

    await companyLabel.click();
    await uplineLabel.click();
    console.log(`✅ Preferencias de comunicación: ${consent}`);
  }

  // ✅ Llenar dirección de envío
  async fillShippingAddress(data: {
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    zip?: string;
    gender?: "male" | "female";
    bankAccountName?: string;
    bankName?: string;
    bankCity?: string;
    bankCode?: string;
    nationalId?: string;
    colonia?: string;
    municipio?: string;
  }) {
    await this.selectCommunicationPreferences();

    // Exclusivos de Taiwan
    const fieldExists = (locator: Locator) =>
      locator
        .waitFor({ state: "visible", timeout: 3000 })
        .then(() => true)
        .catch(() => false);

    if (data.gender && (await fieldExists(this.inputGender))) {
      await this.inputGender.click();
      const genderText = data.gender === "male" ? "男性" : "女性";
      const genderOption = this.page.getByText(genderText, { exact: true });
      await expect(genderOption.first()).toBeVisible({ timeout: 5000 });
      await genderOption.first().click();
    }
    if (
      data.bankAccountName &&
      (await fieldExists(this.inputBankAccountName))
    ) {
      await this.inputBankAccountName.clear();
      await this.inputBankAccountName.pressSequentially(data.bankAccountName, {
        delay: 100,
      });
    }
    if (data.bankName && (await fieldExists(this.inputBankName))) {
      await this.inputBankName.clear();
      await this.inputBankName.pressSequentially(data.bankName, {
        delay: 100,
      });
    }
    if (data.bankCity && (await fieldExists(this.inputBankCity))) {
      await this.inputBankCity.clear();
      await this.inputBankCity.pressSequentially(data.bankCity, {
        delay: 100,
      });
    }
    if (data.bankCode && (await fieldExists(this.inputBankCode))) {
      await this.inputBankCode.clear();
      await this.inputBankCode.pressSequentially(data.bankCode, {
        delay: 100,
      });
    }
    if (data.nationalId && (await fieldExists(this.inputNationalId))) {
      await this.inputNationalId.clear();
      await this.inputNationalId.pressSequentially(data.nationalId, {
        delay: 100,
      });
    }

    await this.inputAddress1.clear();
    await this.inputAddress1.pressSequentially(data.address1, { delay: 100 });

    if (data.address2) {
      await this.inputAddress2.clear();
      await this.inputAddress2.pressSequentially(data.address2, { delay: 100 });
    }

    // ⚠️ México: "colonia"
    if (data.colonia) {
      await this.inputAddress2.clear();
      await this.inputAddress2.pressSequentially(data.colonia, { delay: 100 });
    }

    // ⚠️ México: "Municipio *"
    if (data.municipio && (await fieldExists(this.inputMunicipio))) {
      await this.inputMunicipio.clear();
      await this.inputMunicipio.pressSequentially(data.municipio, {
        delay: 100,
      });
    }

    const cityNormalVisible = await this.inputCity
      .waitFor({ state: "visible", timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    const cityInput = cityNormalVisible ? this.inputCity : this.inputCityPlain;

    if (cityNormalVisible) {
      await cityInput.clear();
      await cityInput.pressSequentially(data.city, { delay: 100 });
    } else {
      await cityInput.click();
      const cityOption = this.page.getByText(data.city, { exact: false });
      await expect(cityOption.first()).toBeVisible({ timeout: 5000 });
      await cityOption.first().click();
    }

    if (data.state) {
      const comboVisible = await this.inputStateCombo
        .waitFor({ state: "visible", timeout: 3000 })
        .then(() => true)
        .catch(() => false);

      const stateInput = comboVisible
        ? this.inputStateCombo
        : this.inputStatePlain;

      await stateInput.clear();
      await stateInput.pressSequentially(data.state, { delay: 100 });

      await this.page
        .getByText(data.state, { exact: true })
        .first()
        .click({ timeout: 3000 })
        .catch(() => {});
    }

    // ⚠️ Algunos mercados no tienen campo de código postal
    if (data.zip) {
      await this.inputZip.clear();
      await this.inputZip.pressSequentially(data.zip, { delay: 100 });
    }
  }

  // ⚠️ Exclusivo de México
  async fillAccountType(
    accountType: "Individual" | "Business",
    ids: { curp?: string; rfc?: string },
  ) {
    const fieldExists = (locator: Locator) =>
      locator
        .waitFor({ state: "attached", timeout: 3000 })
        .then(() => true)
        .catch(() => false);

    if (!(await fieldExists(this.radioAccountTypeIndividual))) {
      console.log(
        "⏭️ Sin bloque de 'Tipo de Cuenta' en este mercado (no aplica)",
      );
      return;
    }

    if (accountType === "Business") {
      const isChecked = await this.radioAccountTypeBusiness
        .isChecked()
        .catch(() => false);
      if (!isChecked) {
        await this.page.locator('label[for="Business"]').first().click();
      }
    }
    // "Individual"

    if (accountType === "Individual" && ids.curp) {
      await this.inputCurp.clear();
      await this.inputCurp.pressSequentially(ids.curp, { delay: 100 });
    }
    if (ids.rfc) {
      await this.inputRfc.clear();
      await this.inputRfc.pressSequentially(ids.rfc, { delay: 100 });
    }
    console.log(`✅ Tipo de cuenta: ${accountType}`);
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
  async selectOrderShipping(method: string | number = 1) {
    const option =
      typeof method === "number"
        ? this.orderShippingMethodOptions.nth(method - 1)
        : this.orderShippingMethodOptions.filter({ hasText: method });

    await expect(option).toBeVisible({ timeout: 20000 });
    await option.click();
  }

  // ✅ Seleccionar shipping method para suscripción
  async selectSubscriptionShipping(method: string | number = 1) {
    const option =
      typeof method === "number"
        ? this.subscriptionShippingMethodOptions.nth(method - 1)
        : this.subscriptionShippingMethodOptions.filter({ hasText: method });

    await expect(option).toBeVisible({ timeout: 20000 });
    await option.click();
  }

  // ✅ Continuar al checkout
  async continueToCheckout() {
    await this.btnContinueToCheckout.click({ timeout: 120000 });
    //await expect(this.page).toHaveURL(/\/checkout/);
  }

  // ✅ Flujo completo de la página info
  async completeInfoPage(
    address: {
      address1: string;
      address2?: string;
      city: string;
      state?: string;
      zip?: string;
    },
    basicInfo: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
    },
    orderShipping: string | number = 1,
    subscriptionShipping: string | number = 1,
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

  // Flujo de info para Will Call:
  async completeInfoPageWillCall(basicInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    // 1. Verificar datos precargados
    await this.verifyBasicInfoPreloaded(basicInfo);
    await this.fillPhoneIfNeeded(basicInfo.phone);

    // 2. Continuar directamente
    await this.continueToCheckout();
    console.log(" Info page Will Call completada");
  }
}
