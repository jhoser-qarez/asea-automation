import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { UserMenuPage } from "../../pages/UserMenuPage";
import { VirtualOfficePage } from "../../pages/VirtualOffice/VirtualOfficePage";
import { users } from "../../fixtures/credentials";

// Definir tipos para metadata y configuración
interface ProjectMetadata {
  env?: string;
  voPort?: string;
}

interface TestConfig {
  env: string;
  voPort: string | undefined;
  user: { username: string; password: string };
}

test.describe("Virtual Office - Carga correcta de secciones", () => {
  // Helper para obtener configuración desde la metadata del proyecto
  function getConfig(
    projectName: string,
    metadata?: ProjectMetadata,
  ): TestConfig {
    const env =
      metadata?.env === "stage" || metadata?.env === "live"
        ? metadata.env
        : projectName === "stage"
          ? "stage"
          : "live";

    const voPort =
      metadata?.voPort !== undefined
        ? metadata.voPort
        : projectName === "live-port-1"
          ? "10001"
          : projectName === "live-port-2"
            ? "10002"
            : undefined;

    const user = env === "stage" ? users.valid : users.validLive;

    console.log(`    Configuración - Proyecto: ${projectName}`);
    console.log(`   Entorno: ${env}`);
    console.log(`   Puerto VO: ${voPort || "ninguno"}`);

    return { env, voPort, user };
  }

  test("Todas las secciones del menú lateral deben cargar sin errores ", async ({
    page,
  }) => {
    test.setTimeout(300_000); // 5 min

    // ✅ Obtener configuración desde metadata del proyecto
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    await loginPage.gotoByEnv(config.env as "stage" | "live");
    await loginPage.login(config.user.username, config.user.password);
    await loginPage.verifyLoginSuccess(config.user.username);

    // Abrir VO
    const voPage = await userMenu.goToVirtualOffice(config.voPort);
    const vo = new VirtualOfficePage(voPage);
    await vo.closePromoBannerIfExists();
    await vo.closeWelcomeModalIfExists();
    await vo.closePromoBannerIfExists();

    const sections = [
      "Resources",
      "Support",
      "Event Calendar",
      "Reports",
      "Courses",
      "Recognition",
      "My Account",
    ];

    const failedSections: string[] = [];

    for (const section of sections) {
      await test.step(`Navegar a "${section}"`, async () => {
        try {
          await vo.navigateToSection(section);
        } catch (error) {
          console.log(`⚠️ Falló la sección "${section}"`);
          await voPage
            .screenshot({
              path: `test-results/failed-${section}.png`,
              fullPage: true,
            })
            .catch(() => {});
          console.log(`   URL: ${voPage.url()}`);
          const title = await voPage.title().catch(() => "sin título");
          console.log(`   Título: ${title}`);
          failedSections.push(section);
          // Reset al home del VO
          await voPage
            .goto(
              voPage.url().split("/Private/")[0] +
                "/Private/overview/Home.aspx",
              { waitUntil: "domcontentloaded", timeout: 30000 },
            )
            .catch(() => {});
          await vo.closePromoBannerIfExists();
        }
      });
    }

    if (failedSections.length > 0) {
      console.log(`\n❌ Secciones con error: ${failedSections.join(", ")}`);
      throw new Error(
        `Las siguientes secciones presentaron errores de carga: ${failedSections.join(", ")}`,
      );
    } else {
      console.log("✅ Todas las secciones cargaron correctamente");
    }
  });

  test("Secciones del header superior deben cargar sin errores ", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    // ✅ Obtener configuración desde metadata del proyecto
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    await loginPage.gotoByEnv(config.env as "stage" | "live");
    await loginPage.login(config.user.username, config.user.password);
    await loginPage.verifyLoginSuccess(config.user.username);

    const voPage = await userMenu.goToVirtualOffice(config.voPort);
    const vo = new VirtualOfficePage(voPage);
    await vo.closePromoBannerIfExists();
    await vo.closeWelcomeModalIfExists();
    await vo.closePromoBannerIfExists();

    const headerSections = ["Dashboard", "My Site", "Order History"];
    const failedSections: string[] = [];

    for (const section of headerSections) {
      await test.step(`Navegar a "${section}"`, async () => {
        try {
          await vo.navigateToHeaderSection(section);
        } catch (error) {
          console.log(`⚠️ Falló la sección "${section}"`);
          await voPage
            .screenshot({
              path: `test-results/failed-${section}.png`,
              fullPage: true,
            })
            .catch(() => {});
          console.log(`   URL: ${voPage.url()}`);
          const title = await voPage.title().catch(() => "sin título");
          console.log(`   Título: ${title}`);
          failedSections.push(section);
          await voPage
            .goto(
              voPage.url().split("/Private/")[0] +
                "/Private/overview/Home.aspx",
              { waitUntil: "domcontentloaded", timeout: 30000 },
            )
            .catch(() => {});
          await vo.closePromoBannerIfExists();
        }
      });
    }

    if (failedSections.length > 0) {
      console.log(`\n❌ Secciones con error: ${failedSections.join(", ")}`);
      throw new Error(
        `Las siguientes secciones del header presentaron errores: ${failedSections.join(", ")}`,
      );
    } else {
      console.log("✅ Todas las secciones del header cargaron correctamente");
    }
  });
});
