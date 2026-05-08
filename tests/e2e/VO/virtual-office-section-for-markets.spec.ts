import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { UserMenuPage } from "../../pages/UserMenuPage";
import { VirtualOfficePage } from "../../pages/VirtualOffice/VirtualOfficePage";
import { VOHeaderPage } from "../../pages/VirtualOffice/VOHeaderPage";
import { users } from "../../fixtures/credentials";

interface ProjectMetadata {
  env?: string;
  voPort?: string;
}

interface FailedSection {
  name: string;
  url: string;
  error: string;
}

test.describe("Virtual Office - Cambio de mercado y carga de páginas", () => {
  function getConfig(
    projectName: string,
    metadata?: ProjectMetadata,
  ): {
    env: "stage" | "live";
    voPort: string | undefined;
    user: { username: string; password: string };
  } {
    const env =
      metadata?.env === "stage" || metadata?.env === "live"
        ? (metadata.env as "stage" | "live")
        : projectName === "stage"
          ? "stage"
          : "live";
    const voPort = metadata?.voPort;
    const user = env === "stage" ? users.valid : users.validLive;
    return { env, voPort, user };
  }

  test("Recorrer todos los mercados disponibles y verificar secciones", async ({
    page,
  }) => {
    test.setTimeout(3_600_000); // 1 hora

    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    // Login
    await loginPage.gotoByEnv(config.env);
    await loginPage.login(config.user.username, config.user.password);
    await loginPage.verifyLoginSuccess(config.user.username);

    // Abrir VO
    const voPage = await userMenu.goToVirtualOffice(config.voPort);
    const vo = new VirtualOfficePage(voPage);
    const header = new VOHeaderPage(voPage);

    await vo.closePromoBannerIfExists();
    await vo.closeWelcomeModalIfExists();
    await header.verifyHeaderVisible();

    // Obtener TODOS los mercados disponibles
    console.log("\n🔍 Obteniendo lista de mercados disponibles...");
    const allMarkets = await header.getAllMarkets();

    if (allMarkets.length === 0) {
      throw new Error("No se encontraron mercados para probar");
    }

    console.log(`\n🚀 Iniciando prueba de ${allMarkets.length} mercados...\n`);

    // Estructura para guardar resultados detallados
    const marketResults: {
      market: string;
      failedSections: FailedSection[];
      success: boolean;
    }[] = [];

    let currentIndex = 0;

    for (const marketName of allMarkets) {
      currentIndex++;
      const failedSections: FailedSection[] = [];

      await test.step(`[${currentIndex}/${allMarkets.length}] Probar mercado: ${marketName}`, async () => {
        try {
          console.log(`\n🌍 === Probando mercado: ${marketName} ===`);

          // Cambiar al mercado
          await header.changeToMarket(marketName);

          // Esperar estabilización
          await voPage.waitForLoadState("networkidle", { timeout: 30000 });
          await vo.closePromoBannerIfExists();
          await vo.closeWelcomeModalIfExists();

          // Verificar Home
          await vo.verifyPageLoaded();
          await vo.assertNoErrorMessage();
          console.log(`   ✅ Home del mercado "${marketName}" OK`);

          await header.verifyCurrentMarket(marketName);

          // Extraer secciones
          const headerLinks = await vo.extractHeaderLinks();
          const sidebarLinks = await vo.extractSidebarLinks();

          // ✅ COMBINAR Y ELIMINAR DUPLICADOS (basado en URL)
          const allLinks = [...headerLinks, ...sidebarLinks];
          const uniqueSections: { url: string; text: string }[] = [];
          const seenUrls = new Set<string>();

          for (const link of allLinks) {
            // Saltar "Home" porque ya lo verificamos al inicio
            if (link.text === "Home" || link.url.includes("/Home.aspx")) {
              continue;
            }
            // Eliminar duplicados por URL
            if (!seenUrls.has(link.url)) {
              seenUrls.add(link.url);
              uniqueSections.push(link);
            }
          }

          const duplicateCount = allLinks.length - uniqueSections.length;

          if (uniqueSections.length === 0) {
            console.log(`⚠️ No se encontraron secciones para "${marketName}"`);
          } else {
            console.log(
              `🗂️ Verificando ${uniqueSections.length} secciones únicas (${headerLinks.length} header + ${sidebarLinks.length} sidebar, ${duplicateCount} duplicados eliminados) para "${marketName}"...`,
            );

            // ✅ Verificar cada sección individualmente
            for (const link of uniqueSections) {
              try {
                await vo.navigateToSectionByUrl(link.url, link.text);
                console.log(`   ✅ ${link.text} OK`);
              } catch (error) {
                const errorMsg =
                  error instanceof Error ? error.message : String(error);
                console.log(
                  `   ❌ ${link.text} falló: ${errorMsg.substring(0, 100)}`,
                );
                failedSections.push({
                  name: link.text,
                  url: link.url,
                  error: errorMsg,
                });
                // ✅ Continuamos con la siguiente sección
              }
            }
          }

          // Mostrar resumen del mercado
          if (failedSections.length > 0) {
            console.log(
              `\n⚠️ Mercado "${marketName}" - ${failedSections.length} sección(es) fallida(s):`,
            );
            failedSections.forEach((fs) => {
              console.log(`   - ${fs.name}: ${fs.error.substring(0, 80)}`);
            });
          } else {
            console.log(
              `✅ Mercado "${marketName}" verificado completamente (${uniqueSections.length} secciones OK)`,
            );
          }

          marketResults.push({
            market: marketName,
            failedSections: [...failedSections],
            success: failedSections.length === 0,
          });
        } catch (error) {
          // Error a nivel de mercado
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.log(
            `❌ Falló el mercado "${marketName}" a nivel general: ${errorMsg.substring(0, 100)}`,
          );

          await voPage
            .screenshot({
              path: `test-results/failed-market-${marketName.replace(/[^a-zA-Z0-9]/g, "_")}.png`,
              fullPage: true,
            })
            .catch(() => {});

          marketResults.push({
            market: marketName,
            failedSections: [{ name: "GENERAL", url: "", error: errorMsg }],
            success: false,
          });

          // Intentar recuperar estado
          try {
            const currentUrl = voPage.url();
            await voPage.goto(
              currentUrl.split("/Private/")[0] + "/Private/overview/Home.aspx",
              { waitUntil: "domcontentloaded", timeout: 30000 },
            );
            await vo.closePromoBannerIfExists();
          } catch {
            console.log(
              `⚠️ No se pudo recuperar el estado tras el fallo en "${marketName}"`,
            );
          }
        }
      });
    }

    // ============================================================
    // REPORTE FINAL DETALLADO
    // ============================================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 REPORTE FINAL DE MERCADOS");
    console.log("=".repeat(60));

    const totalMarkets = marketResults.length;
    const successfulMarkets = marketResults.filter((r) => r.success).length;
    const failedMarkets = marketResults.filter((r) => !r.success);

    console.log(`\n📈 Resumen:`);
    console.log(`   Total mercados probados: ${totalMarkets}`);
    console.log(`   ✅ Exitosos: ${successfulMarkets}`);
    console.log(`   ❌ Fallidos: ${failedMarkets.length}`);

    // Mostrar mercados exitosos
    if (successfulMarkets > 0) {
      console.log(`\n✅ MERCADOS EXITOSOS (${successfulMarkets}):`);
      marketResults
        .filter((r) => r.success)
        .forEach((r) => console.log(`   - ${r.market}`));
    }

    // Mostrar mercados fallidos con detalle de secciones
    if (failedMarkets.length > 0) {
      console.log(`\n❌ MERCADOS FALLIDOS (${failedMarkets.length}):`);
      for (const result of failedMarkets) {
        console.log(`\n   📍 ${result.market}`);
        if (result.failedSections.length > 0) {
          console.log(`      Secciones fallidas:`);
          for (const fs of result.failedSections) {
            console.log(`      - ${fs.name}`);
            console.log(`        URL: ${fs.url}`);
            console.log(`        Error: ${fs.error.substring(0, 100)}`);
          }
        } else {
          console.log(`      Error general sin secciones específicas`);
        }
      }
    }

    // Guardar reporte en archivo
    const fs = require("fs");
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalMarkets,
        successful: successfulMarkets,
        failed: failedMarkets.length,
      },
      markets: marketResults,
    };
    fs.writeFileSync(
      "test-results/markets-report.json",
      JSON.stringify(report, null, 2),
    );
    console.log(
      "\n📁 Reporte detallado guardado en: test-results/markets-report.json",
    );

    // Si hay fallos, el test falla
    if (failedMarkets.length > 0) {
      throw new Error(
        `${failedMarkets.length} mercados presentaron errores. Revisa el reporte detallado en test-results/markets-report.json`,
      );
    } else {
      console.log("\n🎉 TODOS los mercados cargaron correctamente");
    }
  });

  // ============================================================
  // TEST 2: Verificar mercados agrupados por continente
  // ============================================================
  test("Verificar mercados agrupados por continente", async ({ page }) => {
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    await loginPage.gotoByEnv(config.env);
    await loginPage.login(config.user.username, config.user.password);
    await loginPage.verifyLoginSuccess(config.user.username);

    const voPage = await userMenu.goToVirtualOffice(config.voPort);
    const header = new VOHeaderPage(voPage);

    // Nota: no necesitamos VirtualOfficePage para este test
    await header.verifyHeaderVisible();

    const marketsByZone = await header.getMarketsByZone();

    console.log("\n📊 MERCADOS POR CONTINENTE:");
    console.log(`\n🌎 The Americas (${marketsByZone.americas.length}):`);
    marketsByZone.americas.forEach((m) => console.log(`   - ${m}`));
    console.log(`\n🌍 Europe (${marketsByZone.europe.length}):`);
    marketsByZone.europe.forEach((m) => console.log(`   - ${m}`));
    console.log(`\n🌏 Asia Pacific (${marketsByZone.asiaPacific.length}):`);
    marketsByZone.asiaPacific.forEach((m) => console.log(`   - ${m}`));

    const fs = require("fs");
    fs.writeFileSync(
      "test-results/markets-by-zone.json",
      JSON.stringify(marketsByZone, null, 2),
    );
    console.log("\n📁 Lista guardada en: test-results/markets-by-zone.json");
  });
});
