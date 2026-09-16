import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import { CartModalPage } from "../../pages/CartModalPage";
import { InfoPage } from "../../pages/InfoPage";
import { EnrollCheckoutPage } from "../../pages/EnrollAssociate/EnrollCheckoutPage";
import { EnrollCompletePage } from "../../pages/EnrollAssociate/EnrollCompletePage";
import { generateEnrollData } from "../../fixtures/enrollData";
import { products } from "../../fixtures/productData";
import { ProjectMetadata, getConfig } from "../../utils/testConfig";

test.describe("Enrolamiento Retail Customer", () => {
  test("Flujo completo: Subscription Customer", async ({ page }) => {
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

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
      await loginPage.gotoByEnv(config.env as "stage" | "live", config.voPort);
      await loginPage.btnShopHere.click();
      await expect(page).toHaveURL(/\/products/);
    });

    // PASO 2: Seleccionar producto para Today's Order
    await test.step("Seleccionar producto para Today's Order", async () => {
      await productsPage.verifyPageLoaded();
      await productsPage.selectProductByName(products.todayOrder.name);
      await expect(page).toHaveURL(/\/products\/\d+/);
    });

    // PASO 3: Agregar a Today's Order
    await test.step("Agregar a Today's Order", async () => {
      await productDetailPage.selectPurchaseType("cart");
      await productDetailPage.setQuantity(2);
      await productDetailPage.addToCart();
    });

    // PASO 4: Verificar modal y clic en Continue Shopping
    await test.step("Verificar modal y continuar comprando", async () => {
      await cartModalPage.verifyModalVisible();
      await cartModalPage.verifyProductInCart(products.todayOrder.name);
      console.log(`✅ ${products.todayOrder.name} en Today's Order`);
      await cartModalPage.proceedToSkip();
      //agregar la pagina de seleccionar suscription
    });

    await test.step("Llenar información y dirección", async () => {
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
      totals = await enrollCheckout.completeRCCheckout(
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
      await enrollComplete.verifyCompleteEnrollmentRC(
        enrollData.firstName,
        totals,
      );
    });
  });
});
