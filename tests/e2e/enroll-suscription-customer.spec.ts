import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ProductsPage } from "../pages/ProductsPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartModalPage } from "../pages/CartModalPage";
import { InfoPage } from "../pages/InfoPage";
import { EnrollCheckoutPage } from "../pages/EnrollAssociate/EnrollCheckoutPage";
import { EnrollCompletePage } from "../pages/EnrollAssociate/EnrollCompletePage";
import { generateEnrollData } from "../fixtures/enrollData";
import { userInfo } from "../fixtures/userData";
import {
  products,
  subscriptionBundles,
  distributor,
} from "../fixtures/productData";

test.describe("Enrolamiento Subscription Customer", () => {
  test("Flujo completo: Subscription Customer", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartModalPage = new CartModalPage(page);
    const infoPage = new InfoPage(page);
    const enrollCheckout = new EnrollCheckoutPage(page);
    const enrollComplete = new EnrollCompletePage(page);

    const enrollData = generateEnrollData();
    console.log(` Email generado: ${enrollData.email}`);
    console.log(` Username: ${enrollData.username}`);

    // PASO 1: Ir al shop y seleccionar mercado
    await test.step("Seleccionar mercado y continuar al shop", async () => {
      await loginPage.goto();
      await loginPage.btnShopHere.click();
      await expect(page).toHaveURL(/shop\.aseastage\.com/);
    });

    // PASO 2: Seleccionar producto de suscripción
    await test.step("Seleccionar producto de suscripción", async () => {
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.todayOrder.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
      console.log(`Producto seleccionado: ${products.todayOrder.name}`);
    });

    // PASO 3: Agregar como suscripción al carrito
    await test.step("Agregar producto como suscripción", async () => {
      await productDetailPage.selectPurchaseType("subscription");
      await productDetailPage.setQuantity(1);
      await productDetailPage.addToCart();
    });

    // PASO 4: Verificar modal y proceder al checkout
    await test.step("Verificar modal del carrito y proceder", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyBothSections(products.todayOrder.name);
      await cartModalPage.proceedToCheckout();
    });

    //  PASO 5: Página Info — llenar todos los campos (usuario nuevo, sin datos precargados)
    await test.step("Llenar información del nuevo usuario", async () => {
      await infoPage.verifyPageLoaded();

      //Llenar basic info manualmente
      await infoPage.fillBasicInfo({
        email: enrollData.email,
        firstName: enrollData.firstName,
        lastName: enrollData.lastName,
        phone: enrollData.phone,
      });

      // Llenar dirección
      await infoPage.fillShippingAddress(userInfo.address);

      // Guardar y esperar loading
      await infoPage.saveAddress();

      // Seleccionar shipping
      await infoPage.selectSubscriptionShipping(userInfo.shipping.subscription);

      // Continuar al checkout
      await infoPage.continueToCheckout();
    });

    // PASO 6: Checkout con referido por Sponsor ID
    let totals: { orderTotal: string; subscriptionTotal: string };
    await test.step("Completar checkout con referido", async () => {
      totals = await enrollCheckout.completeSCCheckout(
        userInfo.card,
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
      await enrollComplete.verifyCompleteEnrollmentSC(
        enrollData.firstName,
        totals,
      );
    });
  });
});
