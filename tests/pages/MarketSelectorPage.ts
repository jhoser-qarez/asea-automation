import { Page, Locator, expect } from "@playwright/test";

export class MarketSelectorPage {
  readonly page: Page;

  // 🎯 Botón en el header para abrir el modal de mercado
  readonly btnChangeMarket: Locator;

  // 🎯 Primer "screen" del modal: "Hi, shopping in..." + idioma + Shop Here
  readonly btnSelectAnotherMarket: Locator;
  readonly autocompleteLanguage: Locator;
  readonly btnShopHere: Locator;

  // 🎯 Segundo "screen" del modal: "Change Market?" + búsqueda + Yes/No
  readonly autocompleteMarketSearch: Locator;
  readonly btnYes: Locator;
  readonly btnNo: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Botón bandera en el header
    this.btnChangeMarket = page.locator(
      '[data-test="language-selector-button"]',
    );

    // ✅ Primer screen: selector de idioma / "Shop Here"
    this.btnSelectAnotherMarket = page.locator(
      '[data-test="select-another-market-button"]',
    );
    this.autocompleteLanguage = page
      .locator('[data-test="language-search-input"]')
      .locator("input");
    this.btnShopHere = page.locator('[data-test="modal-shop-here-button"]');

    // ✅ Segundo screen: búsqueda de mercado + confirmar
    this.autocompleteMarketSearch = page
      .locator('[data-test="market-search-input"]')
      .locator("input");
    this.btnYes = page.locator('[data-test="modal-yes-button"]');
    this.btnNo = page.locator('[data-test="modal-no-button"]');
  }

  // ─────────────────────────────────────────────────────────────────────────
  async changeMarket(marketName: string) {
    await this.btnChangeMarket.click();
    await expect(this.btnSelectAnotherMarket).toBeVisible({ timeout: 10000 });

    await this.btnSelectAnotherMarket.click();
    await expect(this.autocompleteMarketSearch).toBeVisible({
      timeout: 10000,
    });

    await this.autocompleteMarketSearch.click();
    await this.autocompleteMarketSearch.fill(marketName);

    await expect(this.btnYes).toBeEnabled({ timeout: 10000 });

    // ⚠️ Confirmado con evidencia real (tráfico de red durante un cambio de
    // mercado en Shop): la UI se actualiza (idioma, bandera) antes de que el
    // backend persista el cambio — la llamada real que lo confirma es este
    // PUT a .../ShoppingCart/{id}/MarketId. Esperar solo "networkidle"
    // (heurística genérica) podía dejar avanzar el flujo con el mercado
    // aún NO persistido en el servidor, causando errores como "REGION NOT
    // FOUND" en /info más adelante (el backend seguía validando con el
    // mercado anterior pese a que visualmente ya se veía el nuevo).
    // ⚠️ Esta clase también se usa en el flujo de Enroll, donde todavía no
    // existe un ShoppingCart en este punto — ese PUT nunca se dispara ahí.
    // Por eso la espera es "best-effort" (.catch): si llega, confirma que el
    // mercado ya persistió antes de seguir; si no llega (Enroll), no bloquea
    // el flujo y se sigue confiando en el "networkidle" de abajo, que es lo
    // que ya funcionaba para ese caso.
    await Promise.all([
      this.page
        .waitForResponse(
          (res) =>
            /\/ShoppingCart\/\d+\/MarketId/.test(res.url()) &&
            res.request().method() === "PUT",
          { timeout: 15000 },
        )
        .catch(() => null),
      this.btnYes.click(),
    ]);

    // Modal se cierra y página recarga con idioma por defecto del mercado
    await expect(this.btnYes).not.toBeVisible({ timeout: 15000 });
    await this.page.waitForLoadState("networkidle", { timeout: 30000 });

    console.log(`✅ Mercado cambiado a: ${marketName}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  async changeLanguage(languageOption: string) {
    await this.btnChangeMarket.click();
    await expect(this.autocompleteLanguage).toBeVisible({ timeout: 10000 });

    await this.autocompleteLanguage.click();
    await this.autocompleteLanguage.fill(languageOption);

    await this.page.waitForTimeout(500);
    await this.btnShopHere.click();
    await this.page.waitForLoadState("networkidle", { timeout: 30000 });

    console.log(`✅ Idioma cambiado a: ${languageOption}`);
  }
  // Flujo completo: cambiar mercado + cambiar idioma

  async changeMarketAndLanguage(marketName: string, languageOption: string) {
    await this.changeMarket(marketName);
    await this.changeLanguage(languageOption);
    console.log(`✅ Listo: ${marketName} - ${languageOption}`);
  }
}
