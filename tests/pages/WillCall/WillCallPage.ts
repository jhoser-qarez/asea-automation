import { Page, Locator, expect } from "@playwright/test";

export class WillCallPage {
  readonly page: Page;

  readonly btnDeliveryIcon: Locator;

  // Modal "Select your delivery option"
  readonly modal: Locator;
  readonly radioGroup: Locator;

  // Inputs nativos (ocultos vía CSS) - usados para verificar el estado "checked"
  readonly radioShipToHome: Locator;
  readonly radioUtahWillCall: Locator;
  readonly radioPickupWarehouse: Locator;

  // Labels visibles con el texto de la opción - usados para hacer clic
  readonly labelShipToHome: Locator;
  readonly labelUtahWillCall: Locator;
  readonly labelPickupWarehouse: Locator;

  readonly btnContinueWithDelivery: Locator;
  readonly btnClose: Locator;

  // Banner de confirmación Will Call (en /info y /checkout)
  readonly willCallBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Ícono de delivery en el header
    this.btnDeliveryIcon = page.locator('[data-test="shipping-icon"]');

    // Modal activo
    this.modal = page.getByText("Select your delivery option");

    // Grupo de radios de opciones de entrega
    this.radioGroup = page.locator('[role="radiogroup"]');

    // Los ids/name de los inputs dependen del orden en la lista (ej. "0_0", "6_1"),
    // por eso se ubican por su nombre accesible (texto del label asociado) en vez del id.
    this.radioShipToHome = this.radioGroup.getByRole("radio", {
      name: "Ship to home",
    });
    this.radioUtahWillCall = this.radioGroup.getByRole("radio", {
      name: "Utah Will Call Center",
    });
    this.radioPickupWarehouse = this.radioGroup.getByRole("radio", {
      name: "Pickup Brand Partner Owned Warehouse",
    });

    // Los inputs están ocultos (class="peer hidden"), por lo que el clic se hace sobre el label visible
    this.labelShipToHome = this.radioGroup.locator("label", {
      hasText: "Ship to home",
    });
    this.labelUtahWillCall = this.radioGroup.locator("label", {
      hasText: "Utah Will Call Center",
    });
    this.labelPickupWarehouse = this.radioGroup.locator("label", {
      hasText: "Pickup Brand Partner Owned Warehouse",
    });

    // Botón continuar
    this.btnContinueWithDelivery = page.locator("button", {
      hasText: "Continue with this delivery option",
    });

    //  Botón cerrar modal
    this.btnClose = page.locator('[data-cy="summary-cart-close-btn"]');

    //  Banner azul Will Call
    this.willCallBanner = page.locator('[data-test="shipping-icon"]');
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

    await this.labelUtahWillCall.click();
    await expect(this.radioUtahWillCall).toBeChecked();

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
    await this.labelShipToHome.click();
    await expect(this.radioShipToHome).toBeChecked();
    await expect(this.btnContinueWithDelivery).toBeEnabled({ timeout: 5000 });
    await this.btnContinueWithDelivery.click();
    await expect(this.modal).not.toBeVisible({ timeout: 10000 });
    console.log("Ship to home seleccionado");
  }

  //  Seleccionar Pickup Brand Partner Owned Warehouse
  async selectPickupWarehouse() {
    await this.openDeliveryModal();
    await this.labelPickupWarehouse.click();
    await expect(this.radioPickupWarehouse).toBeChecked();
    await expect(this.btnContinueWithDelivery).toBeEnabled({ timeout: 5000 });
    await this.btnContinueWithDelivery.click();
    await expect(this.modal).not.toBeVisible({ timeout: 10000 });
    console.log("Pickup Brand Partner Owned Warehouse seleccionado");
  }

  // ✅ Verificar banner Will Call en /info o /checkout
  async verifyWillCallBanner() {
    await expect(this.willCallBanner).toBeVisible({ timeout: 10000 });
    await expect(this.willCallBanner).toContainText("ASEA WILL CALL");
    console.log(" Banner Will Call verificado");
  }
}
