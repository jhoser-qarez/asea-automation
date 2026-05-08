import { test, expect, Page } from "@playwright/test";
import { OscarLoginPage } from "../../pages/Oscar/OscarLoginPage";
import { OscarSearchPage } from "../../pages/Oscar/OscarSearchPage";
import { OscarPopUpSearchResultsPage } from "../../pages/Oscar/OscarPopUpSearchResultsPage";
import { EnrollStep1Page } from "../../pages/EnrollAssociate/EnrollStep1Page";
import { EnrollStep2Page } from "../../pages/EnrollAssociate/EnrollStep2Page";
import { EnrollStep3Page } from "../../pages/EnrollAssociate/EnrollStep3Page";
import { EnrollCheckoutPage } from "../../pages/EnrollAssociate/EnrollCheckoutPage";
import { EnrollCompletePage } from "../../pages/EnrollAssociate/EnrollCompletePage";
import { CartModalPage } from "../../pages/CartModalPage";
import { InfoPage } from "../../pages/InfoPage";
import { users } from "../../fixtures/credentials";
import { userInfo, userInfoLive } from "../../fixtures/userData";
import { generateEnrollData } from "../../fixtures/enrollData";
import {
  distributor,
  enrollmentSelection,
} from "../../fixtures/productData";

interface ProjectMetadata {
  env?: string;
  voPort?: string;
}

interface TestConfig {
  env: string;
  voPort: string | undefined;
  oscarUser: { username: string; password: string };
  info: typeof userInfo;
}

test.describe("Enrolamiento de Brand Partner", () => {
  function getConfig(
    projectName: string,
    metadata?: ProjectMetadata,
  ): TestConfig {
    const env =
      metadata?.env === "stage" || metadata?.env === "live"
        ? metadata.env
        : projectName === "stage"
          ? "stage"
          : "live";

    const voPort =
      metadata?.voPort !== undefined
        ? metadata.voPort
        : projectName === "live-port-1"
          ? "10001"
          : projectName === "live-port-2"
            ? "10002"
            : undefined;

    const oscarUser = env === "stage" ? users.oscar : users.oscarLive;
    const info = env === "stage" ? userInfo : userInfoLive;

    console.log(`    Configuración - Proyecto: ${projectName}`);
    console.log(`   Entorno: ${env}`);
    console.log(`   Puerto VO: ${voPort || "ninguno"}`);

    return { env, voPort, oscarUser, info };
  }

  test("Flujo completo para enrolar un BP desde OSCAR", async ({ page }) => {
    const project = test.info().project;
    const config = getConfig(project.name, project.metadata as ProjectMetadata);

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
      await oscarSearchPage.searchByBrandPartnerId(distributor.brandPartnerId);
    });

    // PASO 3: Verificar busqueda
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

      // Si hay puerto, inyectarlo en la URL del shop
      if (config.voPort) {
        await shopPage
          .waitForLoadState("domcontentloaded", { timeout: 15000 })
          .catch(() => {});
        const url = new URL(shopPage.url());
        url.port = config.voPort;
        console.log(`🔀 Redirigiendo shop a puerto ${config.voPort}: ${url.href}`);
        await shopPage.goto(url.href, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
      }

      await expect(shopPage).toHaveURL(/sponsorId/);
      await expect(shopPage).toHaveURL(/at=true/);
      console.log(`✅ URL de enrolamiento: ${shopPage.url()}`);
    });

    // PASO 5: Verificar Step 1 en Shop
    await test.step("Verificar página de enrolamiento Step 1", async () => {
      const enrollStep1 = new EnrollStep1Page(shopPage);
      await enrollStep1.verifyPageLoaded();
      await enrollStep1.verifyAllPacksVisible();
      await enrollStep1.verifySponsorName(distributor.sponsorName);
    });

    // PASO 6: Seleccionar pack
    await test.step("Seleccionar pack de enrolamiento", async () => {
      const enrollStep1 = new EnrollStep1Page(shopPage);
      await enrollStep1.addPackToCart(enrollmentSelection.pack.name);
    });

    // PASO 7: Verificar carrito
    await test.step("Verificar carrito y continuar al Step 2", async () => {
      const cartModal = new CartModalPage(shopPage);
      await cartModal.verifyModalVisibleOnEnroll();
      await cartModal.verifyProductInCart(enrollmentSelection.pack.name);
      await cartModal.proceedToNextStep();
    });

    // PASO 8: Step 2 - Seleccionar suscripción
    await test.step("Step 2 - Seleccionar bundle de suscripción", async () => {
      const enrollStep2 = new EnrollStep2Page(shopPage);
      await enrollStep2.verifyPageLoaded();
      await enrollStep2.verifySponsorName(distributor.sponsorName);
      await enrollStep2.verifyBundlesVisible(7);
      await enrollStep2.addBundleToSubscription(
        enrollmentSelection.bundle.name,
      );
    });

    // PASO 9: Modal Step 2
    await test.step("Verificar modal Step 2 y continuar", async () => {
      const cartModal = new CartModalPage(shopPage);
      await cartModal.verifyModalVisibleOnEnroll();
      await cartModal.verifyProductInCart(enrollmentSelection.pack.name);
      await cartModal.verifyProductInSubscription(
        enrollmentSelection.bundle.name,
      );
      await cartModal.proceedToNextStep();
    });

    // PASO 10: Step 3 - Información y dirección
    await test.step("Step 3 - Llenar información", async () => {
      const enrollStep3 = new EnrollStep3Page(shopPage);
      const infoPage = new InfoPage(shopPage);

      const enrollData = generateEnrollData();
      console.log(`📧 Email generado: ${enrollData.email}`);
      console.log(`📞 Teléfono generado: ${enrollData.phone}`);

      await enrollStep3.verifyPageLoaded();
      await enrollStep3.verifyEnrollmentPerks();
      await enrollStep3.fillBasicInfo(enrollData);
      await infoPage.fillShippingAddress(config.info.address);
      await enrollStep3.saveAddress();
      await infoPage.selectOrderShipping(config.info.shipping.order);
      await infoPage.selectSubscriptionShipping(config.info.shipping.subscription);
      await enrollStep3.continueToCheckout();
    });

    // PASO 11: Checkout del enrolamiento
    let enrollTotals: { orderTotal: string; subscriptionTotal: string };
    let enrollData: ReturnType<typeof generateEnrollData>;
    await test.step("Checkout - Completar enrolamiento", async () => {
      enrollData = generateEnrollData();
      console.log(`Email: ${enrollData.email}`);
      console.log(`Teléfono: ${enrollData.phone}`);

      const enrollCheckout = new EnrollCheckoutPage(shopPage);
      enrollTotals = await enrollCheckout.completeEnrollCheckout(
        config.info.card,
        {
          birthMonth: enrollData.birthMonth,
          birthDay: enrollData.birthDay,
          birthYear: enrollData.birthYear,
          //ssn: enrollData.ssn,
          username: enrollData.username,
          password: enrollData.password,
        },
      );
    });

    // PASO 12: Verificar confirmación del enrolamiento
    await test.step("Verificar confirmación del enrolamiento", async () => {
      const enrollComplete = new EnrollCompletePage(shopPage);
      await enrollComplete.verifyCompleteEnrollment(
        enrollData.firstName,
        enrollTotals,
      );
    });
  });
});
