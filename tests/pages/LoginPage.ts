import { Page, Locator, expect } from "@playwright/test";
import { urls } from "../fixtures/urls";
import { MarketLabels, defaultLabels } from "../fixtures/marketLabels";

export class LoginPage {
  readonly page: Page;
  readonly labels: MarketLabels;
  //Icono Login - Header Shop
  readonly btnLogout: Locator;

  //Elementos del popup Market
  readonly btnShopHere: Locator;

  //Elementos del formulario de Login
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly btnLogin: Locator;
  readonly btnPerfil: Locator;

  constructor(page: Page, labels: MarketLabels = defaultLabels) {
    this.page = page;
    this.labels = labels;

    this.btnShopHere = page
      .locator("button", { hasText: labels.shopHere })
      .first();
    this.btnLogout = page.locator('[data-test="profile-icon"]');
    this.inputUsername = page.locator("#user");
    this.inputPassword = page.locator("#password");
    this.btnLogin = page.getByRole("button", { name: labels.login });
    this.btnPerfil = page.locator(".icon-login-user:visible");
  }

  getUsernameLabel(username: string): Locator {
    return this.page.locator(".text-gray-400").filter({ hasText: username });
  }

  async goto() {
    await this.page.context().clearCookies();
    await this.page.context().clearPermissions();
    await this.page.goto(urls.shop.login);
  }

  async login(username: string, password: string) {
    await this.btnShopHere.click();
    await this.btnLogout.click();
    await this.inputUsername.click();
    await this.inputUsername.pressSequentially(username, { delay: 100 });
    await this.inputPassword.click();
    await this.inputPassword.pressSequentially(password, { delay: 100 });
    await this.btnLogin.click();
  }

  async verifyLoginSuccess(username: string) {
    await this.btnPerfil.click();
    await expect(this.getUsernameLabel(username)).toBeVisible();
    await expect(this.getUsernameLabel(username)).toContainText(username);
  }

  async gotoByEnv(env: "stage" | "live", port?: string) {
    await this.page.context().clearCookies();
    await this.page.context().clearPermissions();
    await this.page.goto(
      env === "live" ? urls.shopLive.login : urls.shop.login,
    );
    if (port) {
      const url = new URL(this.page.url());
      url.port = port;
      console.log(`🔀 Redirigiendo shop a puerto ${port}: ${url.href}`);
      await this.page.goto(url.href);
    }
  }
}
