import { NextResponse } from "next/server";
import { getOrCreateProfile, profileDatabaseError, updateProfile } from "@/lib/profile/server";
import { validateProfileInput } from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

async function authenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : data.user };
}

export async function GET() {
  const { supabase, user } = await authenticatedContext();

  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    return NextResponse.json({ profile: await getOrCreateProfile(supabase, user) });
  } catch (error) {
    return NextResponse.json({ error: profileDatabaseError(error) }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const { supabase, user } = await authenticatedContext();

  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const validation = validateProfileInput(await request.json().catch(() => null));

  if (!validation.data) {
    return NextResponse.json(
      { error: "Revise os campos destacados.", fields: validation.errors },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({ profile: await updateProfile(supabase, user, validation.data) });
  } catch (error) {
    return NextResponse.json({ error: profileDatabaseError(error) }, { status: 503 });
  }
}
