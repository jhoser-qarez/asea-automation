import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { WillCallPage } from "../pages/WillCall/WillCallPage";
import { ProductsPage } from "../pages/ProductsPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartModalPage } from "../pages/CartModalPage";
import { InfoPage } from "../pages/InfoPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CompletePage } from "../pages/CompletePage";
import { users } from "../fixtures/credentials";
import { products } from "../fixtures/productData";
import { userInfo, userInfoLive } from "../fixtures/userData";

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

test.describe("Orden con Will Call - Dist Logueado USA", () => {
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
  test("Flujo completo: mismo producto en Order y Suscripción con Will Call", async ({
    page,
  }) => {
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);
    const loginPage = new LoginPage(page);
    const willCallPage = new WillCallPage(page);
    const productsPage = new ProductsPage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartModalPage = new CartModalPage(page);
    const infoPage = new InfoPage(page);
    const checkoutPage = new CheckoutPage(page);
    const completePage = new CompletePage(page);

    // 🔐 PASO 1: Login
    await test.step("Login", async () => {
      await loginPage.gotoByEnv(config.env as "stage" | "live", config.voPort);
      await loginPage.login(config.user.username, config.user.password);
      await loginPage.verifyLoginSuccess(config.user.username);
    });

    // 🚚 PASO 2: Seleccionar Will Call desde el header
    await test.step("Seleccionar Utah Will Call Center", async () => {
      await willCallPage.selectUtahWillCall();
    });

    // 🛍️ PASO 3: Seleccionar producto
    await test.step("Seleccionar producto", async () => {
      await productsPage.gotoByEnv(
        config.env as "stage" | "live",
        config.voPort,
      );
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.default.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

    // 🛒 PASO 4: Agregar a Today's Order
    await test.step("Agregar a Today's Order", async () => {
      await productDetailPage.selectPurchaseType("cart");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // 🧾 PASO 5: Verificar modal y cerrar
    await test.step("Verificar modal Today's Order y cerrar", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInCart(products.default.name);
      await cartModalPage.closeModal();
    });

    // 🔄 PASO 6: Agregar a Suscripción
    await test.step("Agregar a Suscripción", async () => {
      await expect(page).toHaveURL(/\/products\/\d+/);
      await productDetailPage.selectPurchaseType("subscription");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // 🧾 PASO 7: Verificar modal con ambas secciones → Checkout
    await test.step("Verificar modal con Order y Suscripción", async () => {
      await cartModalPage.verifyBothSections(products.default.name);
      await cartModalPage.proceedToCheckout();
    });

    // 📋 PASO 8: Página Info — solo basic info, sin address ni shipping
    await test.step("Verificar info y continuar (Will Call)", async () => {
      await infoPage.verifyPageLoaded();
      await willCallPage.verifyWillCallBanner();
      await infoPage.completeInfoPageWillCall(config.info.basic);
    });

    // 💳 PASO 9: Checkout con billing address obligatorio
    let totals: { orderTotal: string; subscriptionTotal: string };
    await test.step("Completar checkout con billing address (Will Call)", async () => {
      totals = await checkoutPage.completeCheckoutWillCall(
        config.info.card,
        config.info.address,
      );
    });

    // 🎉 PASO 10: Confirmación
    await test.step("Verificar confirmación de orden", async () => {
      await completePage.verifyCompleteOrder(
        config.info.basic.firstName,
        totals,
      );
    });
  });

  test("Flujo completo: productos diferentes en Order y Suscripción con Will Call", async ({
    page,
  }) => {
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);
    const loginPage = new LoginPage(page);
    const willCallPage = new WillCallPage(page);
    const productsPage = new ProductsPage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartModalPage = new CartModalPage(page);
    const infoPage = new InfoPage(page);
    const checkoutPage = new CheckoutPage(page);
    const completePage = new CompletePage(page);

    // 🔐 PASO 1: Login
    await test.step("Login", async () => {
      await loginPage.gotoByEnv(config.env as "stage" | "live", config.voPort);
      await loginPage.login(config.user.username, config.user.password);
      await loginPage.verifyLoginSuccess(config.user.username);
    });

    // 🚚 PASO 2: Seleccionar Will Call desde el header
    await test.step("Seleccionar Utah Will Call Center", async () => {
      await willCallPage.selectUtahWillCall();
    });

    // 🛍️ PASO 3: Seleccionar producto para Today's Order
    await test.step("Seleccionar producto para Today's Order", async () => {
      await productsPage.gotoByEnv(
        config.env as "stage" | "live",
        config.voPort,
      );
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.todayOrder.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

    // 🛒 PASO 4: Agregar a Today's Order
    await test.step("Agregar a Today's Order", async () => {
      await productDetailPage.selectPurchaseType("cart");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // 🧾 PASO 5: Verificar modal y continuar comprando
    await test.step("Verificar modal y continuar comprando", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInCart(products.todayOrder.name);
      console.log(`✅ ${products.todayOrder.name} en Today's Order`);
      await cartModalPage.continueShopping();
      await expect(page).toHaveURL(/\/products/);
    });

    // 🛍️ PASO 6: Seleccionar producto para Suscripción
    await test.step("Seleccionar producto para Suscripción", async () => {
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.subscription.name);
      console.log(`✅ ${products.subscription.name} en Suscription`);
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

    // 🔄 PASO 7: Agregar a Suscripción
    await test.step("Agregar a Suscripción", async () => {
      await productDetailPage.selectPurchaseType("subscription");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // 🧾 PASO 8: Verificar modal con ambos productos → Checkout
    await test.step("Verificar modal con ambos productos", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInCart(products.todayOrder.name);
      await cartModalPage.verifyProductInSubscription(
        products.subscription.name,
      );
      console.log("✅ Ambos productos en el carrito");
      await cartModalPage.proceedToCheckout();
    });

    // 📋 PASO 9: Página Info — solo basic info, sin address ni shipping
    await test.step("Verificar info y continuar (Will Call)", async () => {
      await infoPage.verifyPageLoaded();
      await willCallPage.verifyWillCallBanner();
      await infoPage.completeInfoPageWillCall(config.info.basic);
    });

    // 💳 PASO 10: Checkout con billing address obligatorio
    let totals: { orderTotal: string; subscriptionTotal: string };
    await test.step("Completar checkout con billing address (Will Call)", async () => {
      totals = await checkoutPage.completeCheckoutWillCall(
        config.info.card,
        config.info.address,
      );
    });

    // 🎉 PASO 11: Confirmación
    await test.step("Verificar confirmación de orden", async () => {
      await completePage.verifyCompleteOrder(
        config.info.basic.firstName,
        totals,
      );
    });
  });
});
