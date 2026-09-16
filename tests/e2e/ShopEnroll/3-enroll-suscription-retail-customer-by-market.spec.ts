import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { MarketSelectorPage } from "../../pages/MarketSelectorPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import { CartModalPage } from "../../pages/CartModalPage";
import { InfoPage } from "../../pages/InfoPage";
import { EnrollCheckoutPage } from "../../pages/EnrollAssociate/EnrollCheckoutPage";
import { EnrollCheckoutPageEuropean } from "../../pages/EnrollAssociate/EnrollCheckoutPageEuropean";
import { EnrollCheckoutPageAsia } from "../../pages/EnrollAssociate/EnrollCheckoutPageAsia";
import { EnrollCompletePage } from "../../pages/EnrollAssociate/EnrollCompletePage";
import { generateEnrollData, formatNationalId } from "../../fixtures/enrollData";
import { getMarketsToRun } from "../../utils/marketFilter";
import { ProjectMetadata, getConfig } from "../../utils/testConfig";
import { getPaymentCasesFor } from "../../fixtures/paymentCases";

for (const market of getMarketsToRun()) {
  // ✅ Matriz de pagos — ver nota en enroll-brand-partner-by-market.spec.ts.
  const paymentCases = getPaymentCasesFor(market.marketName, "retailCustomer");
  const runs = paymentCases.length > 0 ? paymentCases : [undefined];

  for (const pc of runs) {
    const suffix = pc ? ` - ${pc.id} (${pc.label})` : "";

    test.describe(`Enrolamiento Retail Customer - ${market.marketName}${suffix}`, () => {
      test(`Flujo completo: ${market.marketName}${suffix}`, async ({
        page,
      }) => {
      test.skip(
        !market.retailProduct,
        `${market.marketName} todavía no tiene retailProduct configurado en marketData.ts`,
      );

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
      const enrollCheckout = new EnrollCheckoutPage(page, market.labels);
      const enrollCheckoutEU = new EnrollCheckoutPageEuropean(
        page,
        market.labels,
      );
      const enrollCheckoutAsia = new EnrollCheckoutPageAsia(
        page,
        market.labels,
      );
      const enrollComplete = new EnrollCompletePage(page, market.labels);

      const enrollData = generateEnrollData();
      console.log(`📧 Email generado: ${enrollData.email}`);
      console.log(`👤 Username: ${enrollData.username}`);

      // PASO 1: Entrar como invitado y cambiar de mercado
      await test.step(`Ir al shop y cambiar a ${market.marketName}`, async () => {
        await loginPage.gotoByEnv(
          config.env as "stage" | "live",
          config.voPort,
        );
        await loginPage.btnShopHere.click();
        await expect(page).toHaveURL(/\/products/);
        // ⚠️ United States viene como mercado por defecto del shop —
        // cambiar a él explícitamente no es necesario (confirmado).
        if (market.marketName !== "United States") {
          await marketSelectorPage.changeMarket(market.marketName);
        }
      });

      // PASO 2: Seleccionar producto para Today's Order
      await test.step("Seleccionar producto para Today's Order", async () => {
        await productsPage.verifyPageLoaded();
        await productsPage.selectProductByName(market.retailProduct!.name);
        await expect(page).toHaveURL(/\/products\/\d+/);
      });

      // PASO 3: Agregar a Today's Order (compra única, no suscripción)
      await test.step("Agregar a Today's Order", async () => {
        await productDetailPage.verifyPageLoaded();
        await productDetailPage.selectPurchaseType("cart");
        await productDetailPage.setQuantity(2);
        await productDetailPage.addToCart();
      });

      // PASO 4: Verificar modal y saltar el paso de suscripción

      await test.step("Verificar modal y continuar", async () => {
        await cartModalPage.verifyModalVisible();
        await cartModalPage.verifyProductInCart(market.retailProduct!.name);
        await cartModalPage.proceedToSkip();
      });

      // PASO 5: Página Info — usuario nuevo, sin datos precargados
      await test.step("Llenar información del nuevo usuario", async () => {
        await infoPage.verifyPageLoaded();
        await infoPage.fillBasicInfo({
          email: enrollData.email,
          firstName: enrollData.firstName,
          lastName: enrollData.lastName,
          phone: enrollData.phone,
        });
        await infoPage.fillShippingAddress(market.address);
        await infoPage.saveAddress();
        // orderShipping queda en su default (1 = primera opción detectada)
        await infoPage.selectOrderShipping();
        await infoPage.continueToCheckout();
      });

      // PASO 6: Checkout — sin referido
      let totals: { orderTotal: string; subscriptionTotal: string } = {
        orderTotal: "",
        subscriptionTotal: "",
      };
      await test.step(`Completar checkout [${market.checkoutVariant}]`, async () => {
        if (market.checkoutVariant === "european") {
          totals = await enrollCheckoutEU.completeRCCheckout(
            market.card,
            { username: enrollData.username, password: enrollData.password },
            { type: "none" },
            market.paymentMethod,
          );
        } else if (market.checkoutVariant === "asia") {
          // Mismo motivo que en enroll-suscription-customer-by-market.spec.ts:
          // el "else" (US) busca el formulario de "Credit Card" plano, que
          // no existe tal cual en mercados Adyen-only como Hong Kong.
          totals = await enrollCheckoutAsia.completeRCCheckout(
            pc?.card ?? market.card,
            {
              ssn: formatNationalId(
                enrollData.idSeed,
                market.nationalIdFormat,
              ),
              username: enrollData.username,
              password: enrollData.password,
            },
            { type: "none" },
            {
              needs3ds: pc?.needs3ds ?? false,
              provider: pc?.provider,
              liveMode: config.env === "live",
              // ⚠️ Solo Atome tiene formulario embebido propio (Personal
              // details/Billing address) dentro del dropin de Adyen — se
              // pasa siempre que haya datos disponibles, sin costo para
              // los demás proveedores (se ignora si no aplica).
              openInvoiceDetails: {
                firstName: enrollData.firstName,
                lastName: enrollData.lastName,
                phone: enrollData.phone,
                street: market.address.address1,
                postalCode: market.address.zip ?? "",
              },
            },
          );
        } else {
          totals = await enrollCheckout.completeRCCheckout(
            pc?.card ?? market.card,
            { username: enrollData.username, password: enrollData.password },
            { type: "none" },
            {
              needs3ds: pc?.needs3ds ?? false,
              provider: pc?.provider,
              liveMode: config.env === "live",
            },
          );
        }
      });

      // PASO 7: Verificar confirmación
      // ⚠️ Atome: sin datos de sandbox confiables para completar el login
      // (ver EnrollCheckoutPageAsia.placeOrder()) — la prueba se detiene a
      // propósito en el redirect al gateway de Atome, así que nunca llega
      // a /complete. Se salta esta verificación para ese caso — y también
      // en modo live, donde el checkout se detiene a propósito antes de
      // /complete para el resto de proveedores (ver EnrollCheckoutPage.
      // placeOrder()).
      if (pc?.provider !== "atome" && config.env !== "live") {
        await test.step("Verificar confirmación del enrolamiento", async () => {
          await enrollComplete.verifyCompleteEnrollmentRC(
            enrollData.firstName,
            totals,
          );
        });
      }
      });
    });
  }
}
