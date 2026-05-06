import { Page, Locator, expect } from "@playwright/test";

export interface LinkInfo {
  url: string;
  text: string;
  status: number;
  ok: boolean;
}

export class VirtualOfficePage {
  readonly page: Page;

  // Modal de bienvenida
  readonly welcomeModal: Locator;
  readonly btnDoNotShowAgain: Locator;

  // Contenedor principal
  readonly mainContainer: Locator;

  // Detectores de error (los agregamos explícitamente)
  readonly errorMessageText: Locator;
  readonly errorContainer: Locator;
  private readonly errorPatterns: string[];
  private readonly excludeTags: string[]; // etiquetas a ignorar

  // Selectores para excluir (enlaces que no queremos verificar)
  private readonly excludePatterns: RegExp[] = [
    /^javascript:/i,
    /^#$/,
    /^mailto:/i,
    /^tel:/i,
    /\.pdf$/i,
    /\.zip$/i,
    /logout/i,
    /signout/i,
  ];

  constructor(page: Page) {
    this.page = page;

    // Modal de bienvenida
    this.welcomeModal = page.locator(
      "#BodyPlaceHolder_ucServiceAlert_modalAlert",
    );
    this.btnDoNotShowAgain = page.locator(
      "#BodyPlaceHolder_ucServiceAlert_btnConfirm",
    );

    // Contenedor principal del VO
    this.mainContainer = page.locator("#mainMasterWrapper");

    // Inicializamos los detectores de error
    this.errorMessageText = page.locator(
      ":has-text('An error occurred while processing')",
    );
    this.errorContainer = page.locator(
      ".error-message, .alert-danger, .alert, .error",
    );
    this.errorPatterns = [
      "An error occurred while processing",
      "error occurred",
      "something went wrong",
      "lo sentimos",
      "ha ocurrido un error",
    ];
    this.excludeTags = ["SCRIPT", "STYLE", "HEAD", "META", "LINK", "NOSCRIPT"];
  }

  /**
   * Cierra el modal de bienvenida si aparece
   */
  async closeWelcomeModalIfExists() {
    const isModalVisible = await this.welcomeModal
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isModalVisible) {
      await this.btnDoNotShowAgain.click();
      await expect(this.welcomeModal).not.toBeVisible({ timeout: 5000 });
      console.log("✅ Modal de bienvenida cerrado");
    } else {
      console.log("ℹ️ No apareció modal de bienvenida");
    }
  }

  /**
   * Verifica que el Virtual Office está cargado
   */
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/office\.aseastage\.com/, {
      timeout: 30000,
    });
    await expect(this.mainContainer).toBeVisible({ timeout: 30000 });
    console.log("✅ Virtual Office cargado correctamente");
  }

  // ============================================================
  // DETECCIÓN DE ERRORES (SOLO ELEMENTOS VISIBLES Y NO SCRIPT)
  // ============================================================

  async isErrorPresent(): Promise<boolean> {
    await this.page.waitForTimeout(1000); // estabilizar

    // Selectores de elementos que típicamente son mensajes de error visibles
    const errorSelectors = [
      ".alert-danger", // usado en Resources
      ".alert.alert-danger",
      ".error-message",
      ".alert",
      '[class*="error"]',
      '[class*="alert"]',
    ];

    for (const selector of errorSelectors) {
      const elements = await this.page.$$(selector);
      for (const el of elements) {
        const isVisible = await el.isVisible().catch(() => false);
        if (isVisible) {
          // Opcional: verificar que no esté vacío
          const text = await el.textContent();
          if (text && text.trim().length > 0) {
            console.log(
              `❌ Error visible detectado: selector "${selector}" -> "${text.trim().substring(0, 100)}"`,
            );
            return true;
          }
        }
      }
    }
    return false;
  }
  /**
   * Método de depuración: muestra exactamente qué elementos (visibles u ocultos)
   * contienen texto de error y si son visibles. Excluye etiquetas técnicas.
   */
  async debugErrorLocation() {
    const elements = await this.page.$$eval(
      "*",
      (els: Element[], args: { patterns: string[]; excludeTags: string[] }) => {
        return els
          .map((el) => {
            const text = el.textContent?.toLowerCase() || "";
            const matches = args.patterns.some((p) =>
              text.includes(p.toLowerCase()),
            );
            if (!matches) return null;
            const style = window.getComputedStyle(el);
            const tagName = el.tagName;
            return {
              tag: tagName,
              className: el.className || "",
              id: el.id || "",
              textSnippet: el.textContent?.substring(0, 200) || "",
              visible:
                style.display !== "none" && style.visibility !== "hidden",
              excluded: args.excludeTags.includes(tagName),
            };
          })
          .filter((el) => el !== null);
      },
      { patterns: this.errorPatterns, excludeTags: this.excludeTags },
    );

    console.log("🔍 Elementos que contienen texto de error:");
    if (elements.length === 0) {
      console.log("   Ninguno");
    } else {
      console.table(elements);
    }
    return elements;
  }

  /**
   * Assert: No debe aparecer ningún mensaje de error visible.
   * Toma screenshot si falla y muestra debug de ubicación.
   */
  async assertNoErrorMessage() {
    const hasError = await this.isErrorPresent();
    if (hasError) {
      const timestamp = Date.now();
      const pageName = this.page.url().split("/").pop() || "page";
      const screenshotPath = `test-results/error-${pageName}-${timestamp}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot del error guardado en: ${screenshotPath}`);
      throw new Error(
        `❌ Se encontró un mensaje de error visible (clase alert/error) en ${this.page.url()}. Revisa el screenshot.`,
      );
    }
    console.log(`✅ Sin errores de tipo alerta en ${this.page.url()}`);
  }
  // ============================================================
  // NAVEGACIÓN POR SECCIONES
  // ============================================================

  /**
   * Navega a una sección del menú lateral.
   */
  async navigateToSection(sectionName: string) {
    const link = this.page
      .locator(
        `#mainMenu ul.main-menu-content li.nav-item a:has-text("${sectionName}")`,
      )
      .first();
    await link.waitFor({ state: "visible", timeout: 10000 });
    await link.click();
    await this.page.waitForLoadState("networkidle", { timeout: 60000 });
    await this.assertNoErrorMessage();
    console.log(`✅ Sección "${sectionName}" cargada correctamente`);
  }

  /**
   * Navega a una sección del header superior.
   */
  async navigateToHeaderSection(sectionName: string) {
    const link = this.page
      .locator(`#divContainerCustomer a:has-text("${sectionName}")`)
      .first();
    await link.waitFor({ state: "visible", timeout: 10000 });
    await link.click();
    await this.page.waitForLoadState("networkidle", { timeout: 60000 });
    await this.assertNoErrorMessage();
    console.log(`✅ Sección "${sectionName}" cargada correctamente`);
  }

  // ============================================================
  // MÉTODOS PARA VERIFICACIÓN DE ENLACES (existentes)
  // ============================================================

  async extractAllNavigationLinks(): Promise<
    Omit<LinkInfo, "status" | "ok">[]
  > {
    const links = await this.page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      return anchors.map((anchor) => ({
        url: anchor.getAttribute("href") || "",
        text:
          anchor.textContent?.trim() ||
          anchor.getAttribute("aria-label") ||
          anchor.getAttribute("title") ||
          "Sin texto",
      }));
    });

    const filteredLinks = links.filter((link) => {
      if (!link.url || link.url === "") return false;
      for (const pattern of this.excludePatterns) {
        if (pattern.test(link.url)) return false;
      }
      return true;
    });

    console.log(`📎 Total enlaces encontrados: ${links.length}`);
    console.log(`📎 Enlaces a verificar: ${filteredLinks.length}`);
    return filteredLinks;
  }

  async extractSidebarLinks(): Promise<Omit<LinkInfo, "status" | "ok">[]> {
    const links = await this.page.evaluate(() => {
      const sidebar = document.querySelector("#mainMenu ul.main-menu-content");
      if (!sidebar) return [];
      const anchors = Array.from(sidebar.querySelectorAll("a[href]"));
      return anchors.map((anchor) => ({
        url: anchor.getAttribute("href") || "",
        text:
          anchor.textContent?.trim() ||
          anchor.getAttribute("title") ||
          "Sin texto",
      }));
    });
    return links.filter(
      (link) => link.url && !link.url.startsWith("javascript:"),
    );
  }

  async verifyLink(link: {
    url: string;
    text: string;
  }): Promise<{ ok: boolean; status: number }> {
    try {
      let urlToCheck = link.url;
      if (urlToCheck.startsWith("/")) {
        const baseUrl = new URL(this.page.url());
        urlToCheck = `${baseUrl.origin}${urlToCheck}`;
      }
      const currentOrigin = new URL(this.page.url()).origin;
      const isExternal = !urlToCheck.startsWith(currentOrigin);
      if (isExternal) {
        console.log(
          `   ⏭️ Enlace externo (omitido): "${link.text}" -> ${urlToCheck}`,
        );
        return { ok: true, status: 0 };
      }
      const response = await this.page.request.get(urlToCheck, {
        maxRedirects: 0,
        timeout: 10000,
      });
      const status = response.status();
      const ok = status >= 200 && status < 400;
      if (ok) {
        console.log(`   ✅ OK (${status}): "${link.text}"`);
      } else {
        console.log(`   ❌ ROTO (${status}): "${link.text}" -> ${urlToCheck}`);
      }
      return { ok, status };
    } catch (error) {
      console.log(`   ❌ ERROR: "${link.text}" -> ${link.url}`);
      return { ok: false, status: 0 };
    }
  }

  async verifyAllLinks(): Promise<{
    total: number;
    broken: string[];
    checked: number;
  }> {
    const links = await this.extractAllNavigationLinks();
    const broken: string[] = [];
    console.log(`\n🔍 Verificando ${links.length} enlaces...\n`);
    const batchSize = 5;
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((link) => this.verifyLink(link)),
      );
      results.forEach((result, idx) => {
        if (!result.ok) {
          broken.push(
            `${links[idx].text} -> ${links[idx].url} (Status: ${result.status || "Error"})`,
          );
        }
      });
      await this.page.waitForTimeout(500);
    }
    console.log(`\n📊 RESULTADOS:`);
    console.log(`   Total verificados: ${links.length}`);
    console.log(`   Enlaces rotos: ${broken.length}`);
    if (broken.length > 0) {
      console.log(`\n❌ ENLACES ROTOS:`);
      broken.forEach((b) => console.log(`   - ${b}`));
    }
    return {
      total: links.length,
      broken,
      checked: links.length - broken.length,
    };
  }

  async verifySidebarLinks(): Promise<{ broken: string[]; total: number }> {
    const links = await this.extractSidebarLinks();
    const broken: string[] = [];
    console.log(
      `\n🔍 Verificando ${links.length} enlaces del menú lateral...\n`,
    );
    for (const link of links) {
      const result = await this.verifyLink(link);
      if (!result.ok) {
        broken.push(`${link.text} -> ${link.url}`);
      }
      await this.page.waitForTimeout(200);
    }
    console.log(
      `\n📊 Menú lateral: ${links.length - broken.length} OK, ${broken.length} ROTOS`,
    );
    return { broken, total: links.length };
  }
}
