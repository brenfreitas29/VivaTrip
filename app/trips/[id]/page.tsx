import Link from "next/link";
import { notFound } from "next/navigation";
import { TripDetailActions } from "@/components/trips/trip-detail-actions";
import { ItineraryPlanner } from "@/components/itinerary/itinerary-planner";
import { TripsNav } from "@/components/trips/trips-nav";
import { PretripChecklist } from "@/components/pretrip/pretrip-checklist";
import { aiConfiguration } from "@/lib/ai/provider";
import { requireUser } from "@/lib/auth/require-user";
import { getItinerary } from "@/lib/itinerary/server";
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
  return (
    <main className="trips-page trip-detail-page"><TripsNav /><div className="trip-detail-shell"><Link className="trip-back" href="/trips">← Minhas viagens</Link><header className="trip-detail-hero"><div><span className={`trip-status ${status}`}>{statusLabels[status]}</span><p>{countryName(trip.destination_country)}</p><h1>{trip.title || trip.destination_city}</h1>{trip.title && <div className="trip-detail-city">{trip.destination_city}</div>}<div className="trip-detail-dates">{formatTripDates(trip.start_date, trip.end_date)} · {tripDuration(trip.start_date, trip.end_date)} dias</div></div><div className="trip-monogram">{trip.destination_city.slice(0, 3).toUpperCase()}</div></header>
      <section className="trip-facts"><article><span>Viajantes</span><strong>{trip.travelers_count}</strong></article><article><span>Estilo</span><strong>{trip.trip_style ? styleLabels[trip.trip_style] : "Não definido"}</strong></article><article><span>Orçamento</span><strong>{trip.budget_level ? budgetLabels[trip.budget_level] : "Não definido"}</strong></article><article><span>Estação aproximada</span><strong>{season === "unknown" ? "A confirmar" : { spring: "Primavera", summer: "Verão", autumn: "Outono", winter: "Inverno" }[season]}</strong></article></section>
      <section className="trip-detail-grid"><article><span className="detail-label">Hospedagem</span><h2>{trip.accommodation_name || "Ainda não informada"}</h2>{trip.accommodation_address && <p>{trip.accommodation_address}</p>}</article><article><span className="detail-label">Interesses</span><div className="detail-interests">{trip.interests.length ? trip.interests.map((interest) => <span key={interest}>{interestLabels[interest]}</span>) : <p>Nenhum interesse selecionado.</p>}</div></article>{trip.notes && <article className="wide"><span className="detail-label">Notas</span><p>{trip.notes}</p></article>}</section>
      <TripDetailActions trip={trip} /><ItineraryPlanner tripId={trip.id} initialItinerary={itinerary} season={season} aiConfigured={aiConfiguration().configured} /><PretripChecklist tripId={trip.id} initialItems={pretripItems} /></div></main>
  );
}
