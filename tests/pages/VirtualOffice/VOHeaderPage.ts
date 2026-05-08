// pages/VirtualOffice/VOHeaderPage.ts
import { Page, Locator, expect } from "@playwright/test";

export class VOHeaderPage {
  readonly page: Page;

  // ============================================================
  // Selectores del header
  // ============================================================

  readonly logo: Locator;
  readonly navbarBrand: Locator;

  // Selector de mercado/idioma
  readonly marketSelectorButton: Locator;
  readonly marketMenu: Locator;
  readonly marketSearchInput: Locator;
  readonly marketMenuClose: Locator;
  readonly marketLanguageItems: Locator;
  readonly currentMarketName: Locator;
  readonly currentMarketFlag: Locator;

  // Secciones colapsables
  readonly zone1Header: Locator; // The Americas
  readonly zone2Header: Locator; // Europe
  readonly zone3Header: Locator; // Asia Pacific
  readonly zone1Body: Locator; // divLanguagesZone1
  readonly zone2Body: Locator; // divLanguagesZone2
  readonly zone3Body: Locator; // divLanguagesZone3

  // Notificaciones
  readonly notificationIcon: Locator;
  readonly notificationCount: Locator;

  // Perfil de usuario
  readonly userProfileButton: Locator;
  readonly userProfileMenu: Locator;

  // Sidebar toggle
  readonly sidebarToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Logo
    this.logo = page.locator(".navbar-brand img");
    this.navbarBrand = page.locator(".navbar-brand");

    // Selector de mercado/idioma
    this.marketSelectorButton = page.locator(
      "#languageSecondaryOption .icon-language",
    );
    this.marketMenu = page.locator("#menuLanguages");
    this.marketSearchInput = page.locator("#txtMenuLanguagesSearchBox");
    this.marketMenuClose = page.locator("#btnLanguagesMenuClose");
    this.marketLanguageItems = page.locator("#menuLanguages .language-items");
    this.currentMarketName = page.locator("#nameLanguageCurrent");
    this.currentMarketFlag = page.locator("#ImgLanguageCurrent");

    // Secciones colapsables
    this.zone1Header = page.locator('div[data-target="#divLanguagesZone1"]');
    this.zone2Header = page.locator('div[data-target="#divLanguagesZone2"]');
    this.zone3Header = page.locator('div[data-target="#divLanguagesZone3"]');
    this.zone1Body = page.locator("#divLanguagesZone1");
    this.zone2Body = page.locator("#divLanguagesZone2");
    this.zone3Body = page.locator("#divLanguagesZone3");

    // Notificaciones
    this.notificationIcon = page.locator('.icon-bell, [title="Notification"]');
    this.notificationCount = page.locator("#countNotification");

    // Perfil de usuario
    this.userProfileButton = page.locator(
      "#userprofileSecondaryOption .icon-userprofile, #lnkAccount",
    );
    this.userProfileMenu = page.locator(".account-profile-container");

    // Sidebar toggle
    this.sidebarToggle = page.locator(".navbar-toggle, .call-sidenav");
  }

  // ============================================================
  // Métodos generales
  // ============================================================

  async verifyHeaderVisible() {
    await expect(this.logo.first()).toBeVisible({ timeout: 10000 });
    console.log("✅ Header del VO visible");
  }

  async getCurrentMarket(): Promise<string> {
    const marketText = await this.currentMarketName.textContent();
    return marketText?.trim() || "";
  }

  async openMarketMenu() {
    const isAlreadyOpen = await this.marketMenu.isVisible({ timeout: 1000 }).catch(() => false);
    if (!isAlreadyOpen) {
      await this.marketSelectorButton.click();
      await expect(this.marketMenu).toBeVisible({ timeout: 10000 });
    }
    console.log("✅ Menú de mercados abierto");
  }

  async closeMarketMenu() {
    if (
      await this.marketMenuClose.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      await this.marketMenuClose.click();
      await expect(this.marketMenu).not.toBeVisible({ timeout: 5000 });
      console.log("✅ Menú de mercados cerrado");
    }
  }

  // ============================================================
  // Métodos para expandir secciones
  // ============================================================

  private async expandZoneIfNeeded(zoneHeader: Locator, zoneBody: Locator) {
    const isExpanded = await zoneBody
      .getAttribute("class")
      .then((c) => c?.includes("in") || false);
    if (!isExpanded) {
      await zoneHeader.click();
      await this.page.waitForTimeout(500);
      console.log(`   📂 Sección expandida`);
    }
  }

  async expandAllZones() {
    await this.expandZoneIfNeeded(this.zone1Header, this.zone1Body);
    await this.expandZoneIfNeeded(this.zone2Header, this.zone2Body);
    await this.expandZoneIfNeeded(this.zone3Header, this.zone3Body);
  }

  // ============================================================
  // Métodos para obtener mercados
  // ============================================================

  /**
   * Obtiene TODOS los mercados disponibles en el entorno actual
   */
  async getAllMarkets(): Promise<string[]> {
    await this.openMarketMenu();
    await this.expandAllZones();
    await this.marketLanguageItems
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    const markets = await this.marketLanguageItems.evaluateAll((items) =>
      items.map((item) => {
        const link = item.querySelector("a");
        return link?.textContent?.trim() || "";
      }),
    );

    const uniqueMarkets = [...new Set(markets.filter((m) => m !== ""))];
    console.log(`📋 Mercados encontrados: ${uniqueMarkets.length}`);
    uniqueMarkets.forEach((m) => console.log(`   - ${m}`));

    await this.closeMarketMenu();
    return uniqueMarkets;
  }

  /**
   * Obtiene los mercados agrupados por continente/región
   */
  async getMarketsByZone(): Promise<{
    americas: string[];
    europe: string[];
    asiaPacific: string[];
  }> {
    await this.openMarketMenu();
    await this.expandAllZones();

    const getMarketsFromZone = async (zoneBody: Locator): Promise<string[]> => {
      const markets = await zoneBody
        .locator(".language-items a")
        .evaluateAll((items) =>
          items.map((item) => item.textContent?.trim() || ""),
        );
      return markets.filter((m) => m !== "");
    };

    const americas = await getMarketsFromZone(this.zone1Body);
    const europe = await getMarketsFromZone(this.zone2Body);
    const asiaPacific = await getMarketsFromZone(this.zone3Body);

    console.log(`🌎 The Americas: ${americas.length} mercados`);
    console.log(`🌍 Europe: ${europe.length} mercados`);
    console.log(`🌏 Asia Pacific: ${asiaPacific.length} mercados`);

    await this.closeMarketMenu();
    return { americas, europe, asiaPacific };
  }

  // ============================================================
  // MÉTODO CORREGIDO: Cambiar mercado escribiendo letra por letra
  // ============================================================

  /**
   * Cambia a un mercado expandiendo todas las zonas y haciendo clic directo.
   * Evita el buscador para no tener problemas con caracteres especiales ni timeouts por escritura.
   */
  async changeToMarket(marketName: string) {
    await this.openMarketMenu();
    await this.expandAllZones();

    const marketLink = this.page
      .locator(`#menuLanguages .language-items a:has-text("${marketName}")`)
      .first();

    await expect(marketLink).toBeVisible({ timeout: 10000 });
    console.log(`   🎯 Seleccionando mercado: "${marketName}"`);

    await Promise.all([
      this.page.waitForLoadState("networkidle", { timeout: 60000 }),
      marketLink.click(),
    ]);

    console.log(`✅ Mercado cambiado a: ${marketName}`);
  }

  /**
   * Cambiar a un mercado usando el buscador (escribe letra por letra para que filtre).
   * @deprecated Usar changeToMarket() — el buscador falla con caracteres especiales.
   */
  async changeToMarketBySearch(marketName: string) {
    await this.changeToMarket(marketName);
  }

  /**
   * Cambiar a un mercado navegando por continente
   */
  async changeToMarketByContinent(
    continent: "americas" | "europe" | "asiapacific",
    marketName: string,
  ) {
    await this.openMarketMenu();

    switch (continent) {
      case "americas":
        await this.expandZoneIfNeeded(this.zone1Header, this.zone1Body);
        break;
      case "europe":
        await this.expandZoneIfNeeded(this.zone2Header, this.zone2Body);
        break;
      case "asiapacific":
        await this.expandZoneIfNeeded(this.zone3Header, this.zone3Body);
        break;
    }

    const marketLink = this.page
      .locator(`#menuLanguages .language-items a:has-text("${marketName}")`)
      .first();
    await expect(marketLink).toBeVisible({ timeout: 5000 });

    await Promise.all([
      this.page.waitForLoadState("networkidle", { timeout: 60000 }),
      marketLink.click(),
    ]);

    console.log(`✅ Mercado cambiado a: ${marketName} (vía continente)`);
  }

  async verifyCurrentMarket(expectedMarket: string) {
    const currentMarket = await this.getCurrentMarket();
    expect(currentMarket).toContain(expectedMarket);
    console.log(`✅ Mercado actual: ${currentMarket}`);
  }

  // ============================================================
  // Métodos de perfil
  // ============================================================

  async openUserProfileMenu() {
    await this.userProfileButton.click();
    await expect(this.userProfileMenu).toBeVisible({ timeout: 10000 });
    console.log("✅ Menú de perfil abierto");
  }

  async closeUserProfileMenu() {
    await this.page.keyboard.press("Escape");
    await expect(this.userProfileMenu).not.toBeVisible({ timeout: 5000 });
  }
}
