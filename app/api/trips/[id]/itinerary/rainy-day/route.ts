import { NextResponse } from "next/server";
import { generateRainyDayPlan } from "@/lib/ai/rainy-day";
import { AIConfigurationError, AIProviderError } from "@/lib/ai/provider";
import { getItinerary, itineraryDatabaseError, markUserEdited } from "@/lib/itinerary/server";
import { getOrCreateProfile } from "@/lib/profile/server";
import { getTrip } from "@/lib/trips/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });

  const tripId = (await params).id;
  const trip = await getTrip(supabase, data.user, tripId);
  if (!trip) return NextResponse.json({ error: "Viagem não encontrada." }, { status: 404 });

  const itinerary = await getItinerary(supabase, data.user, tripId);
  if (!itinerary) return NextResponse.json({ error: "Gere o roteiro antes de adaptar um dia." }, { status: 404 });

  const body = await request.json().catch(() => null) as { dayId?: string; note?: string } | null;
  const day = itinerary.days.find((candidate) => candidate.id === body?.dayId);
  if (!day) return NextResponse.json({ error: "Dia do roteiro não encontrado." }, { status: 404 });

  try {
    const profile = await getOrCreateProfile(supabase, data.user);
    const generated = await generateRainyDayPlan(trip, profile, day, body?.note);

    const updateDay = await supabase
      .from("itinerary_days")
      .update({ title: generated.title, summary: generated.summary, notes: generated.notes })
      .eq("id", day.id)
      .eq("itinerary_id", itinerary.id);
    if (updateDay.error) throw updateDay.error;

    const removeItems = await supabase.from("itinerary_items").delete().eq("itinerary_day_id", day.id);
    if (removeItems.error) throw removeItems.error;

    if (generated.items.length) {
      const rows = generated.items.map((item, position) => ({
        itinerary_day_id: day.id,
        position,
        period: item.period,
        start_time: item.startTime,
        end_time: item.endTime,
        title: item.title,
        description: item.description,
        location_name: item.locationName,
        location_address: null,
        category: item.category,
        estimated_duration_minutes: item.estimatedDurationMinutes,
        estimated_cost: null,
        currency: null,
        notes: item.notes,
      }));
      const insertItems = await supabase.from("itinerary_items").insert(rows);
      if (insertItems.error) throw insertItems.error;
    }

    await markUserEdited(supabase, itinerary.id);
    const refreshed = await getItinerary(supabase, data.user, tripId);
    return NextResponse.json({ itinerary: refreshed }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = itineraryDatabaseError(error);
    const status = error instanceof AIConfigurationError
      ? 503
      : error instanceof AIProviderError && error.code === "timeout"
        ? 504
        : 502;
    return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
