import { Page, Locator, expect } from "@playwright/test";

export class WillCallPage {
  readonly page: Page;

  readonly btnDeliveryIcon: Locator;

  // Modal "Select your delivery option"
  readonly modal: Locator;
  readonly radioShipToHome: Locator;
  readonly radioUtahWillCall: Locator;
  readonly radioPickupWarehouse: Locator;
  readonly btnContinueWithDelivery: Locator;
  readonly btnClose: Locator;

  // Banner de confirmación Will Call (en /info y /checkout)
  readonly willCallBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Ícono de delivery en el header
    this.btnDeliveryIcon = page
      .locator("button.v-btn--round i.mdi-truck")
      .locator("..");

    // Modal activo
    this.modal = page.locator(".v-dialog--active", {
      hasText: "Select your delivery option",
    });

    //  Radios por value
    this.radioShipToHome = page.locator('input[role="radio"][value="0"]');
    this.radioUtahWillCall = page.locator('input[role="radio"][value="6"]');
    this.radioPickupWarehouse = page.locator(
      'input[role="radio"][value="1000"]',
    );

    // Botón continuar
    this.btnContinueWithDelivery = page.locator("button", {
      hasText: "Continue with this delivery option",
    });

    //  Botón cerrar modal
    this.btnClose = page.locator('[data-cy="summary-cart-close-btn"]');

    //  Banner azul Will Call
    this.willCallBanner = page.locator('[role="alert"]', {
      hasText: "You will be picking up your order from the following address",
    });
  }

  //  Abrir modal de delivery desde el header
  async openDeliveryModal() {
    await this.btnDeliveryIcon.click();
    await expect(this.modal).toBeVisible({ timeout: 10000 });
    await expect(this.btnContinueWithDelivery).toBeVisible({ timeout: 10000 });
    console.log("✅ Modal de delivery abierto");
  }

  //  Seleccionar Utah Will Call Center y confirmar
  async selectUtahWillCall() {
    await this.openDeliveryModal();

    await this.page
      .locator("label", { hasText: "Utah Will Call Center" })
      .click();

    await expect(this.radioUtahWillCall).toHaveAttribute(
      "aria-checked",
      "true",
    );

    // Esperar que el botón esté habilitado y hacer clic
    await expect(this.btnContinueWithDelivery).toBeEnabled({ timeout: 5000 });
    await this.btnContinueWithDelivery.click();

    // Esperar que el modal se cierre
    await expect(this.modal).not.toBeVisible({ timeout: 10000 });
    console.log(" Will Call seleccionado: Utah Will Call Center");
  }

  //  Seleccionar Ship to home
  async selectShipToHome() {
    await this.openDeliveryModal();
    await this.page.locator("label", { hasText: "Ship to home" }).click();
    await expect(this.radioShipToHome).toHaveAttribute("aria-checked", "true");
    await expect(this.btnContinueWithDelivery).toBeEnabled({ timeout: 5000 });
    await this.btnContinueWithDelivery.click();
    await expect(this.modal).not.toBeVisible({ timeout: 10000 });
    console.log("Ship to home seleccionado");
  }

  // ✅ Verificar banner Will Call en /info o /checkout
  async verifyWillCallBanner() {
    await expect(this.willCallBanner).toBeVisible({ timeout: 10000 });
    await expect(this.willCallBanner).toContainText("ASEA WILL CALL");
    console.log(" Banner Will Call verificado");
  }
}
