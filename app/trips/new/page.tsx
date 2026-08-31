import Link from "next/link";
import { TripForm } from "@/components/trips/trip-form";
import { TripsNav } from "@/components/trips/trips-nav";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function NewTripPage() {
  await requireUser("/trips/new");
  return <main className="trips-page"><TripsNav /><header className="trip-form-page-header"><Link href="/trips">← Minhas viagens</Link><span className="auth-eyebrow">Novo destino</span><h1>Crie sua viagem</h1><p>Comece pelo essencial. Você poderá ajustar tudo quando quiser.</p></header><TripForm /></main>;
}

