import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import { CartModalPage } from "../../pages/CartModalPage";
import { InfoPage } from "../../pages/InfoPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { CompletePage } from "../../pages/CompletePage";
import { users } from "../../fixtures/credentials";
import { products } from "../../fixtures/productData";
import { userInfo, userInfoLive } from "../../fixtures/userData";

// Definir tipos para metadata y configuración
interface ProjectMetadata {
  env?: string;
  voPort?: string;
}

interface TestConfig {
  env: string;
  voPort: string | undefined;
  user: { username: string; password: string };
  info: typeof userInfo;
}

test.describe("Flujo de una compra con solo suscripcion para distribuidor logueado", () => {
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
    const info = env === "stage" ? userInfo : userInfoLive;

    console.log(`    Configuración - Proyecto: ${projectName}`);
    console.log(`   Entorno: ${env}`);
    console.log(`   Puerto VO: ${voPort || "ninguno"}`);

    return { env, voPort, user, info };
  }
  test("Carrito con solo producto de suscripcion- Mercado USA", async ({
    page,
  }) => {
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartModalPage = new CartModalPage(page);
    const infoPage = new InfoPage(page);
    const checkoutPage = new CheckoutPage(page);
    const completePage = new CompletePage(page);

    // PASO 1: Login
    await test.step("Login", async () => {
      await loginPage.gotoByEnv(config.env as "stage" | "live", config.voPort);
      await loginPage.login(config.user.username, config.user.password);
      await loginPage.verifyLoginSuccess(config.user.username);
    });

    // PASO 2: Ir a productos y seleccionar uno
    await test.step("Seleccionar producto", async () => {
      await productsPage.gotoByEnv(config.env as "stage" | "live", config.voPort);
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.default.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

    // PASO 3: Agregar al carrito
    await test.step("Agregar al carrito", async () => {
      await productDetailPage.addProductToCart("subscription", 1);
    });

    // PASO 4: Verificar modal y proceder al checkout
    await test.step("Verificar el producto que esté en el carrito", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInSubscription(products.default.name);
      await cartModalPage.proceedToCheckout();
    });

    // PASO 5: Página Info
    await test.step("Llenar info y shipping address", async () => {
      await infoPage.verifyPageLoaded();
      await infoPage.completeInfoPage(
        config.info.address,
        config.info.basic,
        //config.info.shipping.order,
        config.info.shipping.subscription,
      );
    });

    // PASO 6: Checkout
    let totals: { orderTotal: string; subscriptionTotal: string };
    await test.step("Completar checkout", async () => {
      totals = await checkoutPage.completeCheckoutOnlySuscriptionType(
        config.info.card,
      );
    });

    // PASO 7: Confirmación
    await test.step("Verificar confirmación de orden", async () => {
      await completePage.verifyCompleteSuscripcion(
        config.info.basic.firstName,
        totals,
      );
    });
  });
});
