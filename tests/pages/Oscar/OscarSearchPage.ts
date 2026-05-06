import { Page, Locator, expect } from "@playwright/test";

export class OscarSearchPage {
  readonly page: Page;

  // 🎯 Locators
  readonly selectCriteria: Locator;
  readonly inputKeyword: Locator;
  readonly btnSearch: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Por id estable
    this.selectCriteria = page.locator("#ddlSearchCriteria");
    this.inputKeyword = page.locator("#txtKeyword");
    this.btnSearch = page.locator("#idiconsearch_master1");
  }

  // ✅ Buscar por Brand Partner ID (por defecto)
  async searchByBrandPartnerId(id: string) {
    await this.selectCriteria.selectOption("20");

    await this.inputKeyword.clear();
    await this.inputKeyword.pressSequentially(id, { delay: 100 });

    // ✅ Esperar 2 segundos
    await this.page.waitForTimeout(3000);

    // ✅ Clic y esperar la respuesta de la API
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes("SearchCriterias_V2"),
        { timeout: 45000 },
      ),
      this.btnSearch.click({ force: true }),
    ]);

    console.log(`🔍 Búsqueda completada: ${id}`);
  }
  // ✅ Buscar por otros criterios
  async searchBy(
    criteria: "brandPartnerId" | "lastName" | "email",
    value: string,
  ) {
    const criteriaMap = {
      brandPartnerId: "20",
      lastName: "10",
      email: "50",
    };

    await this.selectCriteria.selectOption(criteriaMap[criteria]);
    await this.inputKeyword.clear();
    await this.inputKeyword.pressSequentially(value, { delay: 100 });
    await this.btnSearch.click();
    await this.btnSearch.click();

    console.log(`🔍 Buscando por ${criteria}: ${value}`);
  }
}
