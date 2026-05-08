import { test, expect, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { UserMenuPage } from "../../pages/UserMenuPage";
import { VirtualOfficePage } from "../../pages/VirtualOffice/VirtualOfficePage";
import { users } from "../../fixtures/credentials";

// Definir tipos para metadata
interface ProjectMetadata {
  env?: string;
  voPort?: string;
}

interface TestConfig {
  env: "stage" | "live";
  voPort: string | undefined;
  user: { username: string; password: string };
}

test.describe("Virtual Office - Verificación de links", () => {
  // Helper para obtener configuración desde la metadata del proyecto
  function getConfig(
    projectName: string,
    metadata?: ProjectMetadata,
  ): TestConfig {
    const env =
      metadata?.env === "stage" || metadata?.env === "live"
        ? (metadata.env as "stage" | "live")
        : projectName === "stage"
          ? "stage"
          : "live";

    const voPort =
      metadata?.voPort !== undefined
        ? metadata.voPort
        : projectName === "live-port-1"
          ? "10000"
          : projectName === "live-port-2"
            ? "10001"
            : undefined;

    const user = env === "stage" ? users.valid : users.validLive;

    console.log(`📦 Configuración - Proyecto: ${projectName}`);
    console.log(`   Entorno: ${env}`);
    console.log(`   Puerto VO: ${voPort || "ninguno"}`);

    return { env, voPort, user };
  }

  test("Todos los enlaces del VO deben funcionar correctamente", async ({
    page,
  }) => {
    // Obtener configuración desde metadata del proyecto
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    // PASO 1: Login en Shop (con soporte multi-entorno)
    await test.step("Login en Shop", async () => {
      await loginPage.gotoByEnv(config.env, config.voPort);
      await loginPage.login(config.user.username, config.user.password);
      await loginPage.verifyLoginSuccess(config.user.username);
      console.log("✅ Login exitoso");
    });

    // PASO 2: Ir al Virtual Office (con soporte de puerto)
    let voPage: Page;
    await test.step("Abrir Virtual Office", async () => {
      voPage = await userMenu.goToVirtualOffice(config.voPort);
      console.log("✅ Virtual Office abierto");
    });

    // PASO 3: Verificar enlaces del VO
    await test.step("Verificar enlaces del Virtual Office", async () => {
      const vo = new VirtualOfficePage(voPage);
      await vo.closeWelcomeModalIfExists();
      await vo.verifyPageLoaded();

      try {
        const result = await vo.verifyAllLinks();
        expect(result.broken).toHaveLength(0);
        console.log(`✅ ${result.checked} enlaces verificados, todos OK`);
      } catch (error: any) {
        await voPage
          .screenshot({ path: "test-results/vo-page-closed.png" })
          .catch(() => {});
        throw new Error(
          `La página del VO se cerró durante la verificación. URL: ${voPage.url()}. Error: ${error.message}`,
        );
      }
    });
  });

  test("Verificar específicamente los enlaces del menú lateral", async ({
    page,
  }) => {
    // Obtener configuración desde metadata del proyecto
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    await test.step("Login en Shop", async () => {
      await loginPage.gotoByEnv(config.env, config.voPort);
      await loginPage.login(config.user.username, config.user.password);
      await loginPage.verifyLoginSuccess(config.user.username);
      console.log("✅ Login exitoso");
    });

    const voPage = await userMenu.goToVirtualOffice(config.voPort);
    const vo = new VirtualOfficePage(voPage);

    await vo.closeWelcomeModalIfExists();
    await vo.verifyPageLoaded();

    const result = await vo.verifySidebarLinks();

    expect(
      result.broken,
      `Enlaces rotos en el menú lateral: ${result.broken.length}`,
    ).toHaveLength(0);

    console.log(
      `✅ Menú lateral: ${result.total} enlaces verificados, todos OK`,
    );
  });
});
