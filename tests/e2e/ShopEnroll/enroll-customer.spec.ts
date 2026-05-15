import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import { CartModalPage } from "../../pages/CartModalPage";
import { InfoPage } from "../../pages/InfoPage";
import { EnrollCheckoutPage } from "../../pages/EnrollAssociate/EnrollCheckoutPage";
import { EnrollCompletePage } from "../../pages/EnrollAssociate/EnrollCompletePage";
import { generateEnrollData } from "../../fixtures/enrollData";
import { userInfo, userInfoLive } from "../../fixtures/userData";
import { products } from "../../fixtures/productData";
import { users } from "../../fixtures/credentials";
import { SubscriptionPage } from "../../pages/SuscriptionPage";

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

test.describe("Enrolamiento de Customer", () => {
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

  test("Flujo completo: Customer", async ({ page }) => {
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartModalPage = new CartModalPage(page);
    const subscriptionPage = new SubscriptionPage(page);
    const infoPage = new InfoPage(page);
    const enrollCheckout = new EnrollCheckoutPage(page);
    const enrollComplete = new EnrollCompletePage(page);

    const enrollData = generateEnrollData();
    console.log(` Email generado: ${enrollData.email}`);
    console.log(` Username: ${enrollData.username}`);

    // PASO 1: Ir al shop y seleccionar mercado
    await test.step("Seleccionar mercado y continuar al shop", async () => {
      await loginPage.gotoByEnv(config.env as "stage" | "live", config.voPort);
      await loginPage.btnShopHere.click();
      await expect(page).toHaveURL(/\/products/);
    });

    // PASO 2: Seleccionar producto de orders
    await test.step("Seleccionar producto de orders", async () => {
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.todayOrder.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
      console.log(`Producto seleccionado: ${products.todayOrder.name}`);
    });

    // PASO 3: Agregar como suscripción al carrito
    await test.step("Agregar producto como today orders", async () => {
      await productDetailPage.selectPurchaseType("cart");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // PASO 4: Verificar modal y proceder al checkout
    await test.step("Verificar modal del carrito y proceder", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInCart(products.todayOrder.name);
      await cartModalPage.proceedToSuscriptionPage();
    });

    // PASO 5: Saltar la pagina de  suscripción
    await test.step("Saltar página de suscripción", async () => {
      await subscriptionPage.clickContinueToCheckout();
    });

    // PASO 5: Página Info — llenar todos los campos (usuario nuevo, sin datos precargados)
    await test.step("Llenar información del nuevo usuario", async () => {
      await infoPage.verifyPageLoaded();

      await infoPage.fillBasicInfo({
        email: enrollData.email,
        firstName: enrollData.firstName,
        lastName: enrollData.lastName,
        phone: enrollData.phone,
      });

      await infoPage.fillShippingAddress(config.info.address);
      await infoPage.saveAddress();
      await infoPage.selectOrderShipping(config.info.shipping.order);
      await infoPage.continueToCheckout();
    });

    // PASO 6: Checkout con referido por Sponsor ID
    let totals: { orderTotal: string; subscriptionTotal: string };
    await test.step("Completar checkout con referido", async () => {
      totals = await enrollCheckout.completeCCheckout(
        config.info.card,
        {
          username: enrollData.username,
          password: enrollData.password,
        },
        {
          type: "none",
          //sponsorId: distributor.brandPartnerId,
        },
      );
    });

    // PASO 7: Verificar confirmación
    await test.step("Verificar confirmación del enrolamiento", async () => {
      await enrollComplete.verifyCompleteEnrollmentC(
        enrollData.firstName,
        totals,
      );
    });
  });
});
