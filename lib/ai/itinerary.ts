import { getAIProvider } from "@/lib/ai/provider";
import { ITINERARY_SYSTEM_PROMPT, sanitizePromptText } from "@/lib/ai/prompts/itinerary";
import { validateGeneratedItinerary } from "@/lib/ai/schemas";
import { tripDuration } from "@/lib/trips/presentation";
import { approximateSeason } from "@/lib/trips/season";
import type { Profile } from "@/types/profile";
import type { Trip } from "@/types/trip";

function itineraryDates(start: string, count: number) {
  const first = new Date(`${start}T00:00:00Z`);
  return Array.from({ length: count }, (_, index) => new Date(first.getTime() + index * 86_400_000).toISOString().slice(0, 10));
}

export async function generateItinerary(trip: Trip, profile: Profile) {
  const dayCount = tripDuration(trip.start_date, trip.end_date);
  const dates = itineraryDates(trip.start_date, dayCount);
  const season = approximateSeason(trip.destination_country, trip.start_date);
  const input = {
    dataBoundary: "BEGIN_UNTRUSTED_TRAVEL_DATA",
    destination: { countryCode: trip.destination_country, city: sanitizePromptText(trip.destination_city, 120) },
    dates: { start: trip.start_date, end: trip.end_date, dayCount, exactDates: dates },
    accommodation: { name: sanitizePromptText(trip.accommodation_name, 160), addressContext: sanitizePromptText(trip.accommodation_address, 240) },
    travelersCount: trip.travelers_count,
    travelStyle: trip.trip_style || profile.travel_style || "moderate",
    budgetLevel: trip.budget_level || "moderate",
    interests: trip.interests,
    tripNotes: sanitizePromptText(trip.notes),
    preferredLanguage: profile.preferred_language,
    preferredCurrency: profile.currency,
    season: season === "unknown" ? null : season,
    dataBoundaryEnd: "END_UNTRUSTED_TRAVEL_DATA",
  };
  const raw = await getAIProvider().generateStructuredItinerary(ITINERARY_SYSTEM_PROMPT, input);
  return validateGeneratedItinerary(raw, dates);
}

