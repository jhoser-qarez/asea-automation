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
