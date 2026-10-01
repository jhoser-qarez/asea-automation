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
import {
  generateEnrollData,
  formatNationalId,
} from "../../fixtures/enrollData";
import { getMarketsToRun } from "../../utils/marketFilter";
import { ProjectMetadata, getConfig } from "../../utils/testConfig";
import { getPaymentCasesFor } from "../../fixtures/paymentCases";

for (const market of getMarketsToRun()) {
  // ✅ Matriz de pagos — ver nota en enroll-brand-partner-by-market.spec.ts.
  const paymentCases = getPaymentCasesFor(
    market.marketName,
    "subscriptionCustomer",
  );
  const runs = paymentCases.length > 0 ? paymentCases : [undefined];

  for (const pc of runs) {
    const suffix = pc ? ` - ${pc.id} (${pc.label})` : "";

    test.describe(`Enrolamiento Subscription Customer - ${market.marketName}${suffix}`, () => {
      test(`Flujo completo: ${market.marketName}${suffix}`, async ({
        page,
      }) => {
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

        // PASO 1: Ir a Shop

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

        // PASO 2: Seleccionar producto de suscripción
        await test.step("Seleccionar producto de suscripción", async () => {
          await productsPage.verifyPageLoaded();
          await productsPage.selectProductByName(market.product.name);
          await expect(page).toHaveURL(/\/products\/\d+/);
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
          await cartModalPage.verifyBothSections(market.product.name);
          await cartModalPage.proceedToCheckout();
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
          // ⚠️ Exclusivo de México: no-op para el resto de mercados (ver
          // InfoPage.fillAccountType()).
          await infoPage.fillAccountType(market.accountType ?? "Individual", {
            curp: enrollData.curp,
            rfc: enrollData.rfc,
          });
          await infoPage.saveAddress();
          // subscriptionShipping queda en su default (1 = primera opción)
          await infoPage.selectSubscriptionShipping();
          await infoPage.continueToCheckout();
        });

        // PASO 6: Checkout — sin referido
        let totals: { orderTotal: string; subscriptionTotal: string } = {
          orderTotal: "",
          subscriptionTotal: "",
        };
        await test.step(`Completar checkout [${market.checkoutVariant}]`, async () => {
          if (market.checkoutVariant === "european") {
            totals = await enrollCheckoutEU.completeSCCheckout(
              pc?.card ?? market.card,
              { username: enrollData.username, password: enrollData.password },
              { type: "none" },
              market.paymentMethod,
              {
                provider: pc?.provider,
                bankDetails: pc?.bankDetails,
                needs3ds: pc?.needs3ds ?? false,
              },
            );
          } else if (market.checkoutVariant === "asia") {
            // ⚠️ Antes caía al "else" (EnrollCheckoutPage, US) que busca el
            // formulario de "Credit Card" plano tal cual US — confirmado que
            // Hong Kong solo tiene Adyen, así que se colgaba. El formato del
            // ID de gobierno también varía por mercado (ver
            // enroll-brand-partner-by-market.spec.ts, mismo criterio).
            totals = await enrollCheckoutAsia.completeSCCheckout(
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
              },
            );
          } else {
            totals = await enrollCheckout.completeSCCheckout(
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

        if (pc?.provider !== "klarna" && config.env !== "live") {
          await test.step("Verificar confirmación del enrolamiento", async () => {
            await enrollComplete.verifyCompleteEnrollmentSC(
              enrollData.firstName,
              totals,
            );
          });
        }
      });
    });
  }
}
