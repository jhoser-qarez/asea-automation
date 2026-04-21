export interface MarketAddress {
  address1: string;
  address2?: string;
  city: string;
  state?: string; // opcional - algunos mercados no tienen estado (ej: Germany)
  zip: string;
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

export type CheckoutVariant = "standard" | "european";

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
}

export const markets: MarketConfig[] = [
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
      email: "jhosertest1@test.com",
      firstName: "Jhoser",
      lastName: "Juarez",
      phone: "9000000001",
    },
    card: {
      name: "Test US Account",
      number: "5454545454545454",
      expMonth: "03",
      expYear: "2030",
      cvv: "123",
    },
  }, // ← cierre objeto Germany
  {
    marketName: "Austria",
    languageOption: "Austria (Deutsch)",
    checkoutVariant: "european",
    product: { name: "Gold-Essentials-Abo-Paket" },
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
      number: "5454545454545454",
      expMonth: "03",
      expYear: "2030",
      cvv: "123",
    },
  },
];
