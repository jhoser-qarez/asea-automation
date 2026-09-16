// ✅ Formatos de ID de gobierno confirmados por mercado — cada uno valida
// un patrón distinto en el campo real (Hong Kong: Checkout, id=
// "GovermentId"; Malaysia: mismo campo, checkoutVariant "asia" también).
// "digits8" es el default (compatible con lo que ya usa Hong Kong).
export type NationalIdFormat = "digits8" | "malaysia-nric";

// ✅ Da formato a un seed numérico crudo (12 dígitos, ver idSeed abajo)
// según el formato de ID que exige cada mercado. Recibe el seed en vez de
// generarlo de cero para que la unicidad por corrida (basada en timestamp)
// se mantenga sin importar el formato final.
export function formatNationalId(
  idSeed: string,
  format: NationalIdFormat = "digits8",
): string {
  const seed = idSeed.slice(-12).padStart(12, "0");

  switch (format) {
    case "malaysia-nric":
      // ⚠️ Malaysia confirmado: formato NRIC "123456-12-1234"
      // (6 dígitos - 2 dígitos - 4 dígitos, 12 en total).
      return `${seed.slice(0, 6)}-${seed.slice(6, 8)}-${seed.slice(8, 12)}`;
    case "digits8":
    default:
      // ⚠️ Hong Kong confirmado: 8 números, O 2 letras + 8 números, O 1
      // letra + 9 números. "9" + 8 dígitos (9 dígitos) no calzaba con
      // ninguno — se usa 8 dígitos exactos (el primero de los 3 formatos).
      return seed.slice(-8);
  }
}

export function generateEnrollData() {
  const timestamp = Date.now().toString();

  const emailCounter = timestamp.slice(-8); // últimos 8 dígitos

  // Teléfono de 10 dígitos: 90 + últimos 8 dígitos del timestamp
  const phone = `90${timestamp.slice(-8)}`;

  // ✅ Seed crudo de 12 dígitos, suficiente para cualquier formato de ID
  // (ver formatNationalId arriba) — mantiene la unicidad por corrida sin
  // atarse a un formato específico acá.
  const idSeed = timestamp.slice(-12).padStart(12, "0");
  // Compatibilidad hacia atrás: quien ya usaba `.ssn` (Hong Kong) sigue
  // recibiendo el formato "digits8" tal cual.
  const ssn = formatNationalId(idSeed, "digits8");

  return {
    email: `jhoserjuarez${emailCounter}@test.com`,
    phone: phone,
    firstName: "Jhoser",
    lastName: "TestEnroll",

    birthMonth: "January",
    birthDay: "5",
    birthYear: "1990",
    // ✅ Descomentado: Hong Kong (Asia) SÍ requiere este campo ("身分證號碼 *",
    // ID de gobierno — asterisco de obligatorio confirmado en el checkout
    // real). US lo dejaba comentado porque su propio flujo no lo necesita
    // (EnrollCheckoutPage.completeEnrollCheckout tiene fillSSN() comentado);
    // agregar el campo acá es inofensivo para US ya que nadie lo consume.
    ssn: ssn,
    idSeed: idSeed,
    username: `testuser${emailCounter}`,
    password: "TestEnroll!234",
  };
}
