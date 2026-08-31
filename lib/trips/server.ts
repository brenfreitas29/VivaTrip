import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Trip, TripInput } from "@/types/trip";

export const TRIP_COLUMNS = "id,user_id,title,destination_country,destination_city,start_date,end_date,accommodation_name,accommodation_address,travelers_count,trip_style,budget_level,interests,notes,status,created_at,updated_at";

export async function listTrips(supabase: SupabaseClient, user: User): Promise<Trip[]> {
  const result = await supabase.from("trips").select(TRIP_COLUMNS).eq("user_id", user.id).order("start_date", { ascending: true });
  if (result.error) throw result.error;
  return result.data as Trip[];
}

export async function getTrip(supabase: SupabaseClient, user: User, id: string): Promise<Trip | null> {
  const result = await supabase.from("trips").select(TRIP_COLUMNS).eq("id", id).eq("user_id", user.id).maybeSingle();
  if (result.error) throw result.error;
  return result.data as Trip | null;
}

export async function createTrip(supabase: SupabaseClient, user: User, input: TripInput): Promise<Trip> {
  const result = await supabase.from("trips").insert({ ...input, user_id: user.id }).select(TRIP_COLUMNS).single();
  if (result.error) throw result.error;
  return result.data as Trip;
}

export async function updateTrip(supabase: SupabaseClient, user: User, id: string, input: TripInput): Promise<Trip | null> {
  const result = await supabase.from("trips").update(input).eq("id", id).eq("user_id", user.id).select(TRIP_COLUMNS).maybeSingle();
  if (result.error) throw result.error;
  return result.data as Trip | null;
}

export async function deleteTrip(supabase: SupabaseClient, user: User, id: string) {
  const result = await supabase.from("trips").delete().eq("id", id).eq("user_id", user.id).select("id").maybeSingle();
  if (result.error) throw result.error;
  return Boolean(result.data);
}

export function tripDatabaseError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (["42P01", "PGRST205"].includes(code)) return "O banco de viagens ainda não está configurado corretamente.";
  if (code === "42501") return "Sua sessão não tem permissão para alterar esta viagem. Entre novamente e tente de novo.";
  if (code === "23514" || code === "23502") return "Alguns dados da viagem não são válidos. Revise os campos e tente novamente.";
  if (code === "PGRST116") return "Viagem não encontrada ou sem permissão de acesso.";
  return "Não foi possível acessar suas viagens agora. Tente novamente.";
}

