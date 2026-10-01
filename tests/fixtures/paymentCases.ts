// ✅ Matriz de casos de pago para los mercados de ASIA (CP-001..CP-075).
// Cada caso fija: mercado + flujo de enrolamiento + proveedor/método de
// pago + (opcional) tarjeta concreta y si requiere challenge 3DS.
//
// Los specs by-market (enroll-brand-partner / -suscription-customer /
// -suscription-retail-customer) llaman a getPaymentCasesFor(market, flow):
// - Si hay casos definidos para ese (mercado, flujo), generan un sub-test
//   por caso, pasando tarjeta / proveedor / needs3ds del caso al checkout.
// - Si NO hay ninguno (ej. mercados europeos), corren una sola vez con
//   market.card, como siempre (compat hacia atrás).
//
// Filtrado opcional por id: process.env.CASES="CP-001,CP-004".

export type PaymentFlow =
  | "brandPartner"
  | "subscriptionCustomer"
  | "retailCustomer";

export type PaymentProvider =
  | "Adyen"
  | "Braintree"
  | "WorldPay"
  | "CyberSource"
  | "BraintreeWithPayPal"
  | "BraintreeWithGPay"
  | "gpay"
  | "eBanking"
  | "atome"
  | "boost"
  | "oxxo"
  | "GlobalCollect"
  | "sofort"
  | "sepaDirectDebit"
  | "klarna";

export interface PaymentCaseCard {
  name: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

export interface PaymentCaseBankDetails {
  ownerName: string;
  iban: string;
}

export interface PaymentCase {
  id: string; // "CP-001"
  market: string; // debe coincidir con MarketConfig.marketName
  flow: PaymentFlow;
  provider: PaymentProvider;
  label: string; // descripción legible (para el nombre del test)
  // Solo para proveedores con formulario de tarjeta (Adyen / Braintree /
  // WorldPay / CyberSource). PayPal / wallets no la usan.
  card?: PaymentCaseCard;
  // Solo para proveedores con formulario de cuenta bancaria/IBAN
  // (GlobalCollect / SEPA Direct Debit dentro del dropin de Adyen).
  bankDetails?: PaymentCaseBankDetails;
  // El pago dispara un challenge 3DS (iframe inline de simulador) que hay
  // que atender antes de llegar a /complete.
  needs3ds?: boolean;
}

const HOLDER = "Test Asia Account";

// ═══════════════════════════ HONG KONG ═══════════════════════════
// HK solo tiene Adyen como proveedor. Tarjetas confirmadas contra el stage.
const ADYEN_NORMAL: PaymentCaseCard = {
  name: HOLDER,
  number: "4111111111111111",
  expMonth: "03",
  expYear: "30",
  cvv: "737",
};
const ADYEN_3DS: PaymentCaseCard = {
  name: HOLDER,
  number: "5454545454545454",
  expMonth: "03",
  expYear: "30",
  cvv: "737",
};

const hongKongDefs: {
  id: string;
  flow: PaymentFlow;
  label: string;
  card: PaymentCaseCard;
  needs3ds?: boolean;
}[] = [
  {
    id: "CP-001",
    flow: "brandPartner",
    label: "Adyen - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-002",
    flow: "brandPartner",
    label: "Adyen - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
  {
    id: "CP-003",
    flow: "subscriptionCustomer",
    label: "Adyen - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-004",
    flow: "subscriptionCustomer",
    label: "Adyen - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
  {
    id: "CP-005",
    flow: "retailCustomer",
    label: "Adyen - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-006",
    flow: "retailCustomer",
    label: "Adyen - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
];

const hongKongCases: PaymentCase[] = hongKongDefs.map((c) => ({
  ...c,
  market: "Hong Kong",
  provider: "Adyen",
}));

// ═══════════════════════════ TAIWAN ═══════════════════════════

const card = (number: string, cvv = "123"): PaymentCaseCard => ({
  name: HOLDER,
  number,
  expMonth: "03",
  expYear: "2030",
  cvv,
});

type TwCombo = Omit<PaymentCase, "id" | "market" | "flow">;
const taiwanCombos: TwCombo[] = [
  {
    provider: "Braintree",
    label: "Credit Card - TEST 3ds - Mastercard",
    card: card("5555555555554444"),
    needs3ds: true,
  },
  {
    provider: "Braintree",
    label: "Credit Card - TEST 3ds - American Express",
    card: card("378282246310005", "1234"),
    needs3ds: true,
  },
  {
    provider: "Braintree",
    label: "Credit Card - TEST 3ds - Visa",
    card: card("4111111111111111"),
    needs3ds: true,
  },
  {
    provider: "Braintree",
    label: "Credit Card - TEST 3ds - Discover Network",
    card: card("6011111111111117"),
    needs3ds: true,
  },
  {
    provider: "Braintree",
    label: "Credit Card - TEST 3ds - Western Union",
    card: card("4111111111111111"),
    needs3ds: true,
  },
  {
    provider: "WorldPay",
    label: "Credit Card - TEST - Mastercard",
    card: card("5555555555554444"),
  },
  {
    provider: "WorldPay",
    label: "Credit Card - TEST - Visa",
    card: card("4444333322221111"),
  },
  {
    provider: "CyberSource",
    label: "CyberSource - TEST - Mastercard",
    card: card("5555555555554444"),
  },
  {
    provider: "CyberSource",
    label: "CyberSource - TEST - Visa",
    card: card("4111111111111111"),
  },
  {
    provider: "CyberSource",
    label: "CyberSource - TEST - JCB",
    card: card("3566111111111113"),
  },
  { provider: "BraintreeWithPayPal", label: "PayPal" },
];

const taiwanFlowStart: [PaymentFlow, number][] = [
  ["brandPartner", 7],
  ["subscriptionCustomer", 18],
  ["retailCustomer", 29],
];

const taiwanCases: PaymentCase[] = taiwanFlowStart.flatMap(([flow, start]) =>
  taiwanCombos.map((combo, i) => ({
    ...combo,
    id: `CP-${String(start + i).padStart(3, "0")}`,
    market: "Taiwan",
    flow,
  })),
);

// ═══════════════════════════ MALASIA ═══════════════════════════
// HK solo tiene Adyen como proveedor. Tarjetas confirmadas contra el stage.

const malaysiaDefs: {
  id: string;
  flow: PaymentFlow;
  label: string;
  card: PaymentCaseCard;
  needs3ds?: boolean;
}[] = [
  {
    id: "CP-040",
    flow: "brandPartner",
    label: "Adyen - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-041",
    flow: "brandPartner",
    label: "Adyen - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
  {
    id: "CP-048",
    flow: "subscriptionCustomer",
    label: "Adyen - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-049",
    flow: "subscriptionCustomer",
    label: "Adyen - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
  {
    id: "CP-050",
    flow: "retailCustomer",
    label: "Adyen - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-051",
    flow: "retailCustomer",
    label: "Adyen - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
];

const malaysiaCases: PaymentCase[] = malaysiaDefs.map((c) => ({
  ...c,
  market: "Malaysia",
  provider: "Adyen",
}));

// ✅ Wallets de Malasia — sin tarjeta (redirect fuera del formulario de
// Adyen). Confirmado: solo existen para Retail Customer, NO para Brand
// Partner. Todavía exploratorios: falta confirmar con evidencia real qué
// pasa tras el redirect/popup (ver EnrollCheckoutPageAsia.placeOrder()).
const malaysiaWalletCases: PaymentCase[] = [
  {
    id: "CP-042",
    market: "Malaysia",
    flow: "retailCustomer",
    provider: "eBanking",
    label: "Malaysia E-Banking (FPX)",
  },
  {
    id: "CP-043",
    market: "Malaysia",
    flow: "retailCustomer",
    provider: "atome",
    label: "Atome Paylater (solo hasta redirect al gateway)",
  },
  {
    id: "CP-044",
    market: "Malaysia",
    flow: "retailCustomer",
    provider: "boost",
    label: "Boost",
  },
];

// ═══════════════════════════ SINGAPORE ═══════════════════════════
// Mismo patrón que Taiwan (radio "Braintree" fuera de Adyen, formulario de
// tarjeta plano heredado) — confirmado con el HTML real: label "Credit
// Card - TEST" (SIN "3ds" en el texto, a diferencia de Taiwan, así que no
// se asume challenge 3DS acá) con 5 marcas: mastercard, american express,
// visa, discover network y western union.
const singaporeCombos: { label: string; card: PaymentCaseCard }[] = [
  {
    label: "Credit Card - TEST - Mastercard",
    card: card("5555555555554444"),
  },
  {
    label: "Credit Card - TEST - American Express",
    card: card("378282246310005", "1234"),
  },
  { label: "Credit Card - TEST - Visa", card: card("4111111111111111") },
  {
    label: "Credit Card - TEST - Discover Network",
    card: card("6011111111111117"),
  },
  {
    label: "Credit Card - TEST - Western Union",
    card: card("4111111111111111"),
  },
];

// Confirmado: Subscription Customer y Retail Customer usan los mismos 5
// métodos de pago que Brand Partner (mismo radio "Braintree", mismas 5
// marcas de tarjeta).
const singaporeFlowStart: [PaymentFlow, number][] = [
  ["brandPartner", 56],
  ["subscriptionCustomer", 61],
  ["retailCustomer", 70],
];

const singaporeCases: PaymentCase[] = singaporeFlowStart.flatMap(
  ([flow, start]) =>
    singaporeCombos.map((c, i) => ({
      id: `CP-${String(start + i).padStart(3, "0")}`,
      market: "Singapore",
      flow,
      provider: "Braintree" as const,
      label: c.label,
      card: c.card,
    })),
);

// ✅ Adyen ("Alternative Payments") en Singapore: mismo radio/dropin que
// Hong Kong y Malasia, normal/3DS con las mismas tarjetas confirmadas.
const singaporeAdyenDefs: {
  id: string;
  flow: PaymentFlow;
  label: string;
  card: PaymentCaseCard;
  needs3ds?: boolean;
}[] = [
  {
    id: "CP-066",
    flow: "brandPartner",
    label: "Adyen (Alternative Payments) - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-067",
    flow: "brandPartner",
    label: "Adyen (Alternative Payments) - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
  {
    id: "CP-068",
    flow: "subscriptionCustomer",
    label: "Adyen (Alternative Payments) - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-069",
    flow: "subscriptionCustomer",
    label: "Adyen (Alternative Payments) - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
  {
    id: "CP-075",
    flow: "retailCustomer",
    label: "Adyen (Alternative Payments) - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: "CP-076",
    flow: "retailCustomer",
    label: "Adyen (Alternative Payments) - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
];

const singaporeAdyenCases: PaymentCase[] = singaporeAdyenDefs.map((c) => ({
  ...c,
  market: "Singapore",
  provider: "Adyen",
}));

// ✅ Atome (dentro del dropin de Adyen, mismo patrón que Malasia) — solo en
// Retail Customer, confirmado por el usuario.
const singaporeAtomeCase: PaymentCase = {
  id: "CP-077",
  market: "Singapore",
  flow: "retailCustomer",
  provider: "atome",
  label: "Atome Paylater (solo hasta redirect al gateway)",
};

// ═══════════════════════════ ESTADOS UNIDOS ═══════════════════════════

const usaCombos: { label: string; card: PaymentCaseCard }[] = [
  { label: "Credit Card - TEST - Mastercard", card: card("5555555555554444") },
  {
    label: "Credit Card - TEST - American Express",
    card: card("378282246310005", "1234"),
  },
  { label: "Credit Card - TEST - Visa", card: card("4111111111111111") },
  {
    label: "Credit Card - TEST - Discover Network",
    card: card("6011111111111117"),
  },
  {
    label: "Credit Card - TEST - Western Union",
    card: card("4111111111111111"),
  },
];

// Confirmado (Brand Partner) y asumido igual por patrón (Subscription/
// Retail Customer, sin evidencia específica todavía) para los 4 métodos.
const usaFlowStart: [PaymentFlow, number][] = [
  ["brandPartner", 78],
  ["subscriptionCustomer", 87],
  ["retailCustomer", 96],
];

const usaBraintreeCases: PaymentCase[] = usaFlowStart.flatMap(([flow, start]) =>
  usaCombos.map((c, i) => ({
    id: `CP-${String(start + i).padStart(3, "0")}`,
    market: "United States",
    flow,
    provider: "Braintree" as const,
    label: c.label,
    card: c.card,
  })),
);

const usaPayPalCases: PaymentCase[] = usaFlowStart.map(([flow, start]) => ({
  id: `CP-${String(start + 5).padStart(3, "0")}`,
  market: "United States",
  flow,
  provider: "BraintreeWithPayPal" as const,
  label: "PayPal",
}));

const usaAdyenCases: PaymentCase[] = usaFlowStart.flatMap(([flow, start]) => [
  {
    id: `CP-${String(start + 6).padStart(3, "0")}`,
    market: "United States",
    flow,
    provider: "Adyen" as const,
    label: "Adyen (Alternative Payments) - tarjeta normal",
    card: ADYEN_NORMAL,
  },
  {
    id: `CP-${String(start + 7).padStart(3, "0")}`,
    market: "United States",
    flow,
    provider: "Adyen" as const,
    label: "Adyen (Alternative Payments) - tarjeta 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
]);

// ⚠️ GPay
const usaGPayCase: PaymentCase = {
  id: "CP-086",
  market: "United States",
  flow: "brandPartner",
  provider: "BraintreeWithGPay",
  label: "GPay (límite de automatización conocido)",
};

// ═══════════════════════════ CANADÁ ═══════════════════════════

const canadaBraintreeCases: PaymentCase[] = usaCombos.map((c, i) => ({
  id: `CP-${String(104 + i).padStart(3, "0")}`,
  market: "Canada",
  flow: "brandPartner",
  provider: "Braintree" as const,
  label: c.label,
  card: c.card,
}));

const canadaPayPalCase: PaymentCase = {
  id: "CP-109",
  market: "Canada",
  flow: "brandPartner",
  provider: "BraintreeWithPayPal",
  label: "PayPal",
};

// ═══════════════════════════ MÉXICO ═══════════════════════════

const mexicoFlowStart: [PaymentFlow, number][] = [
  ["brandPartner", 110],
  ["subscriptionCustomer", 118],
  ["retailCustomer", 126],
];

const mexicoBraintreeCases: PaymentCase[] = mexicoFlowStart.flatMap(
  ([flow, start]) =>
    usaCombos.map((c, i) => ({
      id: `CP-${String(start + i).padStart(3, "0")}`,
      market: "Mexico",
      flow,
      provider: "Braintree" as const,
      label: c.label,
      card: c.card,
    })),
);

const mexicoPayPalCases: PaymentCase[] = mexicoFlowStart.map(
  ([flow, start]) => ({
    id: `CP-${String(start + 5).padStart(3, "0")}`,
    market: "Mexico",
    flow,
    provider: "BraintreeWithPayPal" as const,
    label: "PayPal (bloqueado: problema de backend conocido)",
  }),
);

const mexicoAdyenCases: PaymentCase[] = mexicoFlowStart.flatMap(
  ([flow, start]) => [
    {
      id: `CP-${String(start + 6).padStart(3, "0")}`,
      market: "Mexico",
      flow,
      provider: "Adyen" as const,
      label: "Adyen (Alternative Payments) - tarjeta normal",
      card: ADYEN_NORMAL,
    },
    {
      id: `CP-${String(start + 7).padStart(3, "0")}`,
      market: "Mexico",
      flow,
      provider: "Adyen" as const,
      label: "Adyen (Alternative Payments) - tarjeta 3DS",
      card: ADYEN_3DS,
      needs3ds: true,
    },
  ],
);

// ⚠️ Oxxo

const mexicoOxxoCase: PaymentCase = {
  id: "CP-134",
  market: "Mexico",
  flow: "retailCustomer",
  provider: "oxxo",
  label: "Oxxo (voucher de pago en efectivo)",
};

const mexicoOxxoSubscriptionCases: PaymentCase[] = [
  {
    id: "CP-135",
    market: "Mexico",
    flow: "brandPartner",
    provider: "oxxo",
    label: "Oxxo + Deferred Payment",
  },
  {
    id: "CP-136",
    market: "Mexico",
    flow: "subscriptionCustomer",
    provider: "oxxo",
    label: "Oxxo + Deferred Payment",
  },
];

// ═══════════════════════════ ALEMANIA ═══════════════════════════

const GERMANY_TEST_IBAN = "DE89370400440532013000";
const germanyBankDetails: PaymentCaseBankDetails = {
  ownerName: "Test DE Account",
  iban: GERMANY_TEST_IBAN,
};

const germanyFlowStart: [PaymentFlow, number][] = [
  ["brandPartner", 137],
  ["subscriptionCustomer", 143],
  ["retailCustomer", 149],
];

const germanyCases: PaymentCase[] = germanyFlowStart.flatMap(
  ([flow, start]) => [
    {
      id: `CP-${String(start).padStart(3, "0")}`,
      market: "Germany",
      flow,
      provider: "Adyen" as const,
      label: "Adyen (Alternative Zahlungsmethoden) - Karte normal",
      card: ADYEN_NORMAL,
    },
    {
      id: `CP-${String(start + 1).padStart(3, "0")}`,
      market: "Germany",
      flow,
      provider: "Adyen" as const,
      label: "Adyen (Alternative Zahlungsmethoden) - Karte 3DS",
      card: ADYEN_3DS,
      needs3ds: true,
    },
    {
      id: `CP-${String(start + 2).padStart(3, "0")}`,
      market: "Germany",
      flow,
      provider: "sofort" as const,
      label: "Sofortüberweisung (bloqueado: problema de backend conocido)",
    },
    {
      id: `CP-${String(start + 3).padStart(3, "0")}`,
      market: "Germany",
      flow,
      provider: "sepaDirectDebit" as const,
      label: "SEPA Lastschrift",
      bankDetails: germanyBankDetails,
    },
    {
      id: `CP-${String(start + 4).padStart(3, "0")}`,
      market: "Germany",
      flow,
      provider: "klarna" as const,
      label: "Sofort bezahlen mit Klarna",
    },
    {
      id: `CP-${String(start + 5).padStart(3, "0")}`,
      market: "Germany",
      flow,
      provider: "GlobalCollect" as const,
      label:
        "Bank Draft (GlobalCollect) (bloqueado: problema de backend conocido)",
      bankDetails: germanyBankDetails,
    },
  ],
);

// ═══════════════════════════ HUNGRÍA ═══════════════════════════

const hungaryFlowStart: [PaymentFlow, number][] = [
  ["brandPartner", 155],
  ["subscriptionCustomer", 163],
  ["retailCustomer", 171],
];

const hungaryBraintreeCases: PaymentCase[] = hungaryFlowStart.flatMap(
  ([flow, start]) =>
    usaCombos.map((c, i) => ({
      id: `CP-${String(start + i).padStart(3, "0")}`,
      market: "Hungary",
      flow,
      provider: "Braintree" as const,
      label: c.label,
      card: c.card,
    })),
);

const hungaryAdyenCases: PaymentCase[] = hungaryFlowStart.flatMap(
  ([flow, start]) => [
    {
      id: `CP-${String(start + 5).padStart(3, "0")}`,
      market: "Hungary",
      flow,
      provider: "Adyen" as const,
      label: "Adyen (Alternatív fizetési módok) - Kártya normal",
      card: ADYEN_NORMAL,
    },
    {
      id: `CP-${String(start + 6).padStart(3, "0")}`,
      market: "Hungary",
      flow,
      provider: "Adyen" as const,
      label: "Adyen (Alternatív fizetési módok) - Kártya 3DS",
      card: ADYEN_3DS,
      needs3ds: true,
    },
  ],
);

const hungaryPayPalCases: PaymentCase[] = hungaryFlowStart.map(
  ([flow, start]) => ({
    id: `CP-${String(start + 7).padStart(3, "0")}`,
    market: "Hungary",
    flow,
    provider: "BraintreeWithPayPal" as const,
    label: "PayPal",
  }),
);

// ═══════════════════════════ REINO UNIDO ═══════════════════════════

const ukFlowStart: [PaymentFlow, number][] = [
  ["brandPartner", 179],
  ["subscriptionCustomer", 188],
  ["retailCustomer", 197],
];

const ukBraintreeCases: PaymentCase[] = ukFlowStart.flatMap(([flow, start]) =>
  usaCombos.map((c, i) => ({
    id: `CP-${String(start + i).padStart(3, "0")}`,
    market: "United Kingdom",
    flow,
    provider: "Braintree" as const,
    label: c.label,
    card: c.card,
  })),
);

const ukAdyenCases: PaymentCase[] = ukFlowStart.flatMap(([flow, start]) => [
  {
    id: `CP-${String(start + 5).padStart(3, "0")}`,
    market: "United Kingdom",
    flow,
    provider: "Adyen" as const,
    label: "Adyen (Alternative Payments) - Card normal",
    card: ADYEN_NORMAL,
  },
  {
    id: `CP-${String(start + 6).padStart(3, "0")}`,
    market: "United Kingdom",
    flow,
    provider: "Adyen" as const,
    label: "Adyen (Alternative Payments) - Card 3DS",
    card: ADYEN_3DS,
    needs3ds: true,
  },
]);

const ukPayPalCases: PaymentCase[] = ukFlowStart.map(([flow, start]) => ({
  id: `CP-${String(start + 7).padStart(3, "0")}`,
  market: "United Kingdom",
  flow,
  provider: "BraintreeWithPayPal" as const,
  label: "PayPal",
}));

const ukKlarnaCases: PaymentCase[] = ukFlowStart.map(([flow, start]) => ({
  id: `CP-${String(start + 8).padStart(3, "0")}`,
  market: "United Kingdom",
  flow,
  provider: "klarna" as const,
  label: "Pay now with Klarna",
}));

// ═══════════════════════════ ESPAÑA ═══════════════════════════

const spainBankDetails: PaymentCaseBankDetails = {
  ownerName: "Test ES Account",
  iban: "ES9121000418450200051332", // IBAN de prueba estándar español (checksum válido)
};

const spainFlowStart: [PaymentFlow, number][] = [
  ["brandPartner", 206],
  ["subscriptionCustomer", 215],
  ["retailCustomer", 224],
];

const spainBraintreeCases: PaymentCase[] = spainFlowStart.flatMap(
  ([flow, start]) =>
    usaCombos.map((c, i) => ({
      id: `CP-${String(start + i).padStart(3, "0")}`,
      market: "Spain",
      flow,
      provider: "Braintree" as const,
      label: c.label,
      card: c.card,
    })),
);

const spainAdyenCases: PaymentCase[] = spainFlowStart.flatMap(
  ([flow, start]) => [
    {
      id: `CP-${String(start + 5).padStart(3, "0")}`,
      market: "Spain",
      flow,
      provider: "Adyen" as const,
      label: "Adyen (Opciones de pago alternativas) - Tarjeta normal",
      card: ADYEN_NORMAL,
    },
    {
      id: `CP-${String(start + 6).padStart(3, "0")}`,
      market: "Spain",
      flow,
      provider: "Adyen" as const,
      label: "Adyen (Opciones de pago alternativas) - Tarjeta 3DS",
      card: ADYEN_3DS,
      needs3ds: true,
    },
  ],
);

const spainPayPalCases: PaymentCase[] = spainFlowStart.map(([flow, start]) => ({
  id: `CP-${String(start + 7).padStart(3, "0")}`,
  market: "Spain",
  flow,
  provider: "BraintreeWithPayPal" as const,
  label: "PayPal",
}));

const spainSepaCases: PaymentCase[] = spainFlowStart.map(([flow, start]) => ({
  id: `CP-${String(start + 8).padStart(3, "0")}`,
  market: "Spain",
  flow,
  provider: "sepaDirectDebit" as const,
  label: "SEPA Débito directo",
  bankDetails: spainBankDetails,
}));

export const paymentCases: PaymentCase[] = [
  ...hongKongCases,
  ...taiwanCases,
  ...malaysiaCases,
  ...malaysiaWalletCases,
  ...singaporeCases,
  ...singaporeAdyenCases,
  singaporeAtomeCase,
  ...usaBraintreeCases,
  ...usaPayPalCases,
  ...usaAdyenCases,
  usaGPayCase,
  ...canadaBraintreeCases,
  canadaPayPalCase,
  ...mexicoBraintreeCases,
  ...mexicoPayPalCases,
  ...mexicoAdyenCases,
  mexicoOxxoCase,
  ...mexicoOxxoSubscriptionCases,
  ...germanyCases,
  ...hungaryBraintreeCases,
  ...hungaryAdyenCases,
  ...hungaryPayPalCases,
  ...ukBraintreeCases,
  ...ukAdyenCases,
  ...ukPayPalCases,
  ...ukKlarnaCases,
  ...spainBraintreeCases,
  ...spainAdyenCases,
  ...spainPayPalCases,
  ...spainSepaCases,
];

export function getPaymentCasesFor(
  marketName: string,
  flow: PaymentFlow,
): PaymentCase[] {
  const idFilter = process.env["CASES"]
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return paymentCases.filter(
    (c) =>
      c.market === marketName &&
      c.flow === flow &&
      (!idFilter || idFilter.length === 0 || idFilter.includes(c.id)),
  );
}
