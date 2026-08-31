import { NextResponse } from "next/server";
import { deleteTrip, getTrip, tripDatabaseError, updateTrip } from "@/lib/trips/server";
import { isTripId, validateTripInput } from "@/lib/trips/validation";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : data.user };
}

async function tripId(params: Promise<{ id: string }>) {
  const { id } = await params;
  return isTripId(id) ? id : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const id = await tripId(params);
  if (!id) return NextResponse.json({ error: "Identificador de viagem inválido." }, { status: 400 });
  try {
    const trip = await getTrip(supabase, user, id);
    return trip ? NextResponse.json({ trip }) : NextResponse.json({ error: "Viagem não encontrada." }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: tripDatabaseError(error) }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const id = await tripId(params);
  if (!id) return NextResponse.json({ error: "Identificador de viagem inválido." }, { status: 400 });
  const validation = validateTripInput(await request.json().catch(() => null));
  if (!validation.data) return NextResponse.json({ error: "Revise os campos destacados.", fields: validation.errors }, { status: 400 });
  try {
    const trip = await updateTrip(supabase, user, id, validation.data);
    return trip ? NextResponse.json({ trip }) : NextResponse.json({ error: "Viagem não encontrada." }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: tripDatabaseError(error) }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const id = await tripId(params);
  if (!id) return NextResponse.json({ error: "Identificador de viagem inválido." }, { status: 400 });
  try {
    const deleted = await deleteTrip(supabase, user, id);
    return deleted ? NextResponse.json({ deleted: true }) : NextResponse.json({ error: "Viagem não encontrada." }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: tripDatabaseError(error) }, { status: 503 });
  }
}
