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
import { getMarketsToRun } from "../../utils/marketFilter";
import { ProjectMetadata, getConfig } from "../../utils/testConfig";

// ⚠️ Productos distintos por sección: el producto de suscripción configurado
// por mercado (market.product) puede ser solo-suscripción (sin opción de
// compra única) — confirmado con evidencia real (México: "Paquete de
// suscripción Deluxe Essentials" no tiene checkbox "one-time", el botón
// Agregar quedaba deshabilitado para siempre). Se usa el producto de retail
// ya configurado por mercado (market.retailProduct) para Today's Order, y
// market.product para la Suscripción — mismo criterio que la variante
// "diferentes productos" del spec original (auth-subscription-order-
// checkout.spec.ts), aplicado por mercado.
for (const market of getMarketsToRun()) {
  const todayOrderProduct = market.retailProduct ?? market.product;

  test.describe(`Orden con Today Order + Suscripción con Dist Logueado - ${market.marketName}`, () => {
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
      await test.step("Login", async () => {
        await loginPage.gotoByEnv(
          config.env as "stage" | "live",
          config.voPort,
        );
        await loginPage.login(config.user.username, config.user.password);
        await loginPage.verifyLoginSuccess(config.user.username);
      });

      // PASO 2: Cambiar mercado e idioma
      if (market.marketName !== "United States") {
        await test.step(`Cambiar a ${market.marketName}`, async () => {
          await marketSelectorPage.changeMarket(market.marketName);
        });
      }

      // PASO 3: Seleccionar producto para Today's Order
      await test.step("Seleccionar producto para Today's Order", async () => {
        await productsPage.gotoByEnv(
          config.env as "stage" | "live",
          config.voPort,
        );
        await productsPage.verifyPageLoaded();
        await productsPage.selectProductByName(todayOrderProduct.name);
        await expect(page).toHaveURL(/\/products\/\d+/);
      });

      // PASO 4: Agregar a Today's Order
      await test.step("Agregar a Today's Order", async () => {
        await productDetailPage.addProductToCart("cart", 1);
      });

      // PASO 5: Verificar modal y continuar comprando
      await test.step("Verificar modal y continuar comprando", async () => {
        await cartModalPage.verifyModalVisible();
        await cartModalPage.verifyProductInCart(todayOrderProduct.name);
        await cartModalPage.continueShopping();
        await expect(page).toHaveURL(/\/products/);
      });

      // PASO 6: Seleccionar producto para Suscripción
      await test.step("Seleccionar producto para Suscripción", async () => {
        await productsPage.verifyPageLoaded();
        await productsPage.selectProductByName(market.product.name);
        await expect(page).toHaveURL(/\/products\/\d+/);
      });

      // PASO 7: Agregar a Suscripción
      await test.step("Agregar a Suscripción", async () => {
        await productDetailPage.addProductToCart("subscription", 1);
      });

      // PASO 8: Verificar modal con ambos productos → Checkout
      await test.step("Verificar modal con ambos productos", async () => {
        await cartModalPage.verifyModalVisible();
        await cartModalPage.verifyProductInCart(todayOrderProduct.name);
        await cartModalPage.verifyProductInSubscription(market.product.name);
        await cartModalPage.proceedToCheckout();
      });

      // PASO 9: Página Info
      await test.step("Llenar información y dirección", async () => {
        await infoPage.verifyPageLoaded();
        await infoPage.completeInfoPage(market.address, config.info.basic);
      });

      // PASO 10: Checkout
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
          totals = await checkoutPage.completeCheckout(market.card);
        }
      });

      // PASO 11: Confirmación
      await test.step("Verificar confirmación de orden", async () => {
        await completePage.verifyCompleteOrder(
          config.info.basic.firstName,
          totals,
        );
      });
    });
  });
}
