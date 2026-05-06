import { Page, Locator, expect } from "@playwright/test";

export class UserMenuPage {
  readonly page: Page;

  // Locators basados en el HTML que me compartiste
  readonly userIcon: Locator;
  readonly userMenuContainer: Locator;
  readonly goToVOLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Ícono de usuario (la clase que ya usas en LoginPage)
    this.userIcon = page.locator("button.icon-login-user");

    // Contenedor del menú desplegado (cuando está visible)
    this.userMenuContainer = page.locator("#fuera");

    // Enlace "Go to VO" (abre en nueva pestaña)
    this.goToVOLink = page.locator('a:has-text("Go to VO")');

    // Botón de Logout
    this.logoutButton = page.locator('button:has-text("LogOut")');
  }

  /**
   * Abre el menú de usuario haciendo clic en el ícono
   */
  async openUserMenu() {
    // Primero asegurarnos que el menú no está ya abierto
    const isMenuVisible = await this.userMenuContainer
      .isVisible()
      .catch(() => false);

    if (!isMenuVisible) {
      await this.userIcon.click();
      // Esperar a que el menú esté visible en el DOM (no necesariamente en pantalla)
      await this.page.waitForSelector("#fuera", { timeout: 10000 });
      // Pequeña espera para animación
      await this.page.waitForTimeout(500);
    }

    console.log("✅ Menú de usuario abierto");
  }

  /**
   * Navega al Virtual Office (abre en nueva pestaña)
   * @returns La página del Virtual Office
   */
  async goToVirtualOffice(): Promise<Page> {
    await this.openUserMenu();

    // Esperar a que el enlace sea visible
    await expect(this.goToVOLink).toBeVisible({ timeout: 5000 });

    // Hacer clic y esperar la nueva pestaña
    const [voPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 10000 }),
      this.goToVOLink.click(),
    ]);

    // Esperar que cargue la nueva página
    await voPage.waitForLoadState("networkidle", { timeout: 30000 });
    console.log("✅ Virtual Office abierto en nueva pestaña");

    return voPage;
  }

  /**
   * Cierra sesión
   */
  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
    console.log("✅ Sesión cerrada");
  }
}
