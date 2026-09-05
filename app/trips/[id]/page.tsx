import Link from "next/link";
import { notFound } from "next/navigation";
import { TripDetailActions } from "@/components/trips/trip-detail-actions";
import { TripLiveContext } from "@/components/trips/trip-live-context";
import { TripRecommendations } from "@/components/monetization/trip-recommendations";
import { ItineraryPlanner } from "@/components/itinerary/itinerary-planner";
import { ItineraryRouteMap } from "@/components/itinerary/itinerary-route-map";
import { RainyDayReplanner } from "@/components/itinerary/rainy-day-replanner";
import { TripsNav } from "@/components/trips/trips-nav";
import { PretripChecklist } from "@/components/pretrip/pretrip-checklist";
import { aiConfiguration } from "@/lib/ai/provider";
import { requireUser } from "@/lib/auth/require-user";
import { getItinerary } from "@/lib/itinerary/server";
import { destinationHeroImage } from "@/lib/trips/destination-images";
import { countryName, derivedTripStatus, formatTripDates, tripDuration } from "@/lib/trips/presentation";
import { getTrip } from "@/lib/trips/server";
import { approximateSeason } from "@/lib/trips/season";
import { createClient } from "@/lib/supabase/server";
import { listPretripItems } from "@/lib/pretrip/server";
import type { BudgetLevel, TripInterest, TripStatus, TripStyle } from "@/types/trip";

export const dynamic = "force-dynamic";
const statusLabels: Record<TripStatus, string> = { planning: "Planejamento", upcoming: "Próxima viagem", ongoing: "Em andamento", completed: "Concluída" };
const styleLabels: Record<TripStyle, string> = { relaxed: "Tranquilo", moderate: "Moderado", intensive: "Intenso" };
const budgetLabels: Record<BudgetLevel, string> = { budget: "Econômico", moderate: "Moderado", comfort: "Conforto", luxury: "Luxo" };
const interestLabels: Record<TripInterest, string> = { culture: "Cultura", history: "História", food: "Gastronomia", nature: "Natureza", beaches: "Praias", nightlife: "Vida noturna", shopping: "Compras", photography: "Fotografia", adventure: "Aventura", relaxation: "Relaxamento", family: "Família", romantic: "Romântico" };

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/trips/${id}`);
  const supabase = await createClient();
  const trip = await getTrip(supabase, user, id);
  if (!trip) notFound();
  const itinerary = await getItinerary(supabase, user, id);
  const pretripItems = await listPretripItems(supabase, user, id).catch(() => []);
  const status = derivedTripStatus(trip);
  const season = approximateSeason(trip.destination_country, trip.start_date);
  const destinationCountry = countryName(trip.destination_country);
  const heroImage = destinationHeroImage(trip.destination_city, trip.destination_country);
  const ai = aiConfiguration();
  return (
    <main className="trips-page trip-detail-page"><TripsNav /><div className="trip-detail-shell"><Link className="trip-back" href="/trips">← Minhas viagens</Link><header className="trip-detail-hero trip-detail-photo-hero" style={{ "--trip-hero-image": `url("${heroImage.url}")`, "--trip-hero-position": heroImage.position || "center" } as React.CSSProperties}><div className="trip-hero-content"><span className={`trip-status ${status}`}>✈ {statusLabels[status]}</span><p>{destinationCountry}</p><h1>{trip.title || trip.destination_city}</h1>{trip.title && <div className="trip-detail-city">{trip.destination_city}</div>}<div className="trip-detail-dates">▣ {formatTripDates(trip.start_date, trip.end_date)} · {tripDuration(trip.start_date, trip.end_date)} dias</div></div><div className="trip-monogram trip-photo-code"><strong>{trip.destination_city.slice(0, 3).toUpperCase()}</strong><span>{trip.destination_city}</span></div></header>
      <section className="trip-facts"><article><span>Viajantes</span><strong>{trip.travelers_count}</strong></article><article><span>Estilo</span><strong>{trip.trip_style ? styleLabels[trip.trip_style] : "Não definido"}</strong></article><article><span>Orçamento</span><strong>{trip.budget_level ? budgetLabels[trip.budget_level] : "Não definido"}</strong></article><article><span>Estação aproximada</span><strong>{season === "unknown" ? "A confirmar" : { spring: "Primavera", summer: "Verão", autumn: "Outono", winter: "Inverno" }[season]}</strong></article></section>
      <section className="trip-detail-grid"><article><span className="detail-label">Hospedagem</span><h2>{trip.accommodation_name || "Ainda não informada"}</h2>{trip.accommodation_address && <p>{trip.accommodation_address}</p>}<small className="hotel-ai-note">A VivaTrip AI usa esta hospedagem como referência para organizar os dias e reduzir deslocamentos desnecessários.</small></article><article><span className="detail-label">Interesses</span><div className="detail-interests">{trip.interests.length ? trip.interests.map((interest) => <span key={interest}>{interestLabels[interest]}</span>) : <p>Nenhum interesse selecionado.</p>}</div></article>{trip.notes && <article className="wide"><span className="detail-label">Notas</span><p>{trip.notes}</p></article>}</section>
      <TripLiveContext city={trip.destination_city} countryCode={trip.destination_country} startDate={trip.start_date} endDate={trip.end_date} />
      <TripRecommendations city={trip.destination_city} country={destinationCountry} accommodation={trip.accommodation_address || trip.accommodation_name} />
      <TripDetailActions trip={trip} />
      <ItineraryPlanner tripId={trip.id} initialItinerary={itinerary} season={season} aiConfigured={ai.configured} />
      {itinerary?.days?.length ? <ItineraryRouteMap city={trip.destination_city} country={destinationCountry} accommodation={trip.accommodation_address || trip.accommodation_name} days={itinerary.days} /> : null}
      {itinerary?.days?.length ? <RainyDayReplanner tripId={trip.id} days={itinerary.days} aiConfigured={ai.configured} /> : null}
      <PretripChecklist tripId={trip.id} initialItems={pretripItems} trip={{ city: trip.destination_city, country: destinationCountry, startDate: trip.start_date, endDate: trip.end_date }} /></div></main>
  );
}
