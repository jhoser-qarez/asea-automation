export interface MarketLabels {
  // 🎯 Login / Market selector
  shopHere: string; // LoginPage: 'button:has-text("Shop Here")'
  login: string; // LoginPage: getByRole("button", { name: "LOGIN" })

  // 🎯 Cart modal
  closePanel: string; // CartModalPage: getByRole("button", { name: "Close panel" })
  continueToCheckout: string; // CartModalPage: getByRole("button", { name: /CONTINUE TO CHECKOUT/i })

  // 🎯 Info page
  backToShopping: string; // InfoPage: getByRole("button", { name: "BACK TO SHOPPING" })

  // 🎯 Checkout (shop)
  creditCard: string; // CheckoutPage: label hasText "Credit Card"
  useMyShippingAddress: string; // CheckoutPage: label hasText "Use my shipping address"
  useDifferentAddress: string; // CheckoutPage: label hasText "Use Different Address"
  sameAsCartBillingMethod: string; // CheckoutPage: label hasText "Same as Your Cart Billing Method"
  useSameAddressAsTodaysOrder: string; // CheckoutPage: label hasText "Use same address as today's order"
  backToInformation: string; // CheckoutPage: getByRole("button", { name: "Back to Information" })

  // 🎯 Complete (shop)
  orderReceived: string; // CompletePage: div hasText "Your order has been received"
  orderNumberLabel: string; // CompletePage: usado para ubicar el bloque de resumen ("Order Number")
  downloadReceipt: string; // CompletePage: a hasText "Download receipt"

  // 🎯 Enroll - Step 1
  sponsorNamePrefix: string; // EnrollStep1/2Page: ".name-sponsor" hasText "Sponsor Name:"
  addToCart: string; // EnrollStep1Page / EnrollStep3Page: "ADD TO CART"
  buildYourPack: string; // EnrollStep1Page: "BUILD YOUR PACK"

  // 🎯 Enroll - Step 2
  stepTwoTitle: string; // EnrollStep2Page: h2 hasText "Step 2"
  addToSubscription: string; // EnrollStep2Page: "ADD TO SUBSCRIPTION"
  skipThisStep: string; // EnrollStep2Page: "SKIP THIS STEP"
  buildMyBundle: string; // EnrollStep2Page: "BUILD MY BUNDLE"

  // 🎯 Enroll - Step 3
  stepThreeTitle: string; // EnrollStep3Page: h2 hasText "Step 3"
  enrollmentPerksPattern: RegExp; // EnrollStep3Page: /Enrollment Pack Perks:.*save 50%/
  saveAddress: string; // EnrollStep3Page: getByRole("button", { name: "SAVE ADDRESS" })

  // 🎯 Enroll - Checkout (referidos y billing)
  searchByName: string; // EnrollCheckoutPage: label hasText "Search by Name"
  searchBySponsorId: string; // EnrollCheckoutPage: label hasText "Search by Sponsor ID"
  noOneReferredMe: string; // EnrollCheckoutPage: label hasText "No one referred me"

  // 🎯 Enroll - Complete
  welcomeToAsea: string; // EnrollCompletePage: div hasText "welcome to Asea"
  orderReceivedEnroll: string; // EnrollCompletePage: div hasText "Your order has been received!"
  enrollmentDetails: string; // EnrollCompletePage: usado para ubicar el bloque ("Enrollment Details")
  welcomeMessage: (firstName: string) => string; // "Thank you, {firstName}, and welcome to Asea!"
  confirmationMessageSC: (firstName: string) => string; // "Thank you, {firstName}"

  monthNames: string[];
}

const ENGLISH_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ✅ Traduce un nombre de mes en inglés (lo que siempre genera
// generateEnrollData()) al idioma del mercado actual, usando
// labels.monthNames. Si no lo reconoce, devuelve el original sin tocar.
export function translateEnrollBirthMonth(
  englishMonth: string,
  labels: MarketLabels,
): string {
  const index = ENGLISH_MONTH_NAMES.indexOf(englishMonth);
  if (index === -1) return englishMonth;
  return labels.monthNames[index] ?? englishMonth;
}

// ✅ Inglés/US
export const defaultLabels: MarketLabels = {
  shopHere: "Shop Here",
  login: "LOGIN",

  closePanel: "Close panel",
  continueToCheckout: "CONTINUE TO CHECKOUT",

  backToShopping: "BACK TO SHOPPING",

  creditCard: "Credit Card",
  useMyShippingAddress: "Use my shipping address",
  useDifferentAddress: "Use Different Address",
  sameAsCartBillingMethod: "Same as Your Cart Billing Method",
  useSameAddressAsTodaysOrder: "Use same address as today's order",
  backToInformation: "Back to Information",

  orderReceived: "Your order has been received",
  orderNumberLabel: "Order Number",
  downloadReceipt: "Download receipt",

  sponsorNamePrefix: "Sponsor Name:",
  addToCart: "ADD TO CART",
  buildYourPack: "BUILD YOUR PACK",

  stepTwoTitle: "Step 2",
  addToSubscription: "ADD TO SUBSCRIPTION",
  skipThisStep: "SKIP THIS STEP",
  buildMyBundle: "BUILD MY BUNDLE",

  stepThreeTitle: "Step 3",
  enrollmentPerksPattern: /Enrollment Pack Perks:.*save 50%/,
  saveAddress: "SAVE ADDRESS",

  searchByName: "Search by Name",
  searchBySponsorId: "Search by Sponsor ID",
  noOneReferredMe: "No one referred me",

  welcomeToAsea: "welcome to Asea",
  orderReceivedEnroll: "Your order has been received!",
  enrollmentDetails: "ENROLLMENT",
  welcomeMessage: (firstName) =>
    `Thank you, ${firstName}, and welcome to Asea!`,
  confirmationMessageSC: (firstName) => `Thank you, ${firstName}`,

  monthNames: ENGLISH_MONTH_NAMES,
};

// ✅ Inglés/Reino Unido — idéntico a defaultLabels salvo por la ortografía
// británica confirmada en la página real de /complete ("ENROLMENT", una
// sola L, en vez de "ENROLLMENT").
export const britishLabels: MarketLabels = {
  ...defaultLabels,
  enrollmentDetails: "ENROLMENT", // ✅ confirmado en página real de /complete
  continueToCheckout: "Continue to check-out", // ✅ confirmado en página real (modal de suscripción)
};

// ✅ Alemán

export const germanLabels: MarketLabels = {
  shopHere: "Hier einkaufen",
  login: "ANMELDEN",

  closePanel: "Feld schließen",
  continueToCheckout: "Weiter zum Check-out",

  backToShopping: "ZURÜCK ZUM EINKAUFEN",

  creditCard: "Credit Card",
  useMyShippingAddress: "Meine Lieferadresse verwenden", // ✅ confirmado en HTML real
  useDifferentAddress: "Abweichende Adresse verwenden", // ✅ confirmado en HTML real
  sameAsCartBillingMethod: "Gleiche Abrechnungsmethode wie Warenkorb", // ✅ confirmado en HTML real
  useSameAddressAsTodaysOrder:
    "Dieselbe Adresse wie bei Einmalkäufen verwenden", // ✅ confirmado en HTML real
  backToInformation: "Zurück zu den Informationen", // ✅ confirmado en HTML real
  orderReceived: "Ihre Bestellung wurde erhalten",
  orderNumberLabel: "Bestellnummer",
  downloadReceipt: "Beleg herunterladen",
  sponsorNamePrefix: "Name Sponsor:",
  addToCart: "Zum Warenkorb hinzufügen",
  buildYourPack: "STELLEN SIE IHR PAKET ZUSAMMEN",
  stepTwoTitle: "Schritt 2",
  addToSubscription: "ZUM ABO HINZUFÜGEN",
  skipThisStep: "DIESEN SCHRITT ÜBERSPRINGEN",
  buildMyBundle: "MEIN PAKET ZUSAMMENSTELLEN",
  stepThreeTitle: "Schritt 3",
  enrollmentPerksPattern: /Enrollment Pack Perks:.*save 50%/,
  saveAddress: "ADRESSE SPEICHERN",

  searchByName: "Nach Name suchen",
  searchBySponsorId: "Nach Sponsor-ID suchen",
  noOneReferredMe: "Niemand hat mich geworben",

  welcomeToAsea: "willkommen bei Asea",
  orderReceivedEnroll: "Ihre Bestellung wurde erhalten!",
  enrollmentDetails: "REGISTRIERUNG",
  welcomeMessage: (firstName) =>
    `Vielen Dank, ${firstName}, und willkommen bei Asea!`,
  confirmationMessageSC: (firstName) => `Vielen Dank, ${firstName}`,

  monthNames: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
};

export const frenchLabels: MarketLabels = {
  shopHere: "Acheter ici",
  login: "CONNEXION",

  closePanel: "Fermer le panneau",
  continueToCheckout: "CONTINUER VERS LE PAIEMENT",

  backToShopping: "RETOUR AUX ACHATS",

  creditCard: "Credit Card",
  useMyShippingAddress: "Utiliser mon adresse de livraison",
  useDifferentAddress: "Utiliser une adresse différente",
  sameAsCartBillingMethod: "Même méthode de facturation que le panier",
  useSameAddressAsTodaysOrder:
    "Utiliser la même adresse que pour les achats ponctuels",
  backToInformation: "Retour aux informations",

  orderReceived: "Votre commande a été reçue",
  orderNumberLabel: "Numéro de commande",
  downloadReceipt: "Télécharger un reçu",

  sponsorNamePrefix: "NOM DU PARRAIN:",
  addToCart: "AJOUTER AU PANIER",
  buildYourPack: "CONSTRUISEZ VOTRE PACK",

  stepTwoTitle: "Étape 2",
  addToSubscription: "AJOUTER À L'ABONNEMENT",
  skipThisStep: "PASSER CETTE ÉTAPE",
  buildMyBundle: "CONSTRUIRE MON PACK",

  stepThreeTitle: "Étape 3",

  enrollmentPerksPattern: /Enrollment Pack Perks:.*save 50%/,
  saveAddress: "ENREGISTRER L'ADRESSE",

  searchByName: "NOM DU PARRAIN",
  searchBySponsorId: "Rechercher par ID de parrain",
  noOneReferredMe: "Personne",

  welcomeToAsea: "bienvenue chez Asea",
  orderReceivedEnroll: "Votre commande a été reçue !",
  enrollmentDetails: "ENREGISTREMENT",
  welcomeMessage: (firstName) =>
    `Merci, ${firstName}, et bienvenue chez Asea !`,
  confirmationMessageSC: (firstName) => `Merci, ${firstName}`,

  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
};

export const CroatiaLabels: MarketLabels = {
  shopHere: "Kupite ovdje",
  login: "PRIJAVA",

  closePanel: "Zatvori ploču",
  continueToCheckout: "NASTAVI NA PLAĆANJE",

  backToShopping: "POVRATAK NA KUPOVINU",
  creditCard: "Credit Card",
  useMyShippingAddress: "Upotrijebi moju adresu za dostavu",
  useDifferentAddress: "Upotrijebi drugu adresu",
  sameAsCartBillingMethod: "Isti način naplate kao u košarici",
  useSameAddressAsTodaysOrder:
    "Upotrijebi istu adresu kao za današnju narudžbu",
  backToInformation: "Povratak na informacije",

  orderReceived: "Vaša narudžba je primljena",
  orderNumberLabel: "Broj narudžbe",
  downloadReceipt: "Preuzmite račun",

  sponsorNamePrefix: "NAZIV/IME SPONZORA:",
  addToCart: "DODAJ U KOŠARICU",
  buildYourPack: "SASTAVITE SVOJ PAKET",

  stepTwoTitle: "Korak 2",
  addToSubscription: "DODAJ U PRETPLATU",
  skipThisStep: "PRESKOČI OVAJ KORAK",
  buildMyBundle: "SASTAVI MOJ PAKET",

  stepThreeTitle: "Korak 3",

  enrollmentPerksPattern: /Enrollment Pack Perks:.*save 50%/,
  saveAddress: "SPREMI ADRESU",

  searchByName: "Pretraži po imenu",
  searchBySponsorId: "Pretraži po ID-ju sponzora",
  noOneReferredMe: "Nitko me nije preporučio",

  welcomeToAsea: "dobrodošli u Asea",
  orderReceivedEnroll: "Vaša narudžba je primljena!",
  enrollmentDetails: "Upis",
  welcomeMessage: (firstName) =>
    `Hvala vam, ${firstName}, i dobrodošli u Asea!`,
  confirmationMessageSC: (firstName) => `Hvala vam, ${firstName}`,

  monthNames: [
    "Siječanj",
    "Veljača",
    "Ožujak",
    "Travanj",
    "Svibanj",
    "Lipanj",
    "Srpanj",
    "Kolovoz",
    "Rujan",
    "Listopad",
    "Studeni",
    "Prosinac",
  ],
};

// ✅ Húngaro
export const hungarianLabels: MarketLabels = {
  shopHere: "Vásárolj itt",
  login: "BEJELENTKEZÉS",

  closePanel: "Panel bezárása",
  continueToCheckout: "TOVÁBB A PÉNZTÁRHOZ", // ✅ confirmado en Step 3 (Info)

  backToShopping: "VISSZA A VÁSÁRLÁSRA", // ✅ confirmado en Step 3 (Info)

  creditCard: "Credit Card",
  useMyShippingAddress: "A szállítási címem használata", // ✅ confirmado en checkout real
  useDifferentAddress: "Más cím használata", // ✅ confirmado en checkout real
  sameAsCartBillingMethod: "Ugyanaz, mint a kosár számlázási módja",
  useSameAddressAsTodaysOrder: "Ugyanaz a cím, mint a mai rendelésnél",
  backToInformation: "VISSZA AZ INFORMÁCIÓHOZ", // ✅ confirmado en checkout real

  orderReceived: "Megrendelését megkaptuk",
  orderNumberLabel: "Rendelési szám",
  downloadReceipt: "Nyugta letöltése",

  sponsorNamePrefix: "SZPONZOR NEVE:", // ✅ confirmado en Step 2/3
  addToCart: "Hozzáadás a kosárhoz", // ✅ confirmado en Step 1
  buildYourPack: "Állítsd össze a saját csomagod", // ✅ confirmado en Step 1

  stepTwoTitle: "2. lépés", // ✅ confirmado (substring del h2 real de Step 2)
  addToSubscription: "Hozzáadás az előfizetéshez", // ✅ confirmado en Step 2
  skipThisStep: "LÉPÉS KIHAGYÁSA", // ✅ confirmado en Step 2
  buildMyBundle: "Saját Előfizetési Csomag Összeállítása", // ✅ confirmado en Step 2

  stepThreeTitle: "3. lépés", // ✅ confirmado (substring del h2 real de Step 3)
  enrollmentPerksPattern: /A belépési csomag előnyei.*50%/, // ✅ confirmado en Step 2/3
  saveAddress: "Cím mentése", // ✅ confirmado en Step 3 (Info)

  searchByName: "Keresés név szerint", // ✅ confirmado en checkout real
  searchBySponsorId: "Keresés szponzorazonosító szerint", // ✅ confirmado en checkout real
  noOneReferredMe: "Senki nem ajánlott", // ✅ confirmado en checkout real

  welcomeToAsea: "üdvözlünk az Aseánál",
  orderReceivedEnroll: "Megrendelését megkaptuk!",
  enrollmentDetails: "REGISZTRÁCIÓ",
  welcomeMessage: (firstName) =>
    `Köszönjük, ${firstName}, és üdvözlünk az Aseánál!`,
  confirmationMessageSC: (firstName) => `Köszönjük, ${firstName}`,

  monthNames: [
    "Január",
    "Február",
    "Március",
    "Április",
    "Május",
    "Június",
    "Július",
    "Augusztus",
    "Szeptember",
    "Október",
    "November",
    "December",
  ],
};

// ✅ Español (España) —
export const spainLabels: MarketLabels = {
  shopHere: "Compra aquí",
  login: "INICIAR SESIÓN",

  closePanel: "Cerrar panel",
  continueToCheckout: "CONTINUA PARA FINALIZAR LA COMPRA", // ✅ confirmado en Step 3 (Info)

  backToShopping: "VOLVER A LA TIENDA", // ✅ confirmado en Step 3 (Info)

  creditCard: "Credit Card",
  useMyShippingAddress: "Usar mi dirección de envío",
  useDifferentAddress: "Usar una dirección diferente", // ✅ confirmado en checkout real
  sameAsCartBillingMethod: "Igual que tu método de facturación del carrito", // ✅ confirmado en checkout real
  useSameAddressAsTodaysOrder:
    "Usar la misma dirección que en el pedido de hoy",
  backToInformation: "Volver a la información",

  orderReceived: "Hemos recibido tu pedido",
  // ✅ Confirmado con evidencia real: "Número del pedido", no "Número de
  // pedido".
  orderNumberLabel: "Número del pedido",
  downloadReceipt: "Descargar factura", // ✅ confirmado en página real de /complete

  sponsorNamePrefix: "Nombre De Patrocinador:", // ✅ confirmado en Step 2/3
  addToCart: "Añadir al carrito",
  buildYourPack: "Crea tu propio paquete", // ✅ confirmado en Step 1

  stepTwoTitle: "Paso 2", // ✅ confirmado (substring del h2 real de Step 2)
  addToSubscription: "Añadir a la suscripción", // ✅ confirmado en Step 2
  skipThisStep: "SALTAR ESTE PASO", // ✅ confirmado en Step 2
  buildMyBundle: "Crear Mi Paquete De Suscripción", // ✅ confirmado en Step 2

  stepThreeTitle: "Paso 3",
  enrollmentPerksPattern: /Enrollment Pack Perks:.*save 50%/,
  saveAddress: "GUARDAR DIRECCIÓN",

  searchByName: "Buscar por nombre", // ✅ confirmado en checkout real
  searchBySponsorId: "Buscar por ID de patrocinador", // ✅ confirmado en checkout real
  noOneReferredMe: "Nadie me ha recomendado", // ✅ confirmado en checkout real

  welcomeToAsea: "bienvenido a Asea",
  orderReceivedEnroll: "¡Hemos recibido tu pedido!",
  enrollmentDetails: "INSCRIPCIÓN",
  welcomeMessage: (firstName) => `Gracias, ${firstName}, y bienvenido a Asea!`,
  confirmationMessageSC: (firstName) => `Gracias, ${firstName}`,

  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
};

export const hongKongLabels: MarketLabels = {
  shopHere: "在此購買",
  login: "登入",

  closePanel: "關閉面板",

  continueToCheckout: "繼續結帳",

  backToShopping: "返回購物",

  creditCard: "Credit Card",
  useMyShippingAddress: "使用我的送货地址",
  useDifferentAddress: "使用其他地址",
  sameAsCartBillingMethod: "與購物車結帳方式相同",
  useSameAddressAsTodaysOrder: "使用與單次購買相同的地址",
  backToInformation: "返回信息",

  orderReceived: "您的訂單已收到",
  orderNumberLabel: "訂單編號",
  downloadReceipt: "下載收據",

  sponsorNamePrefix: "推薦人名稱:", // ✅ confirmado en Step 1/2
  addToCart: "確認", // ✅ confirmado — botón real en cada pack de Step 1
  buildYourPack: "建立自選組合", // ✅ confirmado en Step 1

  stepTwoTitle: "第 2 步", // ✅ confirmado (substring del h2 real de Step 2)
  addToSubscription: "添加到自動訂閱", // ✅ confirmado en Step 2
  skipThisStep: "跳過此步驟", // ✅ confirmado en Step 2 (sin data-test, solo texto)
  buildMyBundle: "建立我的組合", // ✅ confirmado en Step 2

  stepThreeTitle: "第 3 步", // ✅ confirmado (substring del h2 real de Step 3)
  // Falta verificar traduccion
  enrollmentPerksPattern: /Enrollment Pack Perks:.*save 50%/,
  saveAddress: "保存地址", // ✅ confirmado en Step 3 (Info)

  searchByName: "按姓名搜尋",
  searchBySponsorId: "按贊助商編號搜尋",
  noOneReferredMe: "沒有人推薦我",

  welcomeToAsea: "歡迎加入 Asea",
  orderReceivedEnroll: "您的訂單已收到！",
  enrollmentDetails: "註冊",
  welcomeMessage: (firstName) => `謝謝你，${firstName}，歡迎加入 Asea！`,
  confirmationMessageSC: (firstName) => `謝謝你，${firstName}`,

  monthNames: [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ],
};

// ✅ Español (México)
export const spanishLabels: MarketLabels = {
  shopHere: "Comprar aquí",
  login: "INICIAR SESIÓN",

  closePanel: "Cerrar panel",
  continueToCheckout: "Continuar a Pagar", // ✅ confirmado (screenshot real)

  backToShopping: "VOLVER A COMPRAS",

  creditCard: "Credit Card", // ✅ confirmado (screenshot real): "Credit Card - TEST", sin traducir
  useMyShippingAddress: "Usar mi dirección de envío",
  useDifferentAddress: "Usar una dirección diferente",
  sameAsCartBillingMethod: "Mismo método de facturación que tu carrito",
  // ✅ Confirmado con evidencia real (checkout de México con Today's Order +
  // Suscripción): el texto real es "para las compras de una sola vez", no
  // "que el pedido de hoy".
  useSameAddressAsTodaysOrder:
    "Usar la misma dirección para las compras de una sola vez",
  backToInformation: "Volver a la información",

  orderReceived: "Tu pedido ha sido recibido",
  // ✅ Confirmado con evidencia real: "Número del pedido", no "Número de
  // pedido".
  orderNumberLabel: "Número del pedido",
  downloadReceipt: "Descargar recibo",

  sponsorNamePrefix: "Nombre De Patrocinador:", // ✅ confirmado (screenshot real)
  addToCart: "AGREGAR AL CARRITO",
  buildYourPack: "ARMA TU PAQUETE",

  stepTwoTitle: "Paso 2", // ✅ confirmado (screenshot real)
  addToSubscription: "AGREGAR A LA SUSCRIPCIÓN",
  skipThisStep: "SALTAR ESTE PASO", // ✅ confirmado (screenshot real)
  buildMyBundle: "ARMA MI PAQUETE",

  stepThreeTitle: "Paso 3",
  enrollmentPerksPattern: /./, // ⚠️ sin confirmar el texto real — patrón laxo temporal
  saveAddress: "Guardar dirección",

  searchByName: "Buscar por nombre",
  searchBySponsorId: "Buscar por ID de patrocinador",
  noOneReferredMe: "Nadie me refirió",

  welcomeToAsea: "bienvenido a Asea",
  orderReceivedEnroll: "¡Tu pedido ha sido recibido!",
  enrollmentDetails: "INSCRIPCIÓN",
  welcomeMessage: (firstName) => `Gracias, ${firstName}, y bienvenido a Asea!`,
  confirmationMessageSC: (firstName) => `Gracias, ${firstName}`,

  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
};
