import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { MarketSelectorPage } from "../pages/MarketSelectorPage";
import { ProductsPage } from "../pages/ProductsPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartModalPage } from "../pages/CartModalPage";
import { InfoPage } from "../pages/InfoPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CheckoutPageEuropean } from "../pages/CheckoutPageEuropean";
import { CompletePage } from "../pages/CompletePage";
import { users } from "../fixtures/credentials";
import { userInfo } from "../fixtures/userData";
import { markets } from "../fixtures/marketData";

for (const market of markets) {
  test.describe(`Orden Solo Suscripción con Dist Logueado - ${market.marketName}`, () => {
    test(`Flujo completo: ${market.marketName}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const marketSelectorPage = new MarketSelectorPage(page);
      const productsPage = new ProductsPage(page);
      const productDetailPage = new ProductDetailPage(page);
      const cartModalPage = new CartModalPage(page);
      const infoPage = new InfoPage(page);
      const checkoutPage = new CheckoutPage(page);
      const checkoutPageEU = new CheckoutPageEuropean(page);
      const completePage = new CompletePage(page);

      // PASO 1: Login
      await test.step("Login", async () => {
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await loginPage.verifyLoginSuccess(users.valid.username);
      });

      // PASO 2: Cambiar mercado e idioma
      await test.step(`Cambiar a ${market.marketName}`, async () => {
        await marketSelectorPage.changeMarket(market.marketName);
      });

      // PASO 3: Seleccionar producto
      await test.step("Seleccionar producto", async () => {
        await productsPage.goto();
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
        await infoPage.completeInfoPage(
          market.address,
          market.basic,
          userInfo.shipping.subscription,
        );
      });

      //  PASO 7: Checkout
      let totals: { orderTotal: string; subscriptionTotal: string } = {
        orderTotal: "",
        subscriptionTotal: "",
      };
      await test.step(`Checkout [${market.checkoutVariant}]`, async () => {
        if (market.checkoutVariant === "european") {
          totals = await checkoutPageEU.completeCheckoutEuropean(market.card);
        } else {
          totals = await checkoutPage.completeCheckoutOnlySuscriptionType(
            market.card,
          );
        }
      });

      //  PASO 8: Confirmación
      await test.step("Verificar confirmación", async () => {
        await completePage.verifyCompleteSuscripcion(
          userInfo.basic.firstName,
          totals,
        );
      });
    });
  });
}
