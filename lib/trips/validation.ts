import { COUNTRY_CODES } from "@/types/profile";
import {
  BUDGET_LEVELS,
  TRIP_INTERESTS,
  TRIP_STATUSES,
  TRIP_STYLES,
  type TripInput,
} from "@/types/trip";

type Errors = Partial<Record<keyof TripInput, string>>;

function optionalText(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, maximum) : null;
}

function isRealIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isTripId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validateTripInput(value: unknown): { data?: TripInput; errors: Errors } {
  const errors: Errors = {};
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const country = typeof input.destination_country === "string" ? input.destination_country.toUpperCase() : "";
  const city = typeof input.destination_city === "string" ? input.destination_city.trim() : "";
  const startDate = typeof input.start_date === "string" ? input.start_date : "";
  const endDate = typeof input.end_date === "string" ? input.end_date : "";
  const travelers = Number(input.travelers_count);
  const style = input.trip_style;
  const budget = input.budget_level;
  const status = input.status ?? "planning";
  const interests = Array.isArray(input.interests)
    ? [...new Set(input.interests.filter((item): item is string => typeof item === "string"))]
    : [];

  if (!COUNTRY_CODES.includes(country as (typeof COUNTRY_CODES)[number])) errors.destination_country = "Selecione um país válido.";
  if (!city || city.length > 120) errors.destination_city = "Informe uma cidade com até 120 caracteres.";
  if (!isRealIsoDate(startDate)) errors.start_date = "Informe uma data de ida válida.";
  if (!isRealIsoDate(endDate)) errors.end_date = "Informe uma data de volta válida.";
  if (!errors.start_date && !errors.end_date && endDate < startDate) errors.end_date = "A volta não pode ser anterior à ida.";
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) errors.travelers_count = "Escolha entre 1 e 20 viajantes.";
  if (!TRIP_STYLES.includes(style as (typeof TRIP_STYLES)[number])) errors.trip_style = "Selecione um estilo de viagem.";
  if (!BUDGET_LEVELS.includes(budget as (typeof BUDGET_LEVELS)[number])) errors.budget_level = "Selecione uma faixa de orçamento.";
  if (!TRIP_STATUSES.includes(status as (typeof TRIP_STATUSES)[number])) errors.status = "Status inválido.";
  if (interests.length > TRIP_INTERESTS.length || interests.some((interest) => !TRIP_INTERESTS.includes(interest as (typeof TRIP_INTERESTS)[number]))) {
    errors.interests = "Existe um interesse inválido.";
  }

  if (Object.keys(errors).length) return { errors };

  return {
    errors,
    data: {
      title: optionalText(input.title, 120),
      destination_country: country,
      destination_city: city,
      start_date: startDate,
      end_date: endDate,
      accommodation_name: optionalText(input.accommodation_name, 160),
      accommodation_address: optionalText(input.accommodation_address, 240),
      travelers_count: travelers,
      trip_style: style as TripInput["trip_style"],
      budget_level: budget as TripInput["budget_level"],
      interests: interests as TripInput["interests"],
      notes: optionalText(input.notes, 2000),
      status: status as TripInput["status"],
    },
  };
}
