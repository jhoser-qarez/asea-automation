import {
  MarketLabels,
  germanLabels,
  frenchLabels,
  CroatiaLabels,
  hongKongLabels,
  defaultLabels,
  spanishLabels,
  hungarianLabels,
  britishLabels,
  spainLabels,
} from "./marketLabels";
import { PaymentMethodPreference } from "../pages/CheckoutPageEuropean";
import { NationalIdFormat } from "./enrollData";

export interface MarketAddress {
  address1: string;
  address2?: string;
  city: string;
  state?: string; // opcional - algunos mercados no tienen estado (ej: Germany)
  zip?: string; // opcional - algunos mercados no tienen código postal (ej: Hong Kong)

  // ⚠️ Exclusivos de Taiwan
  gender?: "male" | "female";
  bankAccountName?: string;
  bankName?: string;
  bankCity?: string;
  bankCode?: string;
  nationalId?: string;

  // ⚠️ Exclusivos de México
  colonia?: string;
  municipio?: string;
}

export interface MarketBasicInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string; // opcional - algunos mercados lo traen precargado (ej: US)
}

export interface MarketCard {
  name: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

export type CheckoutVariant = "standard" | "european" | "asia";

export interface MarketConfig {
  marketName: string;
  languageOption: string;
  checkoutVariant: CheckoutVariant;
  product: {
    name: string;
  };
  address: MarketAddress;
  basic: MarketBasicInfo;
  card: MarketCard;
  labels: MarketLabels;

  paymentMethod?: PaymentMethodPreference;

  enrollPack?: { name: string };
  enrollBundle?: { name: string };

  retailProduct?: { name: string };

  nationalIdFormat?: NationalIdFormat;

  // ⚠️ Exclusivo de México
  accountType?: "Individual" | "Business";
}

export const markets: MarketConfig[] = [
  ///////////////////////----ALEMANIA----////////////////////////////
  {
    marketName: "Germany",
    languageOption: "Germany (Deutsch)",
    checkoutVariant: "european",
    product: {
      name: "1 Karton ASEA (4 Flaschen)",
    },
    address: {
      address1: "Hauptstraße 1",
      city: "Berlin",
      zip: "10115",
    },
    basic: {
      email: "jhoserjuarez86480064@test.com",
      firstName: "Jhoser",
      lastName: "TestEnroll",
      phone: "9000000001",
    },
    card: {
      name: "Test US Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: germanLabels,
    paymentMethod: "adyen",
    enrollPack: { name: "Essentials-Registrierungspaket" },
    enrollBundle: { name: "Deluxe-Essentials-Abo-Paket" },
    retailProduct: { name: "ASEA® VIA™ Biome" },
  },
  ///////////////////////----HUNGRÍA----////////////////////////////
  {
    marketName: "Hungary",
    languageOption: "Hungary (Magyar)",
    checkoutVariant: "european",
    product: {
      name: "1 karton ASEA (4 palack)",
    },
    address: {
      address1: "Fő utca 1",
      city: "Budapest",
      zip: "1011",
    },
    basic: {
      email: "jhoserjuarez86480065@test.com",
      firstName: "Jhoser",
      lastName: "TestEnroll",
      phone: "301234567",
    },
    card: {
      name: "Test HU Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: hungarianLabels,
    paymentMethod: "adyen",
    enrollPack: { name: "Essentials belépési csomag" },
    enrollBundle: { name: "Deluxe Essentials előfizetési csomag" },
    retailProduct: { name: "ASEA® VIA™ Biome" },
  },
  ///////////////////////----REINO UNIDO----////////////////////////////
  {
    marketName: "United Kingdom",
    languageOption: "United Kingdom (English)",
    checkoutVariant: "european",
    product: {
      name: "1 Case ASEA (4 Bottles)",
    },
    address: {
      address1: "10 Downing Street",
      city: "London",
      state: "London", // ✅ confirmado en la lista real de condados ("Greater London" no existe ahí)
      zip: "SW1A 2AA",
    },
    basic: {
      email: "jhoserjuarez86480066@test.com",
      firstName: "Jhoser",
      lastName: "TestEnroll",
      phone: "7911123456",
    },
    card: {
      name: "Test UK Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: britishLabels,
    paymentMethod: "adyen",
    enrollPack: { name: "ASEA Start Enrollment Pack" },
    enrollBundle: { name: "Deluxe Essentials Subscription Bundle" },
    retailProduct: { name: "ASEA® VIA™ Biome" },
  },
  ///////////////////////----ESPAÑA----////////////////////////////
  {
    marketName: "Spain",
    languageOption: "Spain (Español)",
    checkoutVariant: "european",
    product: {
      name: "1 caja de ASEA (4 botellas)",
    },
    address: {
      address1: "Calle Mayor 1",
      city: "Madrid",
      state: "Madrid", // ✅ confirmado en la lista real de provincias
      zip: "28013",
    },
    basic: {
      email: "jhoserjuarez86480067@test.com",
      firstName: "Jhoser",
      lastName: "TestEnroll",
      phone: "612345678",
    },
    card: {
      name: "Test ES Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: spainLabels,
    paymentMethod: "adyen",
    enrollPack: { name: "Paquete de inscripción Essentials" },
    enrollBundle: { name: "Paquete de suscripción Deluxe Essentials" },
    retailProduct: { name: "ASEA® VIA™ Biome" },
  },
  ///////////////////////----AUSTRIA----////////////////////////////
  {
    marketName: "Austria",
    languageOption: "Austria (Deutsch)",
    checkoutVariant: "european",
    product: { name: "Deluxe-Essentials-Abo-Paket" },
    address: {
      address1: "test",
      address2: "test",
      city: "test",
      zip: "8401",
    },
    basic: {
      email: "jhosertest1@test.com",
      firstName: "Jhoser",
      lastName: "Juarez",
    },
    card: {
      name: "Test US Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: germanLabels,
    paymentMethod: "adyen",
    enrollPack: { name: "Essentials-Registrierungspaket" },
    enrollBundle: { name: "Deluxe-Essentials-Abo-Paket" },
  },

  ///////////////////////----BELGICA----////////////////////////////
  {
    marketName: "Belgium",
    languageOption: "Belgium (Français)",
    checkoutVariant: "european",
    product: { name: "Pack d'abonnement Deluxe Essentials" },
    address: {
      address1: "Rue de la Loi 1",
      city: "Brussels",
      state: "Brussels-Capital Region",
      zip: "1000",
    },
    basic: {
      email: "jhosertest1@test.com",
      firstName: "Jhoser",
      lastName: "Juarez",
    },
    card: {
      name: "Test US Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: frenchLabels,
    paymentMethod: "adyen",

    enrollPack: { name: "Pack d'inscription Essentials" },
    enrollBundle: { name: "Pack d'abonnement Deluxe Essentials" },
  },

  ///////////////////////----CROATIA----////////////////////////////
  {
    marketName: "Croatia",
    languageOption: "Croatia (Hrvatski)",
    checkoutVariant: "european",
    product: { name: "Deluxe Essentials pretplatnički paket" },
    address: {
      address1: "test",
      city: "test",
      state: "test",
      zip: "10000",
    },
    basic: {
      email: "jhosertest1@test.com",
      firstName: "Jhoser",
      lastName: "Juarez",
    },
    card: {
      name: "Test US Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: CroatiaLabels,
    paymentMethod: "adyen",
    enrollPack: { name: "Essentials upisni paket" },
    enrollBundle: { name: "Deluxe Essentials pretplatnički paket" },
  },

  ///////////////////////----HONG KONG----////////////////////////////
  {
    marketName: "Hong Kong",
    languageOption: "Hong Kong (中文)", //"Hong Kong (繁體中文)"
    checkoutVariant: "asia",

    product: { name: "RENU28™ 活膚凝膠" },
    address: {
      address1: "Test Address 1",
      address2: "Flat 1",
      city: "Central",
    },
    basic: {
      email: "jhosertest1@test.com",
      firstName: "Jhoser",
      lastName: "Juarez",
    },
    card: {
      name: "Test US Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: hongKongLabels,

    paymentMethod: "adyen",
    enrollPack: { name: "個人基本組合" },
    enrollBundle: { name: "基本自動續購組合" },
    retailProduct: { name: "RENU28™ 活膚凝膠" },
  },

  {
    marketName: "Taiwan",
    languageOption: "Taiwan (中文)",
    checkoutVariant: "asia",

    product: { name: "RENUAdvanced™ 亮采保濕霜" },
    address: {
      address1: "Test Address 1",

      address2: "中正區",
      city: "台北市",

      zip: "100",

      gender: "male",
      bankAccountName: "Jhoser Juarez",
      bankName: "Test Bank",
      bankCity: "台北市",
      bankCode: "004",
      nationalId: "A123456789",
    },
    basic: {
      email: "jhosertest1@test.com",
      firstName: "Jhoser",
      lastName: "Juarez",
    },
    card: {
      name: "Test HK Account",
      number: "5454545454545454",
      expMonth: "03",
      expYear: "2030",
      cvv: "123",
    },
    labels: hongKongLabels,

    //paymentMethod: "adyen",
    enrollPack: { name: "個人基本組合" },
    enrollBundle: { name: "基本自動續購組合" },
    // ⚠️ Mismo motivo que Hong Kong: en el spec combinado (Today's Order +
    // Suscripción), usar un producto de retail distinto al de suscripción
    // dejaba el modal del carrito permanentemente oculto al agregar el
    // segundo ítem — se usa el mismo producto en ambas secciones.
    retailProduct: { name: "RENUAdvanced™ 亮采保濕霜" },
  },

  {
    marketName: "Malaysia",
    languageOption: "Malaysia (English)",
    checkoutVariant: "asia",

    product: { name: "Deluxe Essentials Subscription Bundle" },
    address: {
      address1: "Test Address 1",

      address2: "test",
      city: "Kuala Lumpur",
      state: "Federal Territory of Kuala Lumpur",

      zip: "10000",
    },
    basic: {
      email: "jhosertest1@test.com",
      firstName: "Jhoser",
      lastName: "Juarez",
    },
    card: {
      name: "Test US Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: defaultLabels,

    paymentMethod: "adyen",
    enrollPack: { name: "Essentials Enrollment Pack" },
    enrollBundle: { name: "Deluxe Essentials Subscription Bundle" },

    nationalIdFormat: "malaysia-nric",
    retailProduct: { name: "RENUAdvanced™ Hydrating Cream" },
  },

  {
    marketName: "Singapore",
    languageOption: "Singapore (English)",
    checkoutVariant: "asia",

    product: { name: "Deluxe Essentials Subscription Bundle" },
    address: {
      address1: "Test Address 1",

      address2: "test",
      city: "Kuala Lumpur",

      zip: "1000",
    },
    basic: {
      email: "jhosertest1@test.com",
      firstName: "Jhoser",
      lastName: "Juarez",
    },
    card: {
      name: "Test US Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: defaultLabels,

    paymentMethod: "adyen",
    enrollPack: { name: "Essentials Enrollment Pack" },
    enrollBundle: { name: "Deluxe Essentials Subscription Bundle" },
    retailProduct: { name: "RENUAdvanced™ Hydrating Cream" },
  },

  ///////////////////////----ESTADOS UNIDOS----////////////////////////////

  {
    marketName: "United States",
    languageOption: "United States (English)",
    checkoutVariant: "standard",

    product: { name: "REDOXGold™ Massage + Soothing Gel" },
    address: {
      address1: "65 South 980 West",
      address2: "Apt 4B",
      city: "orem",
      state: "Utah",
      zip: "84018",
    },
    basic: {
      email: "jhoserjuarez86952810@test.com",
      firstName: "Jhoser",
      lastName: "TestEnroll",
    },
    card: {
      name: "Test US Account",
      number: "5454545454545454",
      expMonth: "03",
      expYear: "2030",
      cvv: "123",
    },
    labels: defaultLabels,

    enrollPack: { name: "Essentials Enrollment Pack" },
    enrollBundle: { name: "Deluxe Essentials Subscription Bundle" },
    retailProduct: { name: "REDOXGold™ Massage + Soothing Gel" },
  },

  ///////////////////////----CANADÁ----////////////////////////////

  {
    marketName: "Canada",
    languageOption: "Canada (English)",
    checkoutVariant: "standard",

    product: { name: "REDOXGold™ Massage + Soothing Gel" },
    address: {
      address1: "123 Main Street",
      address2: "Apt 4B",
      city: "Toronto",
      state: "Ontario",
      zip: "M5V 2T6",
    },
    basic: {
      email: "jhoserjuarez86952810@test.com",
      firstName: "Jhoser",
      lastName: "TestEnroll",
    },
    card: {
      name: "Test CA Account",
      number: "5454545454545454",
      expMonth: "03",
      expYear: "2030",
      cvv: "123",
    },
    labels: defaultLabels,

    enrollPack: { name: "Entrepreneur Essentials Enrollment Pack" },
    enrollBundle: { name: "Deluxe Essentials Subscription Bundle" },
    retailProduct: { name: "REDOXGold™ Massage + Soothing Gel" },
  },

  ///////////////////////----MÉXICO----////////////////////////////

  {
    marketName: "Mexico",
    languageOption: "Mexico (Español)",
    checkoutVariant: "standard",

    product: { name: "Paquete de suscripción Deluxe Essentials" },
    address: {
      address1: "Test Address 1",
      colonia: "Roma Norte",
      municipio: "Cuauhtémoc",
      city: "Ciudad de México",
      state: "Distrito Federal",
      zip: "06700",
    },
    basic: {
      email: "jhoserjuarez86952811@test.com",
      firstName: "Jhoser",
      lastName: "TestEnroll",
    },
    card: {
      name: "Test MX Account",
      number: "5454545454545454",
      expMonth: "03",
      expYear: "2030",
      cvv: "123",
    },
    labels: spanishLabels,
    accountType: "Individual",

    enrollPack: { name: "Paquete de inscripción Essentials" },
    enrollBundle: { name: "Paquete de suscripción Deluxe Essentials" },
    retailProduct: { name: "Suero Luminoso de RENUAdvanced™" },
  },

  ///////////////////////----AUSTRALIA----////////////////////////////

  {
    marketName: "Australia",
    languageOption: "Australia (English)",
    checkoutVariant: "standard",

    product: { name: "Deluxe Essentials Subscription Bundle" },
    address: {
      address1: "Test Address 1",
      city: "Sydney",
      state: "New South Wales",
      zip: "2000",
    },
    basic: {
      email: "jhoserjuarez86952812@test.com",
      firstName: "Jhoser",
      lastName: "TestEnroll",
    },

    card: {
      name: "Test AU Account",
      number: "4111111111111111",
      expMonth: "03",
      expYear: "30",
      cvv: "737",
    },
    labels: defaultLabels,

    enrollPack: { name: "Essentials Enrolment Pack" },
    enrollBundle: { name: "Deluxe Essentials Subscription Bundle" },
    retailProduct: { name: "REDOXGold™ Massage + Soothing Gel" },
  },
];
