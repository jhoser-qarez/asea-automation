import {
  MarketLabels,
  germanLabels,
  frenchLabels,
  CroatiaLabels,
  hongKongLabels,
  defaultLabels,
} from "./marketLabels";
import { PaymentMethodPreference } from "../pages/CheckoutPageEuropean";
import { NationalIdFormat } from "./enrollData";

export interface MarketAddress {
  address1: string;
  address2?: string;
  city: string;
  state?: string; // opcional - algunos mercados no tienen estado (ej: Germany)
  zip?: string; // opcional - algunos mercados no tienen código postal (ej: Hong Kong)

  // ⚠️ Exclusivos de Taiwan (confirmado requerido en la práctica, aunque sin
  // asterisco visible) — ningún otro mercado los tiene (ej. Hong Kong).
  gender?: "male" | "female";
  bankAccountName?: string;
  bankName?: string;
  bankCity?: string;
  bankCode?: string;
  nationalId?: string;
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

    product: { name: "6個月/24週自動續購信號分子水組合" },
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
    retailProduct: { name: "RENUAdvanced™ 亮采保濕霜" },
  },

  {
    marketName: "Taiwan",
    languageOption: "Taiwan (中文)",
    checkoutVariant: "asia",

    product: { name: "6個月/24週自動續購組合" },
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
      name: "Test US Account",
      number: "5454545454545454",
      expMonth: "03",
      expYear: "2030",
      cvv: "123",
    },
    labels: hongKongLabels,

    //paymentMethod: "adyen",
    enrollPack: { name: "個人基本組合" },
    enrollBundle: { name: "基本自動續購組合" },
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
  // ✅ checkoutVariant "standard": cae en la rama "else" de los specs
  // by-market (EnrollCheckoutPage tal cual, sin overrides) — el mismo
  // flujo que ya usaban los specs originales sin sufijo "-by-market"
  // (enroll-brand-partner.spec.ts, etc.), de donde se reusan estos datos
  // ya validados (enrollmentSelection de productData.ts, address/card de
  // userInfo/userInfoLive en userData.ts).
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
  // ✅ checkoutVariant "standard" — mismo flujo base que USA. Confirmado
  // por el usuario: Step 3 de Brand Partner NO tiene campo de teléfono ni
  // código de país (EnrollStep3Page.fillBasicInfo() ya lo maneja de forma
  // defensiva); el código postal usa el formato canadiense "A#A #A#"; los
  // métodos de pago son solo "Credit Card - TEST" (Braintree) y PayPal —
  // sin Adyen ni GPay.
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
];
