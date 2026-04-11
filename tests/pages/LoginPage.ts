import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  // 🎯 Locators
  readonly btnShopHere: Locator;
  readonly btnPerfil1: Locator;
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly btnLogin: Locator;
  readonly btnPerfil: Locator;

  constructor(page: Page) {
    this.page = page;

    this.btnShopHere = page.getByRole("button", { name: "Shop Here" });
    this.btnPerfil1 = page.locator("i.mdi-account-circle").locator("..");
    this.inputUsername = page.locator('[data-test="username-input"]');
    this.inputPassword = page.locator('[data-test="password-input"]');
    this.btnLogin = page.locator('[data-test="login-button"]');
    this.btnPerfil = page.locator("button.icon-login-user");
  }

  getUsernameLabel(username: string): Locator {
    return this.page.locator(".item-info", { hasText: username });
  }

  async goto() {
    await this.page.context().clearCookies();
    await this.page.context().clearPermissions();
    await this.page.goto("/");
  }

  async login(username: string, password: string) {
    await this.btnShopHere.click();
    await this.btnPerfil1.click();
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
}
