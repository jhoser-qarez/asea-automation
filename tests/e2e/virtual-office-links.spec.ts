import { test, expect, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { UserMenuPage } from "../pages/UserMenuPage";
import { VirtualOfficePage } from "../pages/VirtualOffice/VirtualOfficePage";
import { users } from "../fixtures/credentials";

test.describe("Virtual Office - Verificación de enlaces", () => {
  test("Todos los enlaces del VO deben funcionar correctamente", async ({
    page,
    context,
  }) => {
    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuPage(page);

    // PASO 1: Login en Shop
    await test.step("Login en Shop", async () => {
      await loginPage.goto();
      await loginPage.login(users.valid.username, users.valid.password);
      await loginPage.verifyLoginSuccess(users.valid.username);
      console.log("✅ Login exitoso");
    });

    // PASO 2: Ir al Virtual Office (abre nueva pestaña)
    let voPage: Page;
    await test.step("Abrir Virtual Office", async () => {
      voPage = await userMenu.goToVirtualOffice();
      console.log("✅ Virtual Office abierto");
    });

    // PASO 3: Verificar enlaces del VO
    await test.step("Verificar enlaces del Virtual Office", async () => {
      const vo = new VirtualOfficePage(voPage);
      await vo.closeWelcomeModalIfExists();
      await vo.verifyPageLoaded();

      // Ejecutar verificación con manejo de errores
      try {
        const result = await vo.verifyAllLinks();
        expect(result.broken).toHaveLength(0);
      } catch (error: any) {
        // Si la página se cierra, tomar screenshot y fallar con mensaje claro
        await voPage
          .screenshot({ path: "test-results/vo-page-closed.png" })
          .catch(() => {});
        throw new Error(
          `La página del VO se cerró durante la verificación. Última URL: ${voPage.url()}. Error: ${error.message}`,
        );
      }
    });
  });

  test("Verificar específicamente los enlaces del menú lateral", async ({
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
