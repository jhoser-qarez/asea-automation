import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { MarketSelectorPage } from "../../pages/MarketSelectorPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import { CartModalPage } from "../../pages/CartModalPage";
import { InfoPage } from "../../pages/InfoPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { CheckoutPageEuropean } from "../../pages/CheckoutPageEuropean";
import { CompletePage } from "../../pages/CompletePage";
import { userInfoLive } from "../../fixtures/userData";
import { getMarketsToRun } from "../../utils/marketFilter";
import { ProjectMetadata, getConfig } from "../../utils/testConfig";

for (const market of getMarketsToRun()) {
  test.describe(`Orden Solo Suscripción con Dist Logueado - ${market.marketName}`, () => {
    test(`Flujo completo: ${market.marketName}`, async ({ page }) => {
      const project = test.info().project;
      const config = getConfig(
        project.name,
        project.metadata as ProjectMetadata,
      );

      const loginPage = new LoginPage(page);
      const marketSelectorPage = new MarketSelectorPage(page);
      const productsPage = new ProductsPage(page);
      const productDetailPage = new ProductDetailPage(page);
      const cartModalPage = new CartModalPage(page, market.labels);
      const infoPage = new InfoPage(page, market.labels);
      const checkoutPage = new CheckoutPage(page, market.labels);
      const checkoutPageEU = new CheckoutPageEuropean(page, market.labels);
      const completePage = new CompletePage(page, market.labels);

      // PASO 1: Login
      // ⚠️ gotoByEnv/config.user (no goto()/users.valid a secas) — así el
      // spec respeta el proyecto con el que se corre (stage, live,
      // live-port-1/2), igual que los specs US.
      await test.step("Login", async () => {
        await loginPage.gotoByEnv(
          config.env as "stage" | "live",
          config.voPort,
        );
        await loginPage.login(config.user.username, config.user.password);
        await loginPage.verifyLoginSuccess(config.user.username);
      });

      // PASO 2: Cambiar mercado e idioma
      await test.step(`Cambiar a ${market.marketName}`, async () => {
        await marketSelectorPage.changeMarket(market.marketName);
      });

      // PASO 3: Seleccionar producto
      await test.step("Seleccionar producto", async () => {
        await productsPage.gotoByEnv(
          config.env as "stage" | "live",
          config.voPort,
        );
        await productsPage.verifyPageLoaded();
        await productsPage.selectProductByName(market.product.name);
        await expect(page).toHaveURL(/\/products\/\d+/);
      });

      // PASO 4: Agregar a Suscripción
      await test.step("Agregar al carrito como suscripción", async () => {
        await productDetailPage.addProductToCart("subscription", 1);
      });

      // PASO 5: Verificar modal y proceder
      await test.step("Verificar modal del carrito", async () => {
        await cartModalPage.verifyModalVisible();
        await cartModalPage.verifyProductInSubscription(market.product.name);
        await cartModalPage.proceedToCheckout();
      });

      // PASO 6: Página Info
      await test.step("Llenar información y dirección", async () => {
        await infoPage.verifyPageLoaded();
        // ⚠️ El basic info (email/nombre/apellido) que precarga esta pantalla
        // es el de la CUENTA logueada — confirmado corriendo el spec en stage
        // que el perfil real SIEMPRE es "Test US Account" / ppadilla2@peruslab.com
        // (el de userInfoLive), sin importar el entorno. config.info.basic
        // se probó y NO sirve: para el proyecto "stage" resuelve a userInfo,
        // cuyo email ("jhoserjuarez86952810@test.com") no es el que trae
        // realmente precargado la cuenta con la que loguea config.user en
        // stage. Por eso queda hardcoded a userInfoLive.basic en vez de
        // usar config.info — a diferencia del login (URL/puerto/credenciales),
        // que sí varía correctamente por entorno vía gotoByEnv/config.user.
        // market.address sí varía por mercado (es la dirección de envío, no
        // el perfil de la cuenta).
        // orderShipping/subscriptionShipping quedan en su default (1 = primera
        // opción detectada).
        await infoPage.completeInfoPage(market.address, userInfoLive.basic);
      });

      //  PASO 7: Checkout
      let totals: { orderTotal: string; subscriptionTotal: string } = {
        orderTotal: "",
        subscriptionTotal: "",
      };
      await test.step(`Checkout [${market.checkoutVariant}]`, async () => {
        if (market.checkoutVariant === "european") {
          totals = await checkoutPageEU.completeCheckoutEuropean(
            market.card,
            market.paymentMethod,
          );
        } else {
          totals = await checkoutPage.completeCheckoutOnlySuscriptionType(
            market.card,
          );
        }
      });

      //  PASO 8: Confirmación
      /* await test.step("Verificar confirmación", async () => {
        await completePage.verifyCompleteSuscripcion(
          userInfoLive.basic.firstName,
          totals,
        );
      }); */
    });
  });
}
