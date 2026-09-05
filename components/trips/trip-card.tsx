import Link from "next/link";
import { countryName, derivedTripStatus, formatTripDates, tripDuration } from "@/lib/trips/presentation";
import { destinationHeroImage } from "@/lib/trips/destination-images";
import type { Trip, TripStatus } from "@/types/trip";

const statusLabels: Record<TripStatus, string> = { planning: "Planejamento", upcoming: "Próxima viagem", ongoing: "Em andamento", completed: "Concluída" };

export function TripCard({ trip }: { trip: Trip }) {
  const status = derivedTripStatus(trip);
  const days = tripDuration(trip.start_date, trip.end_date);
  const image = destinationHeroImage(trip.destination_city, trip.destination_country);
  return (
    <article className="trip-card trip-card-photo">
      <div
        className="trip-card-cover"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(20,15,68,.08), rgba(20,15,68,.72)), url(${image.url})`, backgroundPosition: image.position || "center" }}
        aria-label={`Imagem de ${trip.destination_city}`}
      >
        <div className="trip-card-top"><span className={`trip-status ${status}`}>{statusLabels[status]}</span><span className="trip-travelers">{trip.travelers_count} {trip.travelers_count === 1 ? "viajante" : "viajantes"}</span></div>
        <div className="trip-card-destination"><span className="trip-country">{countryName(trip.destination_country)}</span><h2>{trip.title || trip.destination_city}</h2>{trip.title && <p className="trip-city">{trip.destination_city}</p>}</div>
      </div>
      <div className="trip-card-body">
        <p className="trip-dates">{formatTripDates(trip.start_date, trip.end_date)} <strong>· {days} {days === 1 ? "dia" : "dias"}</strong></p>
        <p className="trip-hotel">{trip.accommodation_name ? `⌂ ${trip.accommodation_name}` : "⌂ Hospedagem ainda não informada"}</p>
        <Link href={`/trips/${trip.id}`}>Abrir viagem <span>→</span></Link>
      </div>
    </article>
  );
}
