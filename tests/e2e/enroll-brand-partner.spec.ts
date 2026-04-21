import { test, expect, Page } from "@playwright/test";
import { OscarLoginPage } from "../pages/Oscar/OscarLoginPage";
import { OscarSearchPage } from "../pages/Oscar/OscarSearchPage";
import { OscarPopUpSearchResultsPage } from "../pages/Oscar/OscarPopUpSearchResultsPage";
import { EnrollStep1Page } from "../pages/EnrollAssociate/EnrollStep1Page";
import { EnrollStep2Page } from "../pages/EnrollAssociate/EnrollStep2Page";
import { EnrollStep3Page } from "../pages/EnrollAssociate/EnrollStep3Page";
import { EnrollCheckoutPage } from "../pages/EnrollAssociate/EnrollCheckoutPage";
import { EnrollCompletePage } from "../pages/EnrollAssociate/EnrollCompletePage";
import { CartModalPage } from "../pages/CartModalPage";
import { InfoPage } from "../pages/InfoPage";
import { users } from "../fixtures/credentials";
import { userInfo } from "../fixtures/userData";
import { generateEnrollData } from "../fixtures/enrollData";
import {
  distributor,
  enrollmentPacks,
  subscriptionBundles,
  enrollmentSelection,
} from "../fixtures/productData";

test.describe("Enrolamiento de Brand Partner", () => {
  test("Flujo completo para enrolar un BP desde OSCAR", async ({ page }) => {
    const oscarLoginPage = new OscarLoginPage(page);
    const oscarSearchPage = new OscarSearchPage(page);
    const oscarSearchResultsPage = new OscarPopUpSearchResultsPage(page);

    // PASO 1: Login en Oscar
    await test.step("Login en Oscar", async () => {
      await oscarLoginPage.gotoAndLogin(
        users.oscar.username,
        users.oscar.password,
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
    // PASO 4: Clic en Enroll
    let shopPage: Page;

    await test.step("Hacer clic en Enroll", async () => {
      shopPage = await oscarSearchResultsPage.clickEnroll();
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

      // Generar datos únicos para este enrolamiento
      const enrollData = generateEnrollData();
      console.log(`📧 Email generado: ${enrollData.email}`);
      console.log(`📞 Teléfono generado: ${enrollData.phone}`);

      // Verificar Step 3
      await enrollStep3.verifyPageLoaded();

      // Verificar promo codes
      await enrollStep3.verifyPromoCodes([
        "TESTSUBSPV",
        "TestEnrollWithSub",
        "SHARESUBSCRIPTION",
      ]);

      // Verificar perks
      await enrollStep3.verifyEnrollmentPerks();

      // Llenar datos básicos con datos únicos
      await enrollStep3.fillBasicInfo(enrollData);

      // Llenar dirección
      await infoPage.fillShippingAddress(userInfo.address);

      // Guardar dirección y esperar loading
      await enrollStep3.saveAddress();

      // Seleccionar shipping
      await infoPage.selectOrderShipping(userInfo.shipping.order);
      await infoPage.selectSubscriptionShipping(userInfo.shipping.subscription);

      // Continuar al checkout
      await enrollStep3.continueToCheckout();
    });

    // PASO 11: Checkout del enrolamiento
    let enrollTotals: { orderTotal: string; subscriptionTotal: string };
    let enrollData: ReturnType<typeof generateEnrollData>;
    await test.step("Checkout - Completar enrolamiento", async () => {
      enrollData = generateEnrollData(); // guardar en variable externa
      console.log(`Email: ${enrollData.email}`);
      console.log(`Teléfono: ${enrollData.phone}`);

      const enrollCheckout = new EnrollCheckoutPage(shopPage);
      enrollTotals = await enrollCheckout.completeEnrollCheckout(
        userInfo.card,
        {
          birthMonth: enrollData.birthMonth,
          birthDay: enrollData.birthDay,
          birthYear: enrollData.birthYear,
          ssn: enrollData.ssn,
          username: enrollData.username,
          password: enrollData.password,
        },
      );
    });

    //  PASO 12: Verificar confirmación del enrolamiento
    await test.step("Verificar confirmación del enrolamiento", async () => {
      const enrollComplete = new EnrollCompletePage(shopPage);
      await enrollComplete.verifyCompleteEnrollment(
        enrollData.firstName, // viene del generateEnrollData()
        enrollTotals,
      );
    });
  });
});
