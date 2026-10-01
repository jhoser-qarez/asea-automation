import { Page, Locator, Frame, expect } from "@playwright/test";
import { CheckoutPage } from "../CheckoutPage";
import {
  MarketLabels,
  defaultLabels,
  translateEnrollBirthMonth,
} from "../../fixtures/marketLabels";
import { PaymentProvider } from "../../fixtures/paymentCases";
import { users } from "../../fixtures/credentials";

// ✅ Datos del formulario embebido de Atome (Adyen "open invoice") —

export interface OpenInvoiceDetails {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  postalCode: string;
}

// ✅ EnrollCheckoutPage extiende CheckoutPage
export class EnrollCheckoutPage extends CheckoutPage {
  readonly radioBoxSameAsCart: Locator;
  readonly labelBoxSameAsCart: Locator;

  // 🎯 Birth Date
  readonly selectMonth: Locator;
  readonly selectDay: Locator;
  readonly inputYear: Locator;

  // 🎯 SSN
  readonly inputSSN: Locator;

  // 🎯 Username & Password
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly inputConfirmPassword: Locator;

  // 🎯 Referral Section - opciones por value (estable)
  readonly radioSearchByName: Locator;
  readonly radioSearchById: Locator;
  readonly radioNoReferral: Locator;
  readonly radioReferralResult: Locator;

  // 🎯 Referral - contenedor Search by Name
  readonly referralNameContainer: Locator;
  readonly inputReferralFirstName: Locator;
  readonly inputReferralLastName: Locator;

  // 🎯 Referral - contenedor Search by ID
  readonly referralIdContainer: Locator;
  readonly inputReferralSponsorId: Locator;

  // 🎯 Agreements — concepto propio de Enroll, CheckoutPage (US estándar)
  // no tiene esto en absoluto.
  readonly labelAgreements: Locator;
  readonly checkboxAgreements: Locator;

  protected usingAdyenIframe = false;

  protected usingPayPal = false;

  protected usingGPay = false;

  protected usingAdyenRedirectMethod: PaymentProvider | null = null;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    super(page, labels);

    // ✅ Subscription mismo método
    this.radioBoxSameAsCart = page.locator(
      'input[type="radio"][value="Same as Your Cart Billing Method"]',
    );
    this.labelBoxSameAsCart = page.locator('label[for="-1"]', {
      hasText: labels.sameAsCartBillingMethod,
    });

    // ✅ Birth Date
    this.selectMonth = page.locator('input[name="dateMonth"]');
    this.selectDay = page.locator('input[name="dateDay"]');
    this.inputYear = page.locator('input[name="dateYear"]');

    // ✅ SSN
    this.inputSSN = page.locator('[data-test="GovermentId-field"]');

    // ✅ Username & Password
    this.inputUsername = page.locator("#SiteId");
    this.inputPassword = page.locator("#password");
    this.inputConfirmPassword = page.locator("#confirmPassword");

    // ✅ Referral - radios por value (estable, no depende de id dinámico)
    this.radioSearchByName = page.locator('input[role="radio"][value="1"]');
    this.radioSearchById = page.locator('input[role="radio"][value="2"]');
    this.radioNoReferral = page.locator('input[role="radio"][value="4"]');
    this.radioReferralResult = page.locator('input[role="radio"][value="5"]');

    // ✅ Referral Search by Name - contenedor del radio value="1"
    // Los inputs de nombre/apellido están dentro del mismo bloque .color-row
    this.referralNameContainer = page
      .locator(".options-search-sponsor .color-row")
      .filter({ has: page.locator('input[role="radio"][value="1"]') });
    this.inputReferralFirstName = this.referralNameContainer
      .locator('input[type="text"]')
      .first();
    this.inputReferralLastName = this.referralNameContainer
      .locator('input[type="text"]')
      .last();

    // ✅ Referral Search by ID - contenedor del radio value="2"
    this.referralIdContainer = page
      .locator(".options-search-sponsor .color-row")
      .filter({ has: page.locator('input[role="radio"][value="2"]') });
    this.inputReferralSponsorId =
      this.referralIdContainer.locator('input[type="text"]');

    // El input real está oculto (class="hidden"); el elemento clickeable
    // visible es su <label for="chkAgreePolicyAndTerms"> hermano.
    this.checkboxAgreements = page.locator("#chkAgreePolicyAndTerms");
    this.labelAgreements = page.locator('label[for="chkAgreePolicyAndTerms"]');
  }

  // ✅ Selección de método de pago.

  override async selectCreditCardPayment(
    provider?: PaymentProvider,
    openInvoiceDetails?: OpenInvoiceDetails,
  ) {
    if (!provider) {
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
      await super.selectCreditCardPayment();
      console.log(
        "✅ Proveedor por defecto seleccionado (formulario de tarjeta plano)",
      );
      return;
    }

    if (provider === "Adyen") {
      const isChecked = await this.radioAdyenProvider
        .isChecked()
        .catch(() => false);
      if (!isChecked) {
        await this.page.locator('label[for="Adyen"]').first().click();
      }
      await expect(
        this.cardNumberFrame().locator(
          'input[data-fieldtype="encryptedCardNumber"]',
        ),
      ).toBeVisible({ timeout: 30000 });
      this.usingAdyenIframe = true;
      console.log("✅ Adyen seleccionado");
      return;
    }

    if (
      provider === "eBanking" ||
      provider === "atome" ||
      provider === "boost" ||
      provider === "oxxo"
    ) {
      const isAdyenChecked = await this.radioAdyenProvider
        .isChecked()
        .catch(() => false);
      if (!isAdyenChecked) {
        await this.page.locator('label[for="Adyen"]').first().click();
      }

      const methodClass = {
        eBanking: "molpay_ebanking_fpx_MY",
        atome: "atome",
        boost: "molpay_boost",
        oxxo: "oxxo",
      }[provider];
      const methodContainer = this.page.locator(
        `.adyen-checkout__payment-method--${methodClass}`,
      );
      await methodContainer.locator("button").first().click();

      // ✅ E-Banking (FPX) NO redirige ni abre popup en este paso
      if (provider === "eBanking") {
        await methodContainer.locator('input[role="combobox"]').click();
        await methodContainer.locator('li[role="option"]').first().click();
        console.log("✅ Banco seleccionado (Maybank2u)");
      }

      // ⚠️ Atome (Adyen "open invoice")
      if (provider === "atome" && openInvoiceDetails) {
        const firstNameInput = methodContainer.locator(
          'input[name="firstName"]',
        );
        const hasOpenInvoiceForm = await firstNameInput
          .waitFor({ state: "visible", timeout: 5000 })
          .then(() => true)
          .catch(() => false);

        if (hasOpenInvoiceForm) {
          await firstNameInput.fill(openInvoiceDetails.firstName);
          await methodContainer
            .locator('input[name="lastName"]')
            .fill(openInvoiceDetails.lastName);
          await methodContainer
            .locator('input[name="telephoneNumber"]')
            .fill(openInvoiceDetails.phone);
          await methodContainer
            .locator('input[name="street"]')
            .fill(openInvoiceDetails.street);
          await methodContainer
            .locator('input[name="postalCode"]')
            .fill(openInvoiceDetails.postalCode);
          console.log(
            "✅ Formulario de Atome (Personal details/Billing) llenado",
          );
        } else {
          console.log(
            "ℹ️ Atome sin formulario embebido en este checkout — se sigue directo",
          );
        }
      }

      this.usingAdyenIframe = false;
      this.usingAdyenRedirectMethod = provider;
      console.log(`✅ Proveedor "${provider}" seleccionado (dentro de Adyen)`);
      return;
    }

    // Proveedor explícito no-Adyen (Braintree/WorldPay/CyberSource/PayPal/
    // GPay).
    this.usingAdyenIframe = false;
    this.usingPayPal = provider === "BraintreeWithPayPal";
    this.usingGPay = provider === "BraintreeWithGPay";

    const radio = this.page.locator(`input[type="radio"][value="${provider}"]`);
    const isChecked = await radio.isChecked().catch(() => false);
    if (!isChecked) {
      await this.page.locator(`label[for="${provider}"]`).first().click();
    }

    if (this.usingPayPal || this.usingGPay) {
      // PayPal/GPay no tienen formulario de tarjeta — la auth va en el
      // popup/redirect al confirmar la orden.
      console.log(
        `✅ Proveedor "${provider}" seleccionado (sin formulario de tarjeta)`,
      );
      return;
    }

    await expect(this.inputCardName).toBeVisible({ timeout: 15000 });
    console.log(`✅ Proveedor "${provider}" seleccionado`);
  }

  // ✅ Rama Adyen
  override async fillCardDetails(card: {
    name: string;
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }) {
    if (this.usingPayPal || this.usingGPay || this.usingAdyenRedirectMethod) {
      return;
    }
    if (!this.usingAdyenIframe) {
      await super.fillCardDetails(card);
      return;
    }

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

  // ✅ Challenge 3DS (tarjetas con `needs3ds`).
  async handle3dsChallenge(): Promise<boolean> {
    const inputSel = '#password-input, input[name="answer"]';
    const deadline = Date.now() + 90000;
    let target: Frame | undefined;
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
      if (!target) await this.page.waitForTimeout(1000);
    }
    if (!target) {
      if (/\/complete/.test(this.page.url())) return false;
      throw new Error(
        "No se encontró el input del challenge 3DS en ningún iframe (y no navegó a /complete)",
      );
    }
    console.log(`🔐 Challenge 3DS (iframe): ${target.url()}`);

    await target.locator(inputSel).first().fill("password");
    await target
      .locator('#buttonSubmit, button[type="submit"]')
      .first()
      .click();
    console.log('✅ 3DS challenge: "password" + Continue');
    return true;
  }

  private paymentModal(): Locator {
    return this.page
      .locator('[role="dialog"]')
      .filter({ hasText: "Cart" })
      .first();
  }

  private paypalSectionContainer(
    sectionLabel: "Cart" | "Subscription Box",
  ): Locator {
    return this.paymentModal()
      .getByText(sectionLabel, { exact: true })
      .locator('xpath=ancestor::*[.//*[contains(@class,"paypal-buttons")]][1]');
  }

  // ✅ Flujo PayPal (BraintreeWithPayPal).
  async payWithPayPal() {
    await this.approvePayPalPopup(this.paypalSectionContainer("Cart"), "cart");

    const hasSubscriptionBox = await this.paymentModal()
      .getByText("Subscription Box", { exact: true })
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (hasSubscriptionBox) {
      await this.approvePayPalPopup(
        this.paypalSectionContainer("Subscription Box"),
        "subscription",
      );
    } else {
      console.log(
        "ℹ️ PayPal: sin sección de suscripción en este flujo (Retail Customer)",
      );
    }
  }

  // ✅ Login sandbox
  private async locatePayPalButton(container: Locator) {
    await container.waitFor({ state: "visible", timeout: 30000 });

    const buttonFrame = container.frameLocator(
      'iframe[title*="PayPal"]:not(.invisible)',
    );
    const payPalBtn = buttonFrame
      .locator(
        '.paypal-button[data-funding-source="paypal"], .paypal-button, [role="button"]',
      )
      .first();
    await payPalBtn.waitFor({ state: "visible", timeout: 15000 });
    return payPalBtn;
  }

  // ⚠️ Modo live
  private async verifyPayPalPopupOpensOnly(container: Locator, slug: string) {
    const payPalBtn = await this.locatePayPalButton(container);

    const [popup] = await Promise.all([
      this.page.waitForEvent("popup", { timeout: 30000 }).catch(() => null),
      payPalBtn.click(),
    ]);

    if (!popup) {
      await this.page
        .screenshot({
          path: `test-results/_debug-paypal-${slug}-live-nopopup.png`,
        })
        .catch(() => {});
      throw new Error(
        `PayPal (${slug}) [modo live]: no se abrió ninguna ventana de pago`,
      );
    }
    console.log(
      `✅ Modo live: PayPal (${slug}) - ventana de pago abierta correctamente (${popup.url()})`,
    );
    await popup.close().catch(() => {});
  }

  async verifyPayPalOpensInLiveMode() {
    await this.verifyPayPalPopupOpensOnly(
      this.paypalSectionContainer("Cart"),
      "cart",
    );

    const hasSubscriptionBox = await this.paymentModal()
      .getByText("Subscription Box", { exact: true })
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (hasSubscriptionBox) {
      await this.verifyPayPalPopupOpensOnly(
        this.paypalSectionContainer("Subscription Box"),
        "subscription",
      );
    } else {
      console.log("ℹ️ PayPal (live): sin sección de suscripción en este flujo");
    }
  }

  private async approvePayPalPopup(container: Locator, slug: string) {
    let popup: Page | null = null;
    for (let attempt = 1; attempt <= 2 && !popup; attempt++) {
      const payPalBtn = await this.locatePayPalButton(container);
      [popup] = await Promise.all([
        this.page.waitForEvent("popup", { timeout: 15000 }).catch(() => null),
        payPalBtn.click(),
      ]);
      if (!popup && attempt === 1) {
        console.log(
          `⚠️ PayPal (${slug}): sin popup en el primer clic (posible swap de iframe), reintentando...`,
        );
      }
    }

    if (!popup) {
      const alreadyApproved = await container
        .getByText(/successful payment/i)
        .waitFor({ state: "visible", timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (alreadyApproved) {
        console.log(
          `✅ PayPal (${slug}): aprobado automáticamente (sin popup)`,
        );
        return;
      }
      throw new Error(
        `PayPal (${slug}): no se abrió popup y no se detectó aprobación automática ("Successful payment")`,
      );
    }
    console.log(`🅿️ PayPal (${slug}) popup: ${popup.url()}`);

    const emailInput = popup.locator("#email");
    const needsLogin = await emailInput
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (needsLogin) {
      await popup
        .screenshot({ path: `test-results/_debug-paypal-${slug}-email.png` })
        .catch(() => {});
      await emailInput.fill(users.paypalSandbox.email);

      await popup
        .locator(
          'button[data-atomic-wait-task="login_enter_email"], button:has-text("Next")',
        )
        .first()
        .click();

      const passwordInput = popup.locator(
        '#password:not([aria-hidden="true"])',
      );
      await passwordInput.waitFor({ state: "visible", timeout: 15000 });
      await passwordInput.fill(users.paypalSandbox.password);
      await popup
        .screenshot({
          path: `test-results/_debug-paypal-${slug}-password.png`,
        })
        .catch(() => {});

      await popup
        .locator(
          'button[data-atomic-wait-task="login_enter_password"], button:has-text("Log In"), button:has-text("Login")',
        )
        .first()
        .click();
    } else {
      console.log(
        `🅿️ PayPal (${slug}): sesión ya logueada, sin pedir credenciales`,
      );
    }

    // Pantalla de revisión de la orden — confirmar/aprobar el pago.
    const approveBtn = popup.locator(
      "#payment-submit-btn, button:has-text('Continue'), button:has-text('Pay Now')",
    );
    await approveBtn.first().waitFor({ state: "visible", timeout: 30000 });
    await popup
      .screenshot({ path: `test-results/_debug-paypal-${slug}-review.png` })
      .catch(() => {});
    await approveBtn.first().click();

    // Tras aprobar, el popup se cierra solo.
    await popup.waitForEvent("close", { timeout: 30000 }).catch(() => {});
    console.log(`✅ PayPal (${slug}): aprobado`);
  }

  // ⚠️ GPay
  private async approveGPayPopup(
    containerSelector: string,
    slug: string,
    liveMode = false,
  ) {
    const gpayBtn = this.page
      .locator(
        `${containerSelector} button#gpay-button-online-api-id, ${containerSelector} button[aria-label="Buy with GPay"]`,
      )
      .first();
    await gpayBtn.waitFor({ state: "visible", timeout: 15000 });

    const [popup] = await Promise.all([
      this.page.waitForEvent("popup", { timeout: 30000 }).catch(() => null),
      gpayBtn.click(),
    ]);

    if (!popup) {
      await this.page
        .screenshot({ path: `test-results/_debug-gpay-${slug}-nopopup.png` })
        .catch(() => {});
      throw new Error(
        `GPay (${slug}): no se abrió ningún popup ni con más tiempo de espera — probablemente la Payment Request API nativa del navegador, fuera del alcance de Playwright. Ver test-results/_debug-gpay-${slug}-nopopup.png`,
      );
    }

    console.log(`🅶 GPay (${slug}) popup: ${popup.url()}`);

    if (liveMode) {
      console.log(
        `✅ Modo live: GPay (${slug}) - ventana de pago abierta correctamente, sin continuar con login/aprobación`,
      );
      await popup.close().catch(() => {});
      return;
    }

    await popup
      .waitForLoadState("domcontentloaded", { timeout: 20000 })
      .catch(() => {});

    const emailInput = popup.locator(
      'input[type="email"]#identifierId, input[type="email"]',
    );
    const needsLogin = await emailInput
      .waitFor({ state: "visible", timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (needsLogin) {
      await popup
        .screenshot({ path: `test-results/_debug-gpay-${slug}-email.png` })
        .catch(() => {});
      await emailInput.fill(users.gpaySandbox.email);
      await popup
        .locator(
          '#identifierNext button, #identifierNext, button:has-text("Next")',
        )
        .first()
        .click();

      const passwordInput = popup.locator(
        'input[type="password"][name="Passwd"], input[type="password"]',
      );
      await passwordInput.waitFor({ state: "visible", timeout: 15000 });
      await passwordInput.fill(users.gpaySandbox.password);
      await popup
        .screenshot({ path: `test-results/_debug-gpay-${slug}-password.png` })
        .catch(() => {});
      await popup
        .locator('#passwordNext button, #passwordNext, button:has-text("Next")')
        .first()
        .click();
    } else {
      console.log(
        `🅶 GPay (${slug}): sesión ya logueada, sin pedir credenciales`,
      );
    }

    const approveBtn = popup.locator(
      'button:has-text("Continue"), button:has-text("Pay"), button:has-text("Confirm")',
    );
    await approveBtn.first().waitFor({ state: "visible", timeout: 30000 });
    await popup
      .screenshot({ path: `test-results/_debug-gpay-${slug}-review.png` })
      .catch(() => {});
    await approveBtn.first().click();

    await popup.waitForEvent("close", { timeout: 30000 }).catch(() => {});
    console.log(`✅ GPay (${slug}): aprobado`);
  }

  // ✅ Verificar página cargada
  override async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/checkout/, { timeout: 30000 });
    await this.page.waitForLoadState("networkidle", { timeout: 60000 });
    await expect(
      this.page.locator('[data-test="checkout-payment-method"]'),
    ).toBeVisible({
      timeout: 30000,
    });
    console.log(`✅ Checkout de enrolamiento cargado`);
  }

  async fillBirthDate(month: string, day: string, year: string) {
    const translatedMonth = translateEnrollBirthMonth(month, this.labels);
    await this.selectAutocompleteOption(this.selectMonth, translatedMonth);
    await this.selectAutocompleteOption(this.selectDay, day);

    await this.inputYear.clear();
    await this.inputYear.pressSequentially(year, { delay: 100 });

    console.log(`✅ Fecha de nacimiento: ${month} ${day}, ${year}`);
  }

  private async selectAutocompleteOption(input: Locator, optionText: string) {
    await input.click();
    const option = input
      .locator("xpath=..")
      .getByText(optionText, { exact: true });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
  }

  //Llenar SSN
  async fillSSN(ssn: string) {
    await this.inputSSN.clear();
    await this.inputSSN.pressSequentially(ssn, { delay: 100 });
  }

  // ✅ Seleccionar referido por nombre
  async selectReferralByName(firstName: string, lastName: string) {
    await this.page
      .locator("label", { hasText: this.labels.searchByName })
      .click();
    console.log("✅ 'Search by Name' seleccionado");

    await expect(this.inputReferralFirstName).toBeVisible({ timeout: 5000 });
    await this.inputReferralFirstName.fill(firstName);
    await this.inputReferralLastName.fill(lastName);
    console.log(`🔍 Buscando: ${firstName} ${lastName}`);

    await this._selectReferralResult();
  }

  // ✅ Seleccionar referido por Sponsor ID
  async selectReferralById(sponsorId: string) {
    await this.page
      .locator("label", { hasText: this.labels.searchBySponsorId })
      .click();
    console.log("✅ 'Search by Sponsor ID' seleccionado");

    await expect(this.inputReferralSponsorId).toBeVisible({ timeout: 5000 });
    await this.inputReferralSponsorId.fill(sponsorId);
    console.log(`🔍 Buscando por ID: ${sponsorId}`);

    await this._selectReferralResult();
  }

  // ✅ No hay referido

  async selectNoReferral() {
    const noReferralLabel = this.page.locator("label", {
      hasText: this.labels.noOneReferredMe,
    });
    const sponsorError = this.page.getByText("SPONSOR_NOT_FOUND");

    await noReferralLabel.click();
    await this.page
      .waitForLoadState("networkidle", { timeout: 10000 })
      .catch(() => {});

    for (let attempt = 1; attempt <= 3; attempt++) {
      const stillFailing = await sponsorError.isVisible().catch(() => false);
      if (!stillFailing) break;
      console.log(
        `⚠️ SPONSOR_NOT_FOUND visible tras seleccionar 'No one referred me', reintentando (${attempt}/3)...`,
      );
      await noReferralLabel.click();
      await this.page
        .waitForLoadState("networkidle", { timeout: 10000 })
        .catch(() => {});
      await this.page.waitForTimeout(1000);
    }

    console.log("✅ 'No one referred me' seleccionado");
  }

  // ✅ Esperar resultado y seleccionarlo (4to radio value="5")
  private async _selectReferralResult() {
    await expect(this.radioReferralResult).toBeVisible({ timeout: 15000 });

    // Hacer clic en el label que contiene el resultado
    const resultLabel = this.page
      .locator(".options-search-sponsor .color-row")
      .filter({ has: this.radioReferralResult })
      .locator("label")
      .last();

    await resultLabel.click();

    await expect(this.radioReferralResult).toHaveAttribute(
      "aria-checked",
      "true",
      { timeout: 5000 },
    );

    const resultText = await this.page
      .locator(".options-search-sponsor .v-list-item__title")
      .textContent();
    console.log(`✅ Referido seleccionado: ${resultText?.trim()}`);
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

  async acceptAgreements() {
    // ✅ Checkbox nativo: leer estado con isChecked(), no aria-checked
    const isChecked = await this.checkboxAgreements.isChecked();

    if (!isChecked) {
      await this.labelAgreements.scrollIntoViewIfNeeded();
      await this.labelAgreements.click();
    }
    console.log("✅ Acuerdos aceptados");
  }

  // ✅ Verificar subscription mismo método
  override async verifySubscriptionSamePayment() {
    const isChecked = await this.radioBoxSameAsCart.isChecked();
    if (!isChecked) {
      await this.labelBoxSameAsCart.click();
    }
    console.log("✅ Subscription mismo método de pago que Cart");
  }

  async selectSubscriptionAlternatePayment() {
    const deferredInput = this.page.locator('input[value="DeferredPayment"]');
    const deferredId = await deferredInput.getAttribute("id");
    await this.page.locator(`label[for="${deferredId}"]`).first().click();
    await expect(deferredInput).toBeChecked({ timeout: 5000 });
    console.log(
      "✅ Suscripción: método de pago alternativo seleccionado (Deferred Payment, por usar Oxxo en el Cart)",
    );
  }

  // ✅ Confirmar orden
  override async placeOrder(needs3ds = false, liveMode = false) {
    await this.btnCheckout.scrollIntoViewIfNeeded();
    await expect(this.btnCheckout).toBeVisible({ timeout: 10000 });
    await expect(this.btnCheckout).toBeEnabled({ timeout: 10000 });

    await this.page
      .waitForLoadState("networkidle", { timeout: 15000 })
      .catch(() => {});

    if (this.usingPayPal) {
      await this.btnCheckout.click();
      if (liveMode) {
        await this.verifyPayPalOpensInLiveMode();
        console.log(
          "✅ Modo live: PayPal solo verificado hasta apertura de ventana, sin completar el pago real (sin cuentas reales en live)",
        );
        return;
      }
      await this.payWithPayPal();

      const relaunchLink = this.page.getByText("Click to Continue");
      const needsRelaunch = await relaunchLink
        .waitFor({ state: "visible", timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (needsRelaunch) {
        console.log(
          "⚠️ PayPal: overlay de 'relanzar ventana' detectado, clickeando 'Click to Continue'",
        );
        await relaunchLink.click();
      }

      await this.page.waitForURL(/\/complete/, { timeout: 120000 });
      console.log("✅ Orden confirmada, navegando a /complete");
      return;
    }

    // ⚠️ GPay:
    if (this.usingGPay) {
      await this.btnCheckout.click();
      await this.approveGPayPopup("#google-pay-button-cart", "cart", liveMode);

      // Igual que PayPal: puede haber una segunda sección "Subscription
      // Box" con su propio botón, que no siempre existe (Retail Customer).
      const hasSubscriptionBox = await this.page
        .locator("#google-pay-button-box")
        .waitFor({ state: "visible", timeout: 8000 })
        .then(() => true)
        .catch(() => false);
      if (hasSubscriptionBox) {
        await this.approveGPayPopup(
          "#google-pay-button-box",
          "subscription",
          liveMode,
        );
      } else {
        console.log("ℹ️ GPay: sin sección de suscripción en este flujo");
      }

      if (liveMode) {
        console.log(
          "✅ Modo live: GPay solo verificado hasta apertura de ventana, sin completar el pago real (sin cuentas reales en live)",
        );
        return;
      }

      await this.page.waitForURL(/\/complete/, { timeout: 120000 });
      console.log("✅ Orden confirmada, navegando a /complete");
      return;
    }

    if (this.usingAdyenRedirectMethod) {
      const slug = this.usingAdyenRedirectMethod;

      if (slug === "oxxo") {
        await Promise.all([
          this.page.waitForURL(/\/complete/, { timeout: 60000 }),
          this.btnCheckout.click(),
        ]);
        console.log(
          "✅ Oxxo: pedido confirmado con voucher de pago en efectivo",
        );
        return;
      }

      const [popup] = await Promise.all([
        this.page.waitForEvent("popup", { timeout: 10000 }).catch(() => null),
        this.page
          .waitForURL((url) => !url.pathname.includes("/checkout"), {
            timeout: 30000,
          })
          .catch(() => {}),
        this.btnCheckout.click(),
      ]);
      const targetPage = popup ?? this.page;

      if ((slug === "eBanking" || slug === "boost") && liveMode) {
        console.log(
          `✅ Modo live: ${slug} - redirect al gateway confirmado (${targetPage.url()}), sin completar el pago real`,
        );
        return;
      }

      if (slug === "eBanking" || slug === "boost") {
        await targetPage
          .locator('button:has-text("authorised")')
          .first()
          .click();
        await this.page.waitForURL(/\/complete/, { timeout: 60000 });
        console.log(
          `✅ ${slug}: pago autorizado en el simulador, orden confirmada`,
        );
        return;
      }

      // ⚠️ Atome
      if (slug === "atome" && !popup) {
        await expect(this.page).toHaveURL(/sandbox-gateway\.apaylater\.net/, {
          timeout: 10000,
        });
        console.log(
          `✅ ${slug}: redirect al gateway confirmado (${this.page.url()}) — sin login, datos de sandbox pendientes`,
        );
        return;
      }

      if (popup) {
        await popup
          .waitForLoadState("domcontentloaded", { timeout: 20000 })
          .catch(() => {});
        console.log(`🔀 ${slug}: se abrió un popup — ${popup.url()}`);
        await popup
          .screenshot({ path: `test-results/_debug-${slug}-popup.png` })
          .catch(() => {});
      } else {
        console.log(
          `🔀 ${slug}: navegación en la misma pestaña — ${this.page.url()}`,
        );
        await this.page
          .screenshot({ path: `test-results/_debug-${slug}-redirect.png` })
          .catch(() => {});
      }

      throw new Error(
        `${slug}: falta implementar el flujo posterior al redirect/popup — ver test-results/_debug-${slug}-*.png`,
      );
    }

    // ⚠️ Modo live
    if (liveMode) {
      await this.btnCheckout.click();
      console.log(
        "✅ Modo live: Credit Card/Adyen solo verificado hasta el clic en Checkout, sin completar el pago real (sin tarjetas reales en live)",
      );
      return;
    }

    if (needs3ds) {
      await this.btnCheckout.click();
      const handled = await this.handle3dsChallenge();
      if (!handled) {
        console.log("ℹ️ Pago 3DS frictionless (sin challenge visible)");
      }
      await this.page.waitForURL(/\/complete/, { timeout: 120000 });
    } else {
      await this.btnCheckout.click();

      const sponsorError = this.page.getByText("SPONSOR_NOT_FOUND");
      for (let attempt = 1; attempt <= 3; attempt++) {
        const sawSponsorError = await sponsorError
          .waitFor({ state: "visible", timeout: 10000 })
          .then(() => true)
          .catch(() => false);
        if (!sawSponsorError) break;

        console.log(
          `⚠️ SPONSOR_NOT_FOUND tras el clic en Checkout, reintentando (${attempt}/3)...`,
        );
        await this.page
          .waitForLoadState("networkidle", { timeout: 15000 })
          .catch(() => {});

        await this.btnCheckout.click({ timeout: 20000 }).catch(() => {});
      }

      await this.page.waitForURL(/\/complete/, { timeout: 120000 });
    }

    console.log("✅ Orden confirmada, navegando a /complete");
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
      //ssn: string;
      username: string;
      password: string;
    },
    opts: {
      needs3ds?: boolean;
      provider?: PaymentProvider;
      openInvoiceDetails?: OpenInvoiceDetails;
      liveMode?: boolean;
    } = {},
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();

    // 1. Pago
    await this.selectCreditCardPayment(opts.provider, opts.openInvoiceDetails);
    await this.fillCardDetails(card);

    // 2. Billing address (ya viene marcado)
    await this.verifyTodayOrderBillingAddress();

    // 3. Subscription mismo método (Oxxo: no puede ser "igual que el
    // carrito", ver selectSubscriptionAlternatePayment)
    if (this.usingAdyenRedirectMethod === "oxxo") {
      await this.selectSubscriptionAlternatePayment();
    } else {
      await this.verifySubscriptionSamePayment();
    }

    // 4. ✅ Nuevos campos del enrolamiento
    await this.fillBirthDate(
      enrollData.birthMonth,
      enrollData.birthDay,
      enrollData.birthYear,
    );
    //await this.fillSSN(enrollData.ssn);
    await this.fillCredentials(enrollData.username, enrollData.password);

    // 5. Checkboxes
    await this.checkPersonalConsumption();
    await this.acceptAgreements();

    // 6. Capturar totales
    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    // 7. Confirmar
    await this.placeOrder(opts.needs3ds ?? false, opts.liveMode ?? false);

    return { orderTotal, subscriptionTotal };
  }

  async completeSCCheckout(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    enrollData: {
      username: string;
      password: string;
    },
    referral:
      | { type: "name"; firstName: string; lastName: string }
      | { type: "id"; sponsorId: string }
      | { type: "none" },
    opts: {
      needs3ds?: boolean;
      provider?: PaymentProvider;
      openInvoiceDetails?: OpenInvoiceDetails;
      liveMode?: boolean;
    } = {},
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment(opts.provider, opts.openInvoiceDetails);
    await this.fillCardDetails(card);
    await this.verifyTodayOrderBillingAddress();
    if (this.usingAdyenRedirectMethod === "oxxo") {
      await this.selectSubscriptionAlternatePayment();
    } else {
      await this.verifySubscriptionSamePayment();
    }

    // ✅ Sección de referidos
    if (referral.type === "name") {
      await this.selectReferralByName(referral.firstName, referral.lastName);
    } else if (referral.type === "id") {
      await this.selectReferralById(referral.sponsorId);
    } else {
      await this.selectNoReferral();
    }

    await this.fillCredentials(enrollData.username, enrollData.password);

    await this.acceptAgreements();
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });
    await this.page.waitForTimeout(1000);

    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();
    await this.placeOrder(opts.needs3ds ?? false, opts.liveMode ?? false);

    return { orderTotal, subscriptionTotal };
  }

  async completeRCCheckout(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    enrollData: {
      username: string;
      password: string;
    },
    referral:
      | { type: "name"; firstName: string; lastName: string }
      | { type: "id"; sponsorId: string }
      | { type: "none" },
    opts: {
      needs3ds?: boolean;
      provider?: PaymentProvider;
      openInvoiceDetails?: OpenInvoiceDetails;
      liveMode?: boolean;
    } = {},
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment(opts.provider, opts.openInvoiceDetails);
    await this.fillCardDetails(card);
    await this.verifyTodayOrderBillingAddress();
    //await this.verifySubscriptionSamePayment();

    // ✅ Sección de referidos
    if (referral.type === "name") {
      await this.selectReferralByName(referral.firstName, referral.lastName);
    } else if (referral.type === "id") {
      await this.selectReferralById(referral.sponsorId);
    } else {
      await this.selectNoReferral();
    }

    await this.fillCredentials(enrollData.username, enrollData.password);

    await this.acceptAgreements();
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });
    await this.page.waitForTimeout(1000);

    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();
    await this.placeOrder(opts.needs3ds ?? false, opts.liveMode ?? false);

    return { orderTotal, subscriptionTotal };
  }

  async completeCCheckout(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    enrollData: {
      username: string;
      password: string;
    },
    referral:
      | { type: "name"; firstName: string; lastName: string }
      | { type: "id"; sponsorId: string }
      | { type: "none" },
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment();
    await this.fillCardDetails(card);
    await this.verifyTodayOrderBillingAddress();

    // ✅ Sección de referidos
    if (referral.type === "name") {
      await this.selectReferralByName(referral.firstName, referral.lastName);
    } else if (referral.type === "id") {
      await this.selectReferralById(referral.sponsorId);
    } else {
      await this.selectNoReferral();
    }

    await this.fillCredentials(enrollData.username, enrollData.password);

    await this.acceptAgreements();
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });
    await this.page.waitForTimeout(1000);

    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();
    await this.placeOrder();

    return { orderTotal, subscriptionTotal };
  }
}
