import type { Trip, TripStatus } from "@/types/trip";

const DAY = 86_400_000;

export function tripDuration(startDate: string, endDate: string) {
  return Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / DAY) + 1;
}

export function derivedTripStatus(trip: Pick<Trip, "start_date" | "end_date" | "status">, today = new Date()): TripStatus {
  const current = today.toISOString().slice(0, 10);
  if (trip.end_date < current) return "completed";
  if (trip.start_date <= current && trip.end_date >= current) return "ongoing";
  if (trip.start_date > current) return "upcoming";
  return trip.status;
}

export function formatTripDates(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return `${formatter.format(new Date(`${startDate}T00:00:00Z`))} – ${formatter.format(new Date(`${endDate}T00:00:00Z`))}`;
}

export function countryName(countryCode: string) {
  return new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(countryCode) || countryCode;
}

