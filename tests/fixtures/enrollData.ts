// ✅ Formatos de ID
export type NationalIdFormat = "digits8" | "malaysia-nric";

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

// ⚠️ México (Individuo)
export function formatMexicoCurp(idSeed: string): string {
  const seed = idSeed.slice(-12).padStart(12, "0");
  // 4 letras fijas + 6 dígitos (fecha) + 1 letra (sexo) + 2 letras (estado)
  // + 3 letras (consonantes) + 2 dígitos (homoclave/dígito verificador) = 18
  return `TEAJ${seed.slice(0, 6)}HDFRRN${seed.slice(6, 8)}`;
}

export function formatMexicoRfc(idSeed: string): string {
  const seed = idSeed.slice(-12).padStart(12, "0");
  // 4 letras fijas + 6 dígitos (fecha) + 3 caracteres de homoclave = 13
  return `TEAJ${seed.slice(0, 6)}${seed.slice(8, 11)}`;
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
  // ✅ Mexico (Individuo): CURP/RFC — inofensivo para el resto de mercados,
  // igual que "ssn", ya que nadie más los consume.
  const curp = formatMexicoCurp(idSeed);
  const rfc = formatMexicoRfc(idSeed);

  return {
    email: `jhoserjuarez${emailCounter}@test.com`,
    phone: phone,
    firstName: "Jhoser",
    lastName: "TestEnroll",

    birthMonth: "January",
    birthDay: "5",
    birthYear: "1990",

    ssn: ssn,
    curp: curp,
    rfc: rfc,
    idSeed: idSeed,
    username: `testuser${emailCounter}`,
    password: "TestEnroll!234",
  };
}
