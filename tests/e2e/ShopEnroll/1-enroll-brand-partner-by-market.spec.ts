import { test, expect, Page } from "@playwright/test";
import { OscarLoginPage } from "../../pages/Oscar/OscarLoginPage";
import { OscarSearchPage } from "../../pages/Oscar/OscarSearchPage";
import { OscarPopUpSearchResultsPage } from "../../pages/Oscar/OscarPopUpSearchResultsPage";
import { MarketSelectorPage } from "../../pages/MarketSelectorPage";
import { EnrollStep1Page } from "../../pages/EnrollAssociate/EnrollStep1Page";
import { EnrollStep2Page } from "../../pages/EnrollAssociate/EnrollStep2Page";
import { EnrollStep3Page } from "../../pages/EnrollAssociate/EnrollStep3Page";
import { EnrollCheckoutPage } from "../../pages/EnrollAssociate/EnrollCheckoutPage";
import { EnrollCheckoutPageEuropean } from "../../pages/EnrollAssociate/EnrollCheckoutPageEuropean";
import { EnrollCheckoutPageAsia } from "../../pages/EnrollAssociate/EnrollCheckoutPageAsia";
import { EnrollCompletePage } from "../../pages/EnrollAssociate/EnrollCompletePage";
import { CartModalPage } from "../../pages/CartModalPage";
import { InfoPage } from "../../pages/InfoPage";
import {
  generateEnrollData,
  formatNationalId,
} from "../../fixtures/enrollData";
import { distributor } from "../../fixtures/productData";
import { ProjectMetadata, getConfig } from "../../utils/testConfig";
import { getMarketsToRun } from "../../utils/marketFilter";
import { getPaymentCasesFor } from "../../fixtures/paymentCases";

for (const market of getMarketsToRun()) {
  // ✅ Matriz de pagos
  const paymentCases = getPaymentCasesFor(market.marketName, "brandPartner");
  const runs = paymentCases.length > 0 ? paymentCases : [undefined];

  for (const pc of runs) {
    const suffix = pc ? ` - ${pc.id} (${pc.label})` : "";

    test.describe(`Enrolamiento Brand Partner - ${market.marketName}${suffix}`, () => {
      test(`Flujo completo: ${market.marketName}${suffix}`, async ({
        page,
      }) => {
        const project = test.info().project;
        const config = getConfig(
          project.name,
          project.metadata as ProjectMetadata,
        );

        const oscarLoginPage = new OscarLoginPage(page);
        const oscarSearchPage = new OscarSearchPage(page);
        const oscarSearchResultsPage = new OscarPopUpSearchResultsPage(page);

        // PASO 1: Login en Oscar
        await test.step("Login en Oscar", async () => {
          await oscarLoginPage.gotoAndLoginByEnv(
            config.env as "stage" | "live",
            config.oscarUser.username,
            config.oscarUser.password,
          );
        });

        // PASO 2: Buscar distribuidor
        await test.step("Buscar distribuidor", async () => {
          await oscarSearchPage.searchByBrandPartnerId(
            distributor.brandPartnerId,
          );
        });

        // PASO 3: Verificar búsqueda
        await test.step("Verificar resultados de búsqueda", async () => {
          await oscarSearchResultsPage.verifyModalVisible();
          await oscarSearchResultsPage.verifyDistributorInResults(
            distributor.brandPartnerId,
          );
        });

        // PASO 4: Clic en Enroll — abre el shop en nueva pestaña
        let shopPage: Page;
        await test.step("Hacer clic en Enroll", async () => {
          shopPage = await oscarSearchResultsPage.clickEnroll();

          if (config.voPort) {
            await shopPage
              .waitForLoadState("domcontentloaded", { timeout: 15000 })
              .catch(() => {});
            const url = new URL(shopPage.url());
            url.port = config.voPort;
            console.log(
              `🔀 Redirigiendo shop a puerto ${config.voPort}: ${url.href}`,
            );
            await shopPage.goto(url.href, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });
          }

          await expect(shopPage).toHaveURL(/sponsorId/);
          await expect(shopPage).toHaveURL(/at=true/);
          console.log(`✅ URL de enrolamiento: ${shopPage.url()}`);
        });

        // PASO 5: Cambiar de mercado — mismo ícono/flujo que el Shop normal.
        // ⚠️ United States viene como mercado por defecto del shop — cambiar
        // a él explícitamente no es necesario (confirmado).
        if (market.marketName !== "United States") {
          await test.step(`Cambiar a ${market.marketName}`, async () => {
            const marketSelectorPage = new MarketSelectorPage(shopPage);
            await marketSelectorPage.changeMarket(market.marketName);
          });
        }

        // PASO 6: Verificar Step 1 en Shop
        await test.step("Verificar página de enrolamiento Step 1", async () => {
          const enrollStep1 = new EnrollStep1Page(shopPage, market.labels);
          await enrollStep1.verifyPageLoaded();

          // await enrollStep1.verifySponsorName(distributor.sponsorName);
        });

        // PASO 7: Seleccionar pack (catálogo de enroll, distinto al del Shop)
        await test.step("Seleccionar pack de enrolamiento", async () => {
          const enrollStep1 = new EnrollStep1Page(shopPage, market.labels);
          await enrollStep1.addPackToCart(market.enrollPack!.name);
        });

        // PASO 8: Verificar carrito
        await test.step("Verificar carrito y continuar al Step 2", async () => {
          const cartModal = new CartModalPage(shopPage, market.labels);
          await cartModal.verifyModalVisibleOnEnroll();
          await cartModal.verifyProductInCart(market.enrollPack!.name);
          await cartModal.proceedToNextStep();
        });

        // PASO 9: Step 2 - Seleccionar bundle de suscripción
        await test.step("Step 2 - Seleccionar bundle de suscripción", async () => {
          const enrollStep2 = new EnrollStep2Page(shopPage, market.labels);
          await enrollStep2.verifyPageLoaded();
          // ⚠️ Comentado temporalmente — mismo motivo que en Step 1.
          // await enrollStep2.verifySponsorName(distributor.sponsorName);
          await enrollStep2.addBundleToSubscription(market.enrollBundle!.name);
        });

        // PASO 10: Modal Step 2
        await test.step("Verificar modal Step 2 y continuar", async () => {
          const cartModal = new CartModalPage(shopPage, market.labels);
          await cartModal.verifyModalVisibleOnEnroll();
          await cartModal.verifyProductInCart(market.enrollPack!.name);
          await cartModal.verifyProductInSubscription(
            market.enrollBundle!.name,
          );
          await cartModal.proceedToNextStep();
        });

        // PASO 11: Step 3 - Información y dirección
        let enrollData: ReturnType<typeof generateEnrollData>;
        await test.step("Step 3 - Llenar información", async () => {
          const enrollStep3 = new EnrollStep3Page(shopPage, market.labels);
          const infoPage = new InfoPage(shopPage, market.labels);

          enrollData = generateEnrollData();
          console.log(`📧 Email generado: ${enrollData.email}`);
          console.log(`📞 Teléfono generado: ${enrollData.phone}`);

          await enrollStep3.verifyPageLoaded();
          await enrollStep3.fillBasicInfo(enrollData);
          await infoPage.fillShippingAddress(market.address);
          // ⚠️ Exclusivo de México: no-op para el resto de mercados (ver
          // InfoPage.fillAccountType()).
          await infoPage.fillAccountType(market.accountType ?? "Individual", {
            curp: enrollData.curp,
            rfc: enrollData.rfc,
          });
          await enrollStep3.saveAddress();
          // orderShipping/subscriptionShipping quedan en su default (1)
          await enrollStep3.continueToCheckout();
        });

        // PASO 12: Checkout del enrolamiento
        let enrollTotals: { orderTotal: string; subscriptionTotal: string };
        await test.step(`Checkout - Completar enrolamiento [${market.checkoutVariant}]`, async () => {
          if (market.checkoutVariant === "european") {
            const enrollCheckoutEU = new EnrollCheckoutPageEuropean(
              shopPage,
              market.labels,
            );
            enrollTotals = await enrollCheckoutEU.completeEnrollCheckout(
              pc?.card ?? market.card,
              {
                birthMonth: enrollData.birthMonth,
                birthDay: enrollData.birthDay,
                birthYear: enrollData.birthYear,
                username: enrollData.username,
                password: enrollData.password,
              },
              market.paymentMethod,
              {
                provider: pc?.provider,
                bankDetails: pc?.bankDetails,
                needs3ds: pc?.needs3ds ?? false,
              },
            );
          } else if (market.checkoutVariant === "asia") {
            const enrollCheckoutAsia = new EnrollCheckoutPageAsia(
              shopPage,
              market.labels,
            );

            enrollTotals = await enrollCheckoutAsia.completeEnrollCheckout(
              pc?.card ?? market.card,
              {
                birthMonth: enrollData.birthMonth,
                birthDay: enrollData.birthDay,
                birthYear: enrollData.birthYear,
                ssn: formatNationalId(
                  enrollData.idSeed,
                  market.nationalIdFormat,
                ),
                username: enrollData.username,
                password: enrollData.password,
              },
              {
                needs3ds: pc?.needs3ds ?? false,
                provider: pc?.provider,
                liveMode: config.env === "live",
              },
            );
          } else {
            const enrollCheckout = new EnrollCheckoutPage(
              shopPage,
              market.labels,
            );
            enrollTotals = await enrollCheckout.completeEnrollCheckout(
              pc?.card ?? market.card,
              {
                birthMonth: enrollData.birthMonth,
                birthDay: enrollData.birthDay,
                birthYear: enrollData.birthYear,
                username: enrollData.username,
                password: enrollData.password,
              },
              {
                needs3ds: pc?.needs3ds ?? false,
                provider: pc?.provider,
                liveMode: config.env === "live",
              },
            );
          }
        });

        // PASO 13: Verificar confirmación del enrolamiento

        if (pc?.provider !== "klarna" && config.env !== "live") {
          await test.step("Verificar confirmación del enrolamiento", async () => {
            const enrollComplete = new EnrollCompletePage(
              shopPage,
              market.labels,
            );
            await enrollComplete.verifyCompleteEnrollment(
              enrollData.firstName,
              enrollTotals,
            );
          });
        }
      });
    });
  }
}
