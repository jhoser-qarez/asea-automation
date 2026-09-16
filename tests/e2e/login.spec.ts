import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ProjectMetadata, getConfig } from "../utils/testConfig";

test.describe("Login - ASEA Shop", () => {
  test("Login exitoso con credenciales válidas", async ({ page }) => {
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);
    const loginPage = new LoginPage(page);

    await test.step("Login", async () => {
      await loginPage.gotoByEnv(config.env as "stage" | "live", config.voPort);
      await loginPage.login(config.user.username, config.user.password);
      await loginPage.verifyLoginSuccess(config.user.username);
    });
  });
});
