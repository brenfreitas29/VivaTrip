import Link from "next/link";
import { TripsNav } from "@/components/trips/trips-nav";

export default function TripNotFound() {
  return (
    <main className="trips-page">
      <TripsNav />
      <section className="trips-empty trip-not-found">
        <span>?</span>
        <h1>Viagem não encontrada</h1>
        <p>Ela pode ter sido excluída ou não pertencer à sua conta.</p>
        <Link className="primary-trip-action" href="/trips">Voltar para minhas viagens</Link>
      </section>
    </main>
  );
}
