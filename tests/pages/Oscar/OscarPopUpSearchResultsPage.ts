import { Page, Locator, expect } from "@playwright/test";

export class OscarPopUpSearchResultsPage {
  readonly page: Page;

  // 🎯 Modal
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly btnClose: Locator;

  // 🎯 Tabla
  readonly table: Locator;
  readonly tableInfo: Locator;
  readonly btnPrevious: Locator;
  readonly btnNext: Locator;

  // 🎯 Botones de acción
  readonly btnAutoship: Locator;
  readonly btnEnroll: Locator;
  readonly btnOrder: Locator;
  readonly btnBackOffice: Locator;

  // 🎯 Columnas de datos del distribuidor
  readonly colBrandPartnerId: Locator;
  readonly colFirstName: Locator;
  readonly colLastName: Locator;
  readonly colCompany: Locator;
  readonly colRepSite: Locator;
  readonly colUsername: Locator;
  readonly colAccountType: Locator;
  readonly colMarket: Locator;
  readonly colCity: Locator;
  readonly colState: Locator;
  readonly colLifetimeRank: Locator;
  readonly colPaidRank: Locator;
  readonly colStatus: Locator;
  readonly colActive: Locator;
  readonly colPhone: Locator;
  readonly colEmail: Locator;
  readonly colActiveAutoship: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ Modal
    this.modal = page.locator(".modal-dialog", {
      has: page.locator("#myModalLabel"),
    });
    this.modalTitle = page.locator("#myModalLabel");
    this.btnClose = page.locator(".modal-header .close");

    // ✅ Tabla y paginación
    this.table = page.locator("#tbDataTableInfo");
    this.tableInfo = page.locator("#tbDataTableInfo_info");
    this.btnPrevious = page.locator("#tbDataTableInfo_previous");
    this.btnNext = page.locator("#tbDataTableInfo_next");

    // ✅ Botones de acción por title (único y estable)
    this.btnAutoship = page.locator('a[title="Autoship"]');
    this.btnEnroll = page.locator('a[title="Enroll"]');
    this.btnOrder = page.locator('a[title="Order"]');
    this.btnBackOffice = page.locator('a[title="BackOffice"]');

    // ✅ Columnas por clase
    this.colBrandPartnerId = page.locator("td.actionlegacynumber");
    this.colFirstName = page.locator("td.actionfirstname");
    this.colLastName = page.locator("td.LastName");
    this.colCompany = page.locator("td.Company");
    this.colRepSite = page.locator("td.RepSite");
    this.colUsername = page.locator("td.Username");
    this.colAccountType = page.locator("td.AccType");
    this.colMarket = page.locator("td.Market");
    this.colCity = page.locator("td.PrimaryCity");
    this.colState = page.locator("td.PrimaryState");
    this.colLifetimeRank = page.locator("td.CurrentTitle");
    this.colPaidRank = page.locator("td.PaidTitle");
    this.colStatus = page.locator("td.StatusD");
    this.colActive = page.locator("td.Active");
    this.colPhone = page.locator("td.Phone");
    this.colEmail = page.locator("td.Email");
    this.colActiveAutoship = page.locator("td.ActiveAutoship");
  }

  // ✅ Verificar modal visible
  async verifyModalVisible() {
    // Esperar el título específico del modal
    await expect(this.modalTitle).toBeVisible({ timeout: 30000 });
    await expect(this.modalTitle).toContainText("Search Results");

    // Verificar que la tabla también está visible
    await expect(this.table).toBeVisible({ timeout: 15000 });

    console.log("✅ Modal de resultados visible");
  }

  // ✅ Verificar distribuidor en resultados
  async verifyDistributorInResults(brandPartnerId: string) {
    await expect(
      this.colBrandPartnerId.filter({ hasText: brandPartnerId }),
    ).toBeVisible();
    console.log(`✅ Distribuidor ${brandPartnerId} encontrado`);
  }

  // ✅ Verificar datos completos del distribuidor
  async verifyDistributorData(data: {
    brandPartnerId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: string;
    market?: string;
    accountType?: string;
  }) {
    await expect(
      this.colBrandPartnerId.filter({ hasText: data.brandPartnerId }),
    ).toBeVisible();

    if (data.firstName)
      await expect(this.colFirstName).toContainText(data.firstName);
    if (data.lastName)
      await expect(this.colLastName).toContainText(data.lastName);
    if (data.email) await expect(this.colEmail).toContainText(data.email);
    if (data.status) await expect(this.colStatus).toContainText(data.status);
    if (data.market) await expect(this.colMarket).toContainText(data.market);
    if (data.accountType)
      await expect(this.colAccountType).toContainText(data.accountType);

    console.log(`✅ Datos del distribuidor verificados`);
  }

  // ✅ Verificar cantidad de resultados
  async verifyResultsCount(expected: string) {
    await expect(this.tableInfo).toContainText(expected);
    console.log(`✅ Resultados: ${expected}`);
  }

  // ✅ Clic en Enroll → abre nueva pestaña
  async clickEnroll(): Promise<Page> {
    console.log("🔄 Haciendo clic en Enroll...");
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.btnEnroll.click(),
    ]);
    await newPage.waitForLoadState("networkidle", { timeout: 30000 });
    console.log(`✅ Nueva pestaña: ${newPage.url()}`);
    return newPage;
  }

  // ✅ Clic en Order → abre nueva pestaña
  async clickOrder(): Promise<Page> {
    console.log("🔄 Haciendo clic en Order...");
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.btnOrder.click(),
    ]);
    await newPage.waitForLoadState("networkidle", { timeout: 30000 });
    console.log(`✅ Nueva pestaña: ${newPage.url()}`);
    return newPage;
  }

  // ✅ Clic en BackOffice → abre nueva pestaña
  async clickBackOffice(): Promise<Page> {
    console.log("🔄 Haciendo clic en BackOffice...");
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.btnBackOffice.click(),
    ]);
    await newPage.waitForLoadState("networkidle", { timeout: 30000 });
    console.log(`✅ Nueva pestaña: ${newPage.url()}`);
    return newPage;
  }

  // ✅ Cerrar modal
  async closeModal() {
    await this.btnClose.click();
    await expect(this.modal).not.toBeVisible({ timeout: 5000 });
    console.log("✅ Modal cerrado");
  }
}
