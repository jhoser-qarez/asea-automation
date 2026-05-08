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
import { userInfo } from "../../fixtures/userData";

test.describe("Orden con Today Order + Suscripción con Dist Logueado", () => {
  test("Flujo completo: mismo producto en Order y Suscripción", async ({
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

    // PASO 2: Seleccionar producto
    await test.step("Seleccionar producto", async () => {
      await productsPage.goto();
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.default.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

    // PASO 3: Agregar a Today's Order
    await test.step("Agregar a Today's Order", async () => {
      await productDetailPage.selectPurchaseType("cart");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // PASO 4: Verificar modal y cerrar
    await test.step("Verificar modal Today's Order y cerrar", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInCart(products.default.name);
      await cartModalPage.closeModal();
    });

    //  PASO 5: Agregar a Suscripción
    await test.step("Agregar a Suscripción", async () => {
      await expect(page).toHaveURL(/\/products\/\d+/);
      await productDetailPage.selectPurchaseType("subscription");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // PASO 6: Verificar modal con ambas secciones → Checkout
    await test.step("Verificar modal con Order y Suscripción", async () => {
      await cartModalPage.verifyBothSections(products.default.name);
      await cartModalPage.proceedToCheckout();
    });

    // PASO 7: Página Info
    await test.step("Llenar información y dirección", async () => {
      await infoPage.verifyPageLoaded();

      await infoPage.completeInfoPage(
        userInfo.address,
        userInfo.basic,
        userInfo.shipping.order,
        userInfo.shipping.subscription,
      );
    });

    //  PASO 8: Checkout
    let totals: { orderTotal: string; subscriptionTotal: string };
    await test.step("Completar pago", async () => {
      totals = await checkoutPage.completeCheckout(userInfo.card);
    });

    // PASO 9: Confirmación
    await test.step("Verificar confirmación de orden", async () => {
      await completePage.verifyCompleteOrder(userInfo.basic.firstName, totals);
    });
  });

  test("Flujo completo:diferentes productos en Order y Suscripción", async ({
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

    // PASO 2: Seleccionar producto para Today's Order
    await test.step("Seleccionar producto para Today's Order", async () => {
      await productsPage.goto();
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.todayOrder.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

    // PASO 3: Agregar a Today's Order
    await test.step("Agregar a Today's Order", async () => {
      await productDetailPage.selectPurchaseType("cart");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // PASO 4: Verificar modal y clic en Continue Shopping
    await test.step("Verificar modal y continuar comprando", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInCart(products.todayOrder.name);
      console.log(`✅ ${products.todayOrder.name} en Today's Order`);
      // ✅ Usar Continue Shopping para volver a productos
      await cartModalPage.continueShopping();
      await expect(page).toHaveURL(/\/products/);
    });

    // PASO 5: Seleccionar producto para Suscripción
    await test.step("Seleccionar producto para Suscripción", async () => {
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.subscription.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

    // PASO 6: Agregar a Suscripción
    await test.step("Agregar a Suscripción", async () => {
      await productDetailPage.selectPurchaseType("subscription");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // PASO 7: Verificar modal con ambas secciones → Checkout
    await test.step("Verificar modal con ambos productos", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInCart(products.todayOrder.name);
      await cartModalPage.verifyProductInSubscription(
        products.subscription.name,
      );
      console.log("✅ Ambos productos en el carrito");
      await cartModalPage.proceedToCheckout();
    });

    // PASO 8: Info
    await test.step("Llenar información y dirección", async () => {
      await infoPage.verifyPageLoaded();
      await infoPage.completeInfoPage(
        userInfo.address,
        userInfo.basic,
        userInfo.shipping.order,
        userInfo.shipping.subscription,
      );
    });

    // PASO 9: Checkout
    let totals: { orderTotal: string; subscriptionTotal: string };
    await test.step("Completar pago", async () => {
      totals = await checkoutPage.completeCheckout(userInfo.card);
    });

    // PASO 10: Confirmación
    await test.step("Verificar confirmación de orden", async () => {
      await completePage.verifyCompleteOrder(userInfo.basic.firstName, totals);
    });
  });
});
