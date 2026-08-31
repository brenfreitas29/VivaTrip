import { NextResponse } from "next/server";
import { getItinerary, itineraryDatabaseError, markUserEdited, validateItemInput } from "@/lib/itinerary/server";
import { getTrip } from "@/lib/trips/server";
import { createClient } from "@/lib/supabase/server";

async function context(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { supabase, user: null, trip: null, itinerary: null };
  const trip = await getTrip(supabase, data.user, id);
  const itinerary = trip ? await getItinerary(supabase, data.user, id) : null;
  return { supabase, user: data.user, trip, itinerary };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const state = await context((await params).id);
  if (!state.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!state.trip) return NextResponse.json({ error: "Viagem não encontrada." }, { status: 404 });
  return NextResponse.json({ itinerary: state.itinerary });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const state = await context((await params).id);
  if (!state.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!state.trip || !state.itinerary) return NextResponse.json({ error: "Roteiro não encontrado." }, { status: 404 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  try {
    if (!body || typeof body.action !== "string") throw new Error("Ação inválida.");
    const itinerary = state.itinerary;
    if (body.action === "update_itinerary") {
      const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
      const summary = typeof body.summary === "string" ? body.summary.trim().slice(0, 1500) : "";
      if (!title) throw new Error("Informe o título do roteiro.");
      if (!summary) throw new Error("Informe o resumo do roteiro.");
      const result = await state.supabase
        .from("itineraries")
        .update({ title, summary })
        .eq("id", itinerary.id)
        .eq("user_id", state.user.id);
      if (result.error) throw result.error;
    } else if (body.action === "update_day") {
      const day = itinerary.days.find((candidate) => candidate.id === body.dayId);
      if (!day) return NextResponse.json({ error: "Dia não encontrado." }, { status: 404 });
      const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
      const summary = typeof body.summary === "string" ? body.summary.trim().slice(0, 1000) || null : null;
      if (!title) throw new Error("Informe o título do dia.");
      const result = await state.supabase.from("itinerary_days").update({ title, summary }).eq("id", day.id).eq("itinerary_id", itinerary.id);
      if (result.error) throw result.error;
    } else if (body.action === "add_item") {
      const day = itinerary.days.find((candidate) => candidate.id === body.dayId);
      if (!day) return NextResponse.json({ error: "Dia não encontrado." }, { status: 404 });
      const item = validateItemInput(body.item);
      const position = day.items.reduce((max, current) => Math.max(max, current.position), -1) + 1;
      const result = await state.supabase.from("itinerary_items").insert({ ...item, itinerary_day_id: day.id, position });
      if (result.error) throw result.error;
    } else if (body.action === "update_item") {
      const current = itinerary.days.flatMap((day) => day.items).find((item) => item.id === body.itemId);
      if (!current) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
      const result = await state.supabase.from("itinerary_items").update(validateItemInput(body.item)).eq("id", current.id).eq("itinerary_day_id", current.itinerary_day_id);
      if (result.error) throw result.error;
    } else if (body.action === "delete_item") {
      const current = itinerary.days.flatMap((day) => day.items).find((item) => item.id === body.itemId);
      if (!current) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
      const result = await state.supabase.from("itinerary_items").delete().eq("id", current.id).eq("itinerary_day_id", current.itinerary_day_id);
      if (result.error) throw result.error;
    } else if (body.action === "reorder_items") {
      const day = itinerary.days.find((candidate) => candidate.id === body.dayId);
      const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds.filter((id): id is string => typeof id === "string") : [];
      if (!day || orderedIds.length !== day.items.length || new Set(orderedIds).size !== day.items.length || orderedIds.some((id) => !day.items.some((item) => item.id === id))) throw new Error("Ordem inválida.");
      for (let position = 0; position < orderedIds.length; position += 1) {
        const result = await state.supabase.from("itinerary_items").update({ position }).eq("id", orderedIds[position]).eq("itinerary_day_id", day.id);
        if (result.error) throw result.error;
      }
    } else throw new Error("Ação inválida.");
    await markUserEdited(state.supabase, itinerary.id);
    return NextResponse.json({ itinerary: await getItinerary(state.supabase, state.user, state.trip.id) });
  } catch (error) {
    return NextResponse.json({ error: itineraryDatabaseError(error) }, { status: 400 });
  }
}

