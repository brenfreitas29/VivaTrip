import { NextResponse } from "next/server";
import { aiConfiguration, AIConfigurationError, AIProviderError } from "@/lib/ai/provider";
import { generateItinerary } from "@/lib/ai/itinerary";
import { getItinerary, itineraryDatabaseError } from "@/lib/itinerary/server";
import { getOrCreateProfile } from "@/lib/profile/server";
import { getTrip } from "@/lib/trips/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Sua sessão expirou. Entre novamente.", code: "UNAUTHENTICATED" }, { status: 401 });

  const tripId = (await params).id;
  const trip = await getTrip(supabase, data.user, tripId);
  if (!trip) return NextResponse.json({ error: "Viagem não encontrada." }, { status: 404 });
  if (!aiConfiguration().configured) {
    return NextResponse.json({
      error: "A VivaTrip AI ainda precisa ser configurada pelo administrador.",
      code: "AI_NOT_CONFIGURED",
    }, { status: 503 });
  }

  let claimed = false;
  try {
    const claim = await supabase.rpc("claim_itinerary_generation", { p_trip_id: tripId });
    if (claim.error) throw claim.error;
    claimed = true;

    const profile = await getOrCreateProfile(supabase, data.user);
    const generated = await generateItinerary(trip, profile);

    const completed = await supabase.rpc("complete_itinerary_generation", {
      p_trip_id: tripId,
      p_title: generated.title,
      p_summary: generated.summary,
      p_days: generated.days,
    });
    if (completed.error) throw completed.error;

    const itinerary = await getItinerary(supabase, data.user, tripId);
    if (!itinerary) throw new Error("O roteiro foi gerado, mas não pôde ser carregado.");
    return NextResponse.json({ itinerary }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (claimed) {
      // Best effort: restores the previous ready itinerary after a failed regeneration,
      // or marks a first generation as failed.
      await supabase.rpc("fail_itinerary_generation", { p_trip_id: tripId });
    }

    const message = itineraryDatabaseError(error);
    const status = error instanceof AIConfigurationError
      ? 503
      : message.includes("já está sendo")
        ? 409
        : error instanceof AIProviderError && error.code === "timeout"
          ? 504
          : 502;

    return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
