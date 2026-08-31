export type Season = "spring" | "summer" | "autumn" | "winter" | "unknown";

const NORTHERN_COUNTRIES = new Set([
  "AT", "BE", "CA", "CH", "CN", "CZ", "DE", "DK", "ES", "FI", "FR", "GB",
  "GR", "HU", "IE", "IS", "IT", "JP", "KR", "NL", "NO", "PL", "PT", "SE", "US",
]);
const SOUTHERN_COUNTRIES = new Set(["AR", "AU", "CL", "NZ", "UY", "ZA"]);

export function countryHemisphere(countryCode: string): "north" | "south" | "unknown" {
  if (NORTHERN_COUNTRIES.has(countryCode)) return "north";
  if (SOUTHERN_COUNTRIES.has(countryCode)) return "south";
  return "unknown";
}

export function approximateSeason(countryCode: string, isoDate: string): Season {
  const hemisphere = countryHemisphere(countryCode);
  const month = Number(isoDate.slice(5, 7));
  if (hemisphere === "unknown" || month < 1 || month > 12) return "unknown";
  const north = month === 12 || month <= 2 ? "winter" : month <= 5 ? "spring" : month <= 8 ? "summer" : "autumn";
  if (hemisphere === "north") return north;
  return { winter: "summer", spring: "autumn", summer: "winter", autumn: "spring" }[north] as Season;
}

