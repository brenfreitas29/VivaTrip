import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ITINERARY_CATEGORIES, ITINERARY_PERIODS, type Itinerary, type ItineraryItem } from "@/types/itinerary";

const ITINERARY_SELECT = `id,trip_id,user_id,title,summary,generation_status,has_user_edits,generation_version,generated_at,created_at,updated_at,days:itinerary_days(id,itinerary_id,day_number,date,title,summary,notes,created_at,updated_at,items:itinerary_items(id,itinerary_day_id,position,period,start_time,end_time,title,description,location_name,location_address,category,estimated_duration_minutes,estimated_cost,currency,notes,created_at,updated_at))`;

export async function getItinerary(supabase: SupabaseClient, user: User, tripId: string): Promise<Itinerary | null> {
  const result = await supabase.from("itineraries").select(ITINERARY_SELECT).eq("trip_id", tripId).eq("user_id", user.id).maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return null;
  const itinerary = result.data as unknown as Itinerary;
  itinerary.days = (itinerary.days || []).sort((a, b) => a.day_number - b.day_number).map((day) => ({ ...day, items: (day.items || []).sort((a, b) => a.position - b.position) }));
  return itinerary;
}

export async function markUserEdited(supabase: SupabaseClient, itineraryId: string) {
  const result = await supabase.from("itineraries").update({ has_user_edits: true }).eq("id", itineraryId);
  if (result.error) throw result.error;
}

function optionalText(value: unknown, maximum: number) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("Campo de texto inválido.");
  const clean = value.trim();
  if (!clean || clean.length > maximum) throw new Error("Campo de texto inválido.");
  return clean;
}

export function validateItemInput(value: unknown): Omit<ItineraryItem, "id" | "itinerary_day_id" | "position" | "created_at" | "updated_at"> {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  if (!ITINERARY_PERIODS.includes(input.period as never) || !ITINERARY_CATEGORIES.includes(input.category as never)) throw new Error("Período ou categoria inválidos.");
  const title = optionalText(input.title, 160);
  if (!title) throw new Error("Informe o título da atividade.");
  const start = optionalText(input.start_time, 5);
  const end = optionalText(input.end_time, 5);
  if ((start && !/^([01]\d|2[0-3]):[0-5]\d$/.test(start)) || (end && !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) || (start && end && end < start)) throw new Error("Horário inválido.");
  const duration = input.estimated_duration_minutes === null || input.estimated_duration_minutes === undefined ? null : Number(input.estimated_duration_minutes);
  if (duration !== null && (!Number.isInteger(duration) || duration < 15 || duration > 720)) throw new Error("Duração inválida.");
  return { period: input.period as ItineraryItem["period"], start_time: start, end_time: end, title, description: optionalText(input.description, 1200), location_name: optionalText(input.location_name, 200), location_address: optionalText(input.location_address, 300), category: input.category as ItineraryItem["category"], estimated_duration_minutes: duration, estimated_cost: null, currency: null, notes: optionalText(input.notes, 800) };
}

export function itineraryDatabaseError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message = error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String(error.message) : "";
  if (["42P01", "PGRST205"].includes(code)) return "O banco de roteiros ainda precisa receber a migração da Fase 2A.";
  if (message.includes("generation_in_progress")) return "Um roteiro já está sendo criado para esta viagem.";
  return message || "Não foi possível acessar o roteiro agora.";
}

