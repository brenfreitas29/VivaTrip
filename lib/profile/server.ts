import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile, ProfileInput } from "@/types/profile";

const PROFILE_COLUMNS = "id,user_id,name,email,nationality,passport_country,country_of_residence,preferred_language,currency,home_airport,travel_style,created_at,updated_at";

export async function getOrCreateProfile(supabase: SupabaseClient, user: User): Promise<Profile> {
  const existing = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as Profile;

  const fallbackName = user.email?.split("@")[0] ?? "Viajante";
  const created = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      email: user.email ?? null,
      name: String(user.user_metadata.full_name || fallbackName),
      preferred_language: "pt",
      currency: "USD",
      travel_style: "moderate",
    })
    .select(PROFILE_COLUMNS)
    .single();

  if (!created.error) return created.data as Profile;

  if (created.error.code === "23505") {
    const concurrent = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("user_id", user.id)
      .single();
    if (!concurrent.error) return concurrent.data as Profile;
  }

  throw created.error;
}

export async function updateProfile(
  supabase: SupabaseClient,
  user: User,
  input: ProfileInput,
): Promise<Profile> {
  await getOrCreateProfile(supabase, user);

  const updated = await supabase
    .from("profiles")
    .update(input)
    .eq("user_id", user.id)
    .select(PROFILE_COLUMNS)
    .single();

  if (updated.error) throw updated.error;
  return updated.data as Profile;
}

export function profileDatabaseError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";

  if (["42P01", "PGRST205"].includes(code)) {
    return "O banco de perfis ainda precisa receber a migração da Fase 1C.";
  }

  return "Não foi possível acessar seu perfil agora. Tente novamente.";
}
