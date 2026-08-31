import Link from "next/link";
import { TripCard } from "@/components/trips/trip-card";
import { TripsNav } from "@/components/trips/trips-nav";
import { requireUser } from "@/lib/auth/require-user";
import { listTrips, tripDatabaseError } from "@/lib/trips/server";
import { createClient } from "@/lib/supabase/server";
import type { Trip } from "@/types/trip";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const user = await requireUser("/trips");
  const supabase = await createClient();
  let trips: Trip[] = [];
  let error = "";
  try { trips = await listTrips(supabase, user); } catch (loadError) { error = tripDatabaseError(loadError); }
  return (
    <main className="trips-page">
      <TripsNav />
      <header className="trips-header"><div><span className="auth-eyebrow">Seu mundo organizado</span><h1>Minhas viagens</h1><p>Planeje, acompanhe e guarde cada detalhe das suas próximas experiências.</p></div><Link className="primary-trip-action" href="/trips/new">+ Nova viagem</Link></header>
      {error ? <div className="trips-error" role="alert">{error}</div> : trips.length ? <section className="trips-grid" aria-label="Suas viagens">{trips.map((trip) => <TripCard trip={trip} key={trip.id} />)}</section> : <section className="trips-empty"><span>✦</span><h2>Sua próxima viagem começa aqui.</h2><p>Crie sua primeira viagem para organizar datas, hospedagem e tudo que importa em um só lugar.</p><Link className="primary-trip-action" href="/trips/new">Criar minha primeira viagem</Link></section>}
    </main>
  );
}
