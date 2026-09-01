import Link from "next/link";
import { TripForm } from "@/components/trips/trip-form";
import { TripsNav } from "@/components/trips/trips-nav";
import { requireUser } from "@/lib/auth/require-user";
import { COUNTRY_CODES } from "@/types/profile";

export const dynamic = "force-dynamic";

function normalizeCountry(value?: string) {
  if (!value) return "";
  const directCode = value.trim().toUpperCase();
  if (COUNTRY_CODES.includes(directCode as (typeof COUNTRY_CODES)[number])) return directCode;
  const names = new Intl.DisplayNames(["pt-BR"], { type: "region" });
  return COUNTRY_CODES.find((code) => names.of(code)?.localeCompare(value.trim(), "pt-BR", { sensitivity: "base" }) === 0) || "";
}

export default async function NewTripPage({ searchParams }: { searchParams: Promise<{ destination?: string; country?: string }> }) {
  await requireUser("/trips/new");
  const query = await searchParams;
  const destination = (query.destination || "").trim().slice(0, 120);
  const country = normalizeCountry(query.country);

  return (
    <main className="trips-page">
      <TripsNav />
      <header className="trip-form-page-header">
        <Link href="/trips">← Minhas viagens</Link>
        <span className="auth-eyebrow">Novo destino</span>
        <h1>{destination ? `Planeje sua viagem para ${destination}` : "Crie sua viagem"}</h1>
        <p>{destination ? "O destino escolhido no Explore já está preenchido. Complete datas e preferências para continuar." : "Comece pelo essencial. Você poderá ajustar tudo quando quiser."}</p>
      </header>
      <TripForm initialDestination={{ city: destination, country }} />
    </main>
  );
}
