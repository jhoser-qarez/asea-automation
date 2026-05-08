export function generateEnrollData() {
  const timestamp = Date.now().toString();

  const emailCounter = timestamp.slice(-8); // últimos 8 dígitos

  // ✅ Teléfono de 10 dígitos: 90 + últimos 8 dígitos del timestamp
  const phone = `90${timestamp.slice(-8)}`; // ej: 9082917593
  const ssn = `9${timestamp.slice(-8)}`;
  return {
    email: `jhoserjuarez${emailCounter}@test.com`,
    phone: phone,
    firstName: "Jhoser",
    lastName: "TestEnroll",

    birthMonth: "January",
    birthDay: "5",
    birthYear: "1990",
    //ssn: ssn,
    username: `testuser${emailCounter}`,
    password: "TestEnroll!234",
  };
}
