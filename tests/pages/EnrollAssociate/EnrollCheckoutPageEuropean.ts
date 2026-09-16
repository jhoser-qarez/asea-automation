import { Page, Locator, expect } from "@playwright/test";
import {
  CheckoutPageEuropean,
  PaymentMethodPreference,
} from "../CheckoutPageEuropean";
import {
  MarketLabels,
  defaultLabels,
  translateEnrollBirthMonth,
} from "../../fixtures/marketLabels";

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

  override async placeOrder() {
    await this.btnCheckout.scrollIntoViewIfNeeded();
    await expect(this.btnCheckout).toBeVisible({ timeout: 10000 });
    await expect(this.btnCheckout).toBeEnabled({ timeout: 10000 });
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });

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
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();

    await this.selectCreditCardPayment(paymentMethod);
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

    await this.placeOrder();

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
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment(paymentMethod);
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
    await this.placeOrder();

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
  ): Promise<{ orderTotal: string; subscriptionTotal: string }> {
    await this.verifyPageLoaded();
    await this.selectCreditCardPayment(paymentMethod);
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
    await this.placeOrder();

    return { orderTotal, subscriptionTotal };
  }
}
