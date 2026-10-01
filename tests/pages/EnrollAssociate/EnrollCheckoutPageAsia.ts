import { Page, Locator } from "@playwright/test";
import { EnrollCheckoutPage, OpenInvoiceDetails } from "./EnrollCheckoutPage";
import { MarketLabels, defaultLabels } from "../../fixtures/marketLabels";
import { PaymentProvider } from "../../fixtures/paymentCases";

export class EnrollCheckoutPageAsia extends EnrollCheckoutPage {
  override readonly inputSSN: Locator;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    super(page, labels);
    this.inputSSN = page.locator("#GovermentId");
  }

  private async fillSSNIfPresent(ssn: string) {
    const ssnFieldPresent = await this.inputSSN
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (ssnFieldPresent) {
      await this.fillSSN(ssn);
    } else {
      console.log(
        "⏭️ Sin campo de SSN/ID en Checkout (ya se llenó en Info, o no aplica)",
      );
    }
  }

  // ✅ Flujo completo
  override async completeEnrollCheckout(
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
    await this.verifySubscriptionSamePayment();

    await this.fillBirthDate(
      enrollData.birthMonth,
      enrollData.birthDay,
      enrollData.birthYear,
    );
    await this.fillSSNIfPresent(enrollData.ssn);
    await this.fillCredentials(enrollData.username, enrollData.password);

    await this.acceptAgreements();

    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();

    await this.placeOrder(opts.needs3ds ?? false, opts.liveMode ?? false);

    return { orderTotal, subscriptionTotal };
  }

  // ✅ Flujo completo del checkout de enrolamiento — Subscription Customer.
  override async completeSCCheckout(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    enrollData: {
      ssn: string;
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
    await this.verifySubscriptionSamePayment();

    if (referral.type === "name") {
      await this.selectReferralByName(referral.firstName, referral.lastName);
    } else if (referral.type === "id") {
      await this.selectReferralById(referral.sponsorId);
    } else {
      await this.selectNoReferral();
    }

    await this.fillSSNIfPresent(enrollData.ssn);
    await this.fillCredentials(enrollData.username, enrollData.password);

    await this.acceptAgreements();
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });
    await this.page.waitForTimeout(1000);

    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();
    await this.placeOrder(opts.needs3ds ?? false, opts.liveMode ?? false);

    return { orderTotal, subscriptionTotal };
  }

  // ✅ Flujo completo del checkout de enrolamiento — Retail Customer.
  override async completeRCCheckout(
    card: {
      name: string;
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    },
    enrollData: {
      ssn: string;
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

    if (referral.type === "name") {
      await this.selectReferralByName(referral.firstName, referral.lastName);
    } else if (referral.type === "id") {
      await this.selectReferralById(referral.sponsorId);
    } else {
      await this.selectNoReferral();
    }

    await this.fillSSNIfPresent(enrollData.ssn);
    await this.fillCredentials(enrollData.username, enrollData.password);

    await this.acceptAgreements();
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });
    await this.page.waitForTimeout(1000);

    const orderTotal = await this.captureOrderTotal();
    const subscriptionTotal = await this.captureSubscriptionTotal();
    await this.placeOrder(opts.needs3ds ?? false, opts.liveMode ?? false);

    return { orderTotal, subscriptionTotal };
  }
}
