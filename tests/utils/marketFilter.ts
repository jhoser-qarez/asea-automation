import { MarketConfig, markets as allMarkets } from "../fixtures/marketData";

// ─────────────────────────────────────────────────────────────────────────
// Uso:
//   PowerShell:  $env:MARKETS="Thailand"; npx playwright test auth-subscription-by-market
//   Bash:        MARKETS=Thailand npx playwright test auth-subscription-by-market
//   Varios:      MARKETS="Germany,Austria" npx playwright test ...
// ─────────────────────────────────────────────────────────────────────────
export function getMarketsToRun(
  all: MarketConfig[] = allMarkets,
): MarketConfig[] {
  const filter = process.env["MARKETS"];
  if (!filter) return all;

  const wanted = filter
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

  const filtered = all.filter((market) =>
    wanted.includes(market.marketName.toLowerCase()),
  );

  if (filtered.length === 0) {
    console.warn(
      `⚠️ MARKETS="${filter}" no coincide con ningún mercado conocido. ` +
        `Disponibles: ${all.map((m) => m.marketName).join(", ")}`,
    );
  } else {
    console.log(
      `🌎 Corriendo en: ${filtered.map((m) => m.marketName).join(", ")}`,
    );
  }

  return filtered;
}
