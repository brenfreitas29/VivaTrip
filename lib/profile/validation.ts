import {
  COUNTRY_CODES,
  PROFILE_CURRENCIES,
  PROFILE_LANGUAGES,
  TRAVEL_STYLES,
  type ProfileInput,
} from "@/types/profile";

const countryCodes = new Set<string>(COUNTRY_CODES);

function optionalCode(value: unknown) {
  const code = String(value ?? "").trim().toUpperCase();
  return code || null;
}

export function validateProfileInput(value: unknown) {
  const input = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const name = String(input.name ?? "").trim();
  const nationality = optionalCode(input.nationality);
  const passportCountry = optionalCode(input.passport_country);
  const countryOfResidence = optionalCode(input.country_of_residence);
  const preferredLanguage = String(input.preferred_language ?? "");
  const currency = String(input.currency ?? "");
  const homeAirport = optionalCode(input.home_airport);
  const travelStyle = String(input.travel_style ?? "");

  if (name.length < 2 || name.length > 100) errors.name = "Informe um nome entre 2 e 100 caracteres.";
  if (nationality && !countryCodes.has(nationality)) errors.nationality = "Selecione uma nacionalidade válida.";
  if (passportCountry && !countryCodes.has(passportCountry)) errors.passport_country = "Selecione o país emissor do passaporte.";
  if (countryOfResidence && !countryCodes.has(countryOfResidence)) errors.country_of_residence = "Selecione um país de residência válido.";
  if (!PROFILE_LANGUAGES.includes(preferredLanguage as never)) errors.preferred_language = "Selecione um idioma válido.";
  if (!PROFILE_CURRENCIES.includes(currency as never)) errors.currency = "Selecione uma moeda válida.";
  if (homeAirport && !/^[A-Z]{3}$/.test(homeAirport)) errors.home_airport = "Use um código IATA com 3 letras, como GRU.";
  if (!TRAVEL_STYLES.includes(travelStyle as never)) errors.travel_style = "Selecione um estilo de viagem válido.";

  if (Object.keys(errors).length) return { errors };

  const data: ProfileInput = {
    name,
    nationality,
    passport_country: passportCountry,
    country_of_residence: countryOfResidence,
    preferred_language: preferredLanguage as ProfileInput["preferred_language"],
    currency: currency as ProfileInput["currency"],
    home_airport: homeAirport,
    travel_style: travelStyle as ProfileInput["travel_style"],
  };

  return { data };
}
