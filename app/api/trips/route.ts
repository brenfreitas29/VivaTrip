import { NextResponse } from "next/server";
import { createTrip, listTrips, tripDatabaseError } from "@/lib/trips/server";
import { validateTripInput } from "@/lib/trips/validation";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : data.user };
}

export async function GET() {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  try {
    return NextResponse.json({ trips: await listTrips(supabase, user) });
  } catch (error) {
    return NextResponse.json({ error: tripDatabaseError(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const validation = validateTripInput(await request.json().catch(() => null));
  if (!validation.data) return NextResponse.json({ error: "Revise os campos destacados.", fields: validation.errors }, { status: 400 });
  try {
    return NextResponse.json({ trip: await createTrip(supabase, user, validation.data) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: tripDatabaseError(error) }, { status: 503 });
  }
}

