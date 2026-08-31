import Link from "next/link";
import { countryName, derivedTripStatus, formatTripDates, tripDuration } from "@/lib/trips/presentation";
import type { Trip, TripStatus } from "@/types/trip";

const statusLabels: Record<TripStatus, string> = { planning: "Planejamento", upcoming: "Próxima viagem", ongoing: "Em andamento", completed: "Concluída" };

export function TripCard({ trip }: { trip: Trip }) {
  const status = derivedTripStatus(trip);
  const days = tripDuration(trip.start_date, trip.end_date);
  return (
    <article className="trip-card">
      <div className="trip-card-top"><span className={`trip-status ${status}`}>{statusLabels[status]}</span><span>{trip.travelers_count} {trip.travelers_count === 1 ? "viajante" : "viajantes"}</span></div>
      <div><span className="trip-country">{countryName(trip.destination_country)}</span><h2>{trip.title || trip.destination_city}</h2>{trip.title && <p className="trip-city">{trip.destination_city}</p>}</div>
      <p className="trip-dates">{formatTripDates(trip.start_date, trip.end_date)} <strong>· {days} {days === 1 ? "dia" : "dias"}</strong></p>
      <p className="trip-hotel">{trip.accommodation_name ? `Hotel: ${trip.accommodation_name}` : "Hospedagem ainda não informada"}</p>
      <Link href={`/trips/${trip.id}`}>Ver viagem <span>→</span></Link>
    </article>
  );
}

