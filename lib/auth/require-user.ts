import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function requireUser(returnTo: string) {
  if (!isSupabaseConfigured()) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}&authError=configuration`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  return data.user;
}
