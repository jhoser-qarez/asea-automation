import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ProductsPage } from "../pages/ProductsPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartModalPage } from "../pages/CartModalPage";
import { InfoPage } from "../pages/InfoPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CompletePage } from "../pages/CompletePage";
import { users } from "../fixtures/credentials";
import { products } from "../fixtures/productData";
import { userInfo } from "../fixtures/userData";

test.describe("Flujo de una compra con solo suscripcion para distribuidor logueado", () => {
  test("Carrito con solo producto de suscripcion- Mercado USA", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartModalPage = new CartModalPage(page);
    const infoPage = new InfoPage(page);
    const checkoutPage = new CheckoutPage(page);
    const completePage = new CompletePage(page);

    // PASO 1: Login
    await test.step("Login", async () => {
      await loginPage.goto();
      await loginPage.login(users.valid.username, users.valid.password);
      await loginPage.verifyLoginSuccess(users.valid.username);
    });

    // PASO 2: Ir a productos y seleccionar uno
    await test.step("Seleccionar producto", async () => {
      await productsPage.goto();
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
        userInfo.address,
        userInfo.basic,
        //userInfo.shipping.order,
        userInfo.shipping.subscription,
      );
    });

    // PASO 6: Checkout
    let totals: { orderTotal: string; subscriptionTotal: string };
    await test.step("Completar checkout", async () => {
      totals = await checkoutPage.completeCheckoutOnlySuscriptionType(
        userInfo.card,
      );
    });

    // PASO 7: Confirmación
    await test.step("Verificar confirmación de orden", async () => {
      await completePage.verifyCompleteSuscripcion(
        userInfo.basic.firstName,
        totals,
      );
    });
  });
});
