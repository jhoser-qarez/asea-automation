import { Page, Locator, expect } from "@playwright/test";
import { urls } from "../../fixtures/urls";

export class OscarLoginPage {
  readonly page: Page;

  // 🎯 Locators
  readonly inputEmail: Locator;
  readonly inputPassword: Locator;
  readonly btnLogin: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Por id único de ASP.NET
    this.inputEmail = page.locator("#ContentPlaceHolder_ucLogin_txtEmail");
    this.inputPassword = page.locator(
      "#ContentPlaceHolder_ucLogin_txtPassword",
    );
    this.btnLogin = page.locator("#ContentPlaceHolder_ucLogin_BtnLogin");
  }

  // ✅ Navegar a Oscar
  async goto() {
    await this.page.goto(urls.oscar.login);
  }

  async gotoByEnv(env: "stage" | "live") {
    await this.page.goto(
      env === "live" ? urls.oscarLive.login : urls.oscar.login,
    );
  }

  // ✅ Verificar que estamos en Oscar
  async verifyPageLoaded() {
    //await expect(this.page).toHaveURL(/oscar\.(aseastage|aseaglobal)\.com/);
    await expect(this.inputEmail).toBeVisible();
    await expect(this.inputPassword).toBeVisible();
  }

  // ✅ Login en Oscar
  async login(email: string, password: string) {
    await this.inputEmail.click();
    await this.inputEmail.pressSequentially(email, { delay: 100 });
    await this.inputPassword.click();
    await this.inputPassword.pressSequentially(password, { delay: 100 });
    await this.btnLogin.click();
  }

  // ✅ Verificar login con el email que aparece bajo el nombre
  async verifyLoginSuccess(email: string) {
    // ✅ Verificar que el email coincide con el usado en el login
    const userEmail = this.page.locator(
      "#HeaderRightPlaceHolder_ucLogin1_txtEmailLogged",
    );
    //await expect(userEmail).toBeVisible();
    await expect(userEmail).toHaveText(email);

    const email_ = await userEmail.textContent();
    console.log(`✅ Login Oscar exitoso`);
    console.log(`📧 Email:   ${email_?.trim()}`);
  }

  // ✅ Flujo completo
  async gotoAndLogin(email: string, password: string) {
    await this.goto();
    await this.verifyPageLoaded();
    await this.login(email, password);
    await this.verifyLoginSuccess(email);
  }

  async gotoAndLoginByEnv(
    env: "stage" | "live",
    email: string,
    password: string,
  ) {
    await this.gotoByEnv(env);
    await this.verifyPageLoaded();
    await this.login(email, password);
    await this.verifyLoginSuccess(email);
  }
}
