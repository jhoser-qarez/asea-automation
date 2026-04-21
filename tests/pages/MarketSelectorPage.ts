import { Page, Locator, expect } from "@playwright/test";

export class MarketSelectorPage {
  readonly page: Page;

  // 🎯 Botón en el header para abrir el modal de mercado
  readonly btnChangeMarket: Locator;

  // 🎯 Primer modal: "Hi, shopping in..."
  readonly modalLanguageSelector: Locator;
  readonly btnSelectAnotherMarket: Locator;
  readonly autocompleteLanguage: Locator;
  readonly btnShopHere: Locator;

  // 🎯 Segundo modal: "Change Market?"
  readonly modalChangeMarket: Locator;
  readonly autocompleteMarketSearch: Locator;
  readonly btnYes: Locator;
  readonly btnNo: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Botón bandera en el header
    this.btnChangeMarket = page.locator(
      '[data-cy="change-market-display-btn"]',
    );

    // ✅ Primer modal
    this.modalLanguageSelector = page.locator('[data-cy="language-selector"]');
    this.btnSelectAnotherMarket = page.locator(
      '[data-cy="select-another-market-btn"]',
    );
    this.autocompleteLanguage = page.locator(
      '[data-cy="list-languages"] [data-test="autocomplete-language"]',
    );
    this.btnShopHere = page
      .locator('[data-cy="language-selector"] button.primary')
      .last();

    // ✅ Segundo modal: "Change Market?"
    this.modalChangeMarket = page.locator('[data-cy="warning-change-market"]');
    this.autocompleteMarketSearch = page.locator(
      '[data-cy="warning-change-market"] [data-test="autocomplete-language"]',
    );
    this.btnYes = page.locator('[data-cy="click-yes-desktop-btn"]');
    this.btnNo = page.locator('[data-cy="click-no-desktop-btn"]');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASO A: Cambiar el mercado
  // Flujo: click bandera → modal 1 → "Select Another Market" → modal 2
  //        → busca y selecciona mercado → "Yes"
  //        → modal se cierra, página recarga con idioma por defecto del mercado
  // ─────────────────────────────────────────────────────────────────────────
  async changeMarket(marketName: string) {
    await this.btnChangeMarket.click();
    await expect(this.modalLanguageSelector).toBeVisible({ timeout: 10000 });

    await this.btnSelectAnotherMarket.click();
    await expect(this.modalChangeMarket).toBeVisible({ timeout: 10000 });

    await this.autocompleteMarketSearch.click();
    await this.autocompleteMarketSearch.fill(marketName);

    const option = this.page
      .locator(".v-list-item__title", { hasText: marketName })
      .first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();

    await expect(this.btnYes).toBeEnabled({ timeout: 10000 });
    await this.btnYes.click();

    // Modal se cierra y página recarga con idioma por defecto del mercado
    await expect(this.modalChangeMarket).not.toBeVisible({ timeout: 15000 });
    await this.page.waitForLoadState("networkidle", { timeout: 30000 });

    console.log(`✅ Mercado cambiado a: ${marketName}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASO B: Cambiar el idioma
  // Flujo: click bandera nuevamente → modal 1 aparece con idiomas del mercado
  //        → seleccionar idioma → "Shop Here"
  //        → página recarga en el idioma seleccionado
  // ─────────────────────────────────────────────────────────────────────────
  async changeLanguage(languageOption: string) {
    await this.btnChangeMarket.click();
    await expect(this.modalLanguageSelector).toBeVisible({ timeout: 10000 });

    await this.autocompleteLanguage.click();
    await this.autocompleteLanguage.fill(languageOption);

    const option = this.page
      .locator(".v-list-item__title", { hasText: languageOption })
      .first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();

    await this.btnShopHere.click();
    await this.page.waitForLoadState("networkidle", { timeout: 30000 });

    console.log(`✅ Idioma cambiado a: ${languageOption}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Flujo completo: cambiar mercado + cambiar idioma (2 aperturas del modal)
  // ─────────────────────────────────────────────────────────────────────────
  async changeMarketAndLanguage(marketName: string, languageOption: string) {
    await this.changeMarket(marketName);
    await this.changeLanguage(languageOption);
    console.log(`✅ Listo: ${marketName} - ${languageOption}`);
  }
  
}
