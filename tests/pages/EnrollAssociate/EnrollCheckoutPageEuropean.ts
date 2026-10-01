import { Page, Locator, Frame, expect } from "@playwright/test";
import {
  CheckoutPageEuropean,
  PaymentMethodPreference,
} from "../CheckoutPageEuropean";
import {
  MarketLabels,
  defaultLabels,
  translateEnrollBirthMonth,
} from "../../fixtures/marketLabels";
import { PaymentProvider, PaymentCaseBankDetails } from "../../fixtures/paymentCases";
import { users } from "../../fixtures/credentials";

export interface EuropeanPaymentOpts {
  provider?: PaymentProvider;
  bankDetails?: PaymentCaseBankDetails;
  needs3ds?: boolean;
}

export class EnrollCheckoutPageEuropean extends CheckoutPageEuropean {
  readonly radioBoxSameAsCart: Locator;
  readonly labelBoxSameAsCart: Locator;

  // 🎯 Birth Date
  readonly selectMonth: Locator;
  readonly selectDay: Locator;
  readonly inputYear: Locator;

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

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    super(page, labels);

    this.radioBoxSameAsCart = page.locator(
      'input[type="radio"][value="Same as Your Cart Billing Method"]',
    );
    this.labelBoxSameAsCart = page.locator('label[for="-1"]', {
      hasText: labels.sameAsCartBillingMethod,
    });

    this.selectMonth = page.locator('input[name="dateMonth"]');
    this.selectDay = page.locator('input[name="dateDay"]');
    this.inputYear = page.locator('input[name="dateYear"]');

    this.inputUsername = page.locator("#SiteId");
    this.inputPassword = page.locator("#password");
    this.inputConfirmPassword = page.locator("#confirmPassword");

    this.radioSearchByName = page.locator('input[role="radio"][value="1"]');
    this.radioSearchById = page.locator('input[role="radio"][value="2"]');
    this.radioNoReferral = page.locator('input[role="radio"][value="4"]');
    this.radioReferralResult = page.locator('input[role="radio"][value="5"]');

    this.referralNameContainer = page
      .locator(".options-search-sponsor .color-row")
      .filter({ has: page.locator('input[role="radio"][value="1"]') });
    this.inputReferralFirstName = this.referralNameContainer
      .locator('input[type="text"]')
      .first();
    this.inputReferralLastName = this.referralNameContainer
      .locator('input[type="text"]')
      .last();

    this.referralIdContainer = page
      .locator(".options-search-sponsor .color-row")
      .filter({ has: page.locator('input[role="radio"][value="2"]') });
    this.inputReferralSponsorId =
      this.referralIdContainer.locator('input[type="text"]');
  }

  // ✅ Challenge 3DS (tarjetas con `needs3ds`) — mismo patrón que
  // EnrollCheckoutPage.ts (mercados estándar/Asia).
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
    await approveBtn.first().click();

    await popup.waitForEvent("close", { timeout: 30000 }).catch(() => {});
    console.log(`✅ PayPal (${slug}) aprobado`);
  }

  // ✅ Flujo PayPal (BraintreeWithPayPal) — igual que EnrollCheckoutPage.ts.
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

  override async placeOrder(needs3ds = false) {
    await this.btnCheckout.scrollIntoViewIfNeeded();
    await expect(this.btnCheckout).toBeVisible({ timeout: 10000 });
    await expect(this.btnCheckout).toBeEnabled({ timeout: 10000 });
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });

    if (this.usingPayPal) {
      await this.btnCheckout.click();
      await this.payWithPayPal();

      // ⚠️ Mismo overlay de "relanzar ventana" ya confirmado en el flujo
      // estándar (ver EnrollCheckoutPage.placeOrder()).
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

    // ⚠️ Sofort/Klarna (Adyen, redirect)
    if (this.usingAdyenRedirectMethod) {
      const slug = this.usingAdyenRedirectMethod;
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

      const authoriseBtn = targetPage.locator('button:has-text("authorised")');
      const hasAuthoriseBtn = await authoriseBtn
        .first()
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      if (hasAuthoriseBtn) {
        await authoriseBtn.first().click();
        await this.page.waitForURL(/\/complete/, { timeout: 60000 });
        console.log(`✅ ${slug}: pago autorizado en el simulador, orden confirmada`);
        return;
      }

      const redirected = popup !== null || !targetPage.url().includes("/checkout");
      if (redirected) {
        console.log(
          `✅ ${slug}: redirect al gateway confirmado (${targetPage.url()}) — sin login, fuera del alcance de esta automatización`,
        );
        return;
      }

      console.log(`🔀 ${slug}: sin popup ni navegación tras el clic — ${targetPage.url()}`);
      await targetPage
        .screenshot({ path: `test-results/_debug-de-${slug}-redirect.png` })
        .catch(() => {});
      throw new Error(
        `${slug}: no se detectó popup ni redirect tras el clic en Checkout — ver test-results/_debug-de-${slug}-redirect.png`,
      );
    }

    if (needs3ds) {
      await this.btnCheckout.click();
      const handled = await this.handle3dsChallenge();
      if (!handled) {
        console.log("ℹ️ Pago 3DS frictionless (sin challenge visible)");
      }
      await this.page.waitForURL(/\/complete/, { timeout: 120000 });
      console.log("✅ Orden confirmada, navegando a /complete");
      return;
    }

    await Promise.all([
      this.page.waitForURL(/\/complete/, { timeout: 120000 }),
      this.btnCheckout.click(),
    ]);

    console.log("✅ Orden confirmada, navegando a /complete");
  }

  async fillBirthDate(month: string, day: string, year: string) {
    const translatedMonth = translateEnrollBirthMonth(month, this.labels);
    await this.selectAutocompleteOption(this.selectMonth, translatedMonth);
    await this.selectAutocompleteOption(this.selectDay, day);

    await this.inputYear.clear();
    await this.inputYear.pressSequentially(year, { delay: 100 });

    console.log(`✅ Fecha de nacimiento: ${translatedMonth} ${day}, ${year}`);
  }

  private async selectAutocompleteOption(input: Locator, optionText: string) {
    await input.click();
    const option = input
      .locator("xpath=..")
      .getByText(optionText, { exact: true });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
  }

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

  async selectNoReferral() {
    await this.page
      .locator("label", { hasText: this.labels.noOneReferredMe })
      .click();
    console.log("✅ 'No one referred me' seleccionado");
  }

  private async _selectReferralResult() {
    await expect(this.radioReferralResult).toBeVisible({ timeout: 15000 });

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

  async fillCredentials(username: string, password: string) {
    await this.inputUsername.scrollIntoViewIfNeeded();

    await this.inputUsername.click({ force: true });
    await this.inputUsername.fill(username);

    await this.inputPassword.click({ force: true });
    await this.inputPassword.fill(password);

    await this.inputConfirmPassword.click({ force: true });
    await this.inputConfirmPassword.fill(password);

    console.log(`✅ Username: ${username}`);
  }

  async verifySubscriptionSamePayment() {
    const isChecked = await this.radioBoxSameAsCart.isChecked();
    if (!isChecked) {
      await this.labelBoxSameAsCart.click();
    }
    console.log("✅ Subscription mismo método de pago que Cart");
  }

  // ✅ Flujo completo del checkout de enrolamiento (Brand Partner) — Europa
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
      username: string;
      password: string;
    },
    paymentMethod: PaymentMethodPreference = "creditCard",
    opts: EuropeanPaymentOpts = {},
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();

    await this.selectCreditCardPayment(
      paymentMethod,
      opts.provider,
      opts.bankDetails,
    );
    await this.fillCardDetails(card);

    await this.verifySubscriptionBillingAddress();
    await this.verifySubscriptionSamePayment();

    await this.fillBirthDate(
      enrollData.birthMonth,
      enrollData.birthDay,
      enrollData.birthYear,
    );
    await this.fillCredentials(enrollData.username, enrollData.password);

    await this.acceptAgreements();

    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    await this.placeOrder(opts.needs3ds ?? false);

    return { orderTotal, subscriptionTotal };
  }

  // ✅ Flujo completo del checkout de enrolamiento — Subscription Customer
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
    paymentMethod: PaymentMethodPreference = "creditCard",
    opts: EuropeanPaymentOpts = {},
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment(
      paymentMethod,
      opts.provider,
      opts.bankDetails,
    );
    await this.fillCardDetails(card);
    await this.verifySubscriptionBillingAddress();
    await this.verifySubscriptionSamePayment();

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
    await this.placeOrder(opts.needs3ds ?? false);

    return { orderTotal, subscriptionTotal };
  }

  // ✅ Flujo completo del checkout de enrolamiento — Retail Customer
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
    paymentMethod: PaymentMethodPreference = "creditCard",
    opts: EuropeanPaymentOpts = {},
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment(
      paymentMethod,
      opts.provider,
      opts.bankDetails,
    );
    await this.fillCardDetails(card);
    await this.verifySubscriptionBillingAddress();

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
    await this.placeOrder(opts.needs3ds ?? false);

    return { orderTotal, subscriptionTotal };
  }
}
