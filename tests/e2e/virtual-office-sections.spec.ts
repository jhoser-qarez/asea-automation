// tests/e2e/virtual-office-sections.spec.ts
import { test, expect, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { UserMenuPage } from "../pages/UserMenuPage";
import { VirtualOfficePage } from "../pages/VirtualOffice/VirtualOfficePage";
import { users } from "../fixtures/credentials";

test.describe("Virtual Office - Carga correcta de secciones", () => {
  test("Todas las secciones del menú lateral deben cargar sin errores (continuar tras fallos)", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(users.valid.username, users.valid.password);
    await loginPage.verifyLoginSuccess(users.valid.username);

    // Abrir VO
    const voPage = await userMenu.goToVirtualOffice();
    const vo = new VirtualOfficePage(voPage);
    await vo.closeWelcomeModalIfExists();
    await vo.verifyPageLoaded();

    // Lista de secciones a probar
    const sections = [
      "Resources", // esta falla
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
          // Tomar screenshot de la página en el momento del error (si la página aún existe)
          await voPage
            .screenshot({
              path: `test-results/failed-${section}.png`,
              fullPage: true,
            })
            .catch(() => {});
          // Imprimir la URL actual
          console.log(`   URL: ${voPage.url()}`);
          // Imprimir el título de la página
          const title = await voPage.title().catch(() => "sin título");
          console.log(`   Título: ${title}`);
          failedSections.push(section);
        }
      });
    }

    // Al final, si hubo fallos, mostrar lista y fallar el test
    if (failedSections.length > 0) {
      console.log(`\n❌ Secciones con error: ${failedSections.join(", ")}`);
      throw new Error(
        `Las siguientes secciones presentaron errores de carga: ${failedSections.join(", ")}`,
      );
    } else {
      console.log("✅ Todas las secciones cargaron correctamente");
    }
  });

  test("Secciones del header superior deben cargar sin errores (continuar tras fallos)", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    await loginPage.goto();
    await loginPage.login(users.valid.username, users.valid.password);
    await loginPage.verifyLoginSuccess(users.valid.username);

    const voPage = await userMenu.goToVirtualOffice();
    const vo = new VirtualOfficePage(voPage);
    await vo.closeWelcomeModalIfExists();
    await vo.verifyPageLoaded();

    const headerSections = ["Dashboard", "My Site", "Order History"];
    const failedSections: string[] = [];

    for (const section of headerSections) {
      await test.step(`Navegar a "${section}"`, async () => {
        try {
          await vo.navigateToHeaderSection(section);
        } catch (error) {
          console.log(`⚠️ Falló la sección "${section}"`);
          // Tomar screenshot de la página en el momento del error (si la página aún existe)
          await voPage
            .screenshot({
              path: `test-results/failed-${section}.png`,
              fullPage: true,
            })
            .catch(() => {});
          // Imprimir la URL actual
          console.log(`   URL: ${voPage.url()}`);
          // Imprimir el título de la página
          const title = await voPage.title().catch(() => "sin título");
          console.log(`   Título: ${title}`);
          failedSections.push(section);
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
