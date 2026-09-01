"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/i18n/language-provider";
import { validateTripInput } from "@/lib/trips/validation";
import { COUNTRY_CODES } from "@/types/profile";
import { BUDGET_LEVELS, TRIP_INTERESTS, TRIP_STATUSES, TRIP_STYLES, type Trip, type TripInput } from "@/types/trip";

type Errors = Partial<Record<keyof TripInput, string>>;
type InitialDestination = { city?: string; country?: string };
const styleLabels = { relaxed: "Tranquilo", moderate: "Moderado", intensive: "Intenso" } as const;
const budgetLabels = { budget: "Econômico", moderate: "Moderado", comfort: "Conforto", luxury: "Luxo" } as const;
const statusLabels = { planning: "Planejamento", upcoming: "Próxima viagem", ongoing: "Em andamento", completed: "Concluída" } as const;
const interestLabels = { culture: "Cultura", history: "História", food: "Gastronomia", nature: "Natureza", beaches: "Praias", nightlife: "Vida noturna", shopping: "Compras", photography: "Fotografia", adventure: "Aventura", relaxation: "Relaxamento", family: "Família", romantic: "Romântico" } as const;

function initialTrip(trip?: Trip, destination?: InitialDestination): TripInput {
  if (trip) return { title: trip.title, destination_country: trip.destination_country, destination_city: trip.destination_city, start_date: trip.start_date, end_date: trip.end_date, accommodation_name: trip.accommodation_name, accommodation_address: trip.accommodation_address, travelers_count: trip.travelers_count, trip_style: trip.trip_style || "moderate", budget_level: trip.budget_level || "moderate", interests: trip.interests, notes: trip.notes, status: trip.status };
  return { title: null, destination_country: destination?.country || "", destination_city: destination?.city || "", start_date: "", end_date: "", accommodation_name: null, accommodation_address: null, travelers_count: 1, trip_style: "moderate", budget_level: "moderate", interests: [], notes: null, status: "planning" };
}

export function TripForm({ trip, onSaved, initialDestination }: { trip?: Trip; onSaved?: (trip: Trip) => void; initialDestination?: InitialDestination }) {
  const router = useRouter();
  const { localeTag } = useLanguage();
  const [form, setForm] = useState<TripInput>(() => initialTrip(trip, initialDestination));
  const [errors, setErrors] = useState<Errors>({}); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  const countries = useMemo(() => { const names = new Intl.DisplayNames([localeTag], { type: "region" }); return COUNTRY_CODES.map((code) => ({ code, name: names.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name, localeTag)); }, [localeTag]);
  function change<K extends keyof TripInput>(key: K, value: TripInput[K]) { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); setMessage(""); }
  function toggleInterest(interest: (typeof TRIP_INTERESTS)[number]) { change("interests", form.interests.includes(interest) ? form.interests.filter((item) => item !== interest) : [...form.interests, interest]); }
  function fieldError(key: keyof TripInput) { return errors[key] ? `${String(key)}-error` : undefined; }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return; const validation = validateTripInput(form);
    if (!validation.data) { setErrors(validation.errors); setMessage("Revise os campos destacados."); return; }
    setSaving(true); setMessage(""); setErrors({});
    try {
      const endpoint = trip ? `/api/trips/${trip.id}` : "/api/trips";
      const response = await fetch(endpoint, { method: trip ? "PUT" : "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(validation.data) });
      const body = (await response.json().catch(() => ({}))) as { trip?: Trip; error?: string; fields?: Errors };
      if (response.status === 401) { const next = trip ? `/trips/${trip.id}` : "/trips/new"; router.push(`/login?next=${encodeURIComponent(next)}`); return; }
      if (!response.ok || !body.trip) { setMessage(body.error || "Não foi possível salvar a viagem. Tente novamente."); setErrors(body.fields || {}); return; }
      if (onSaved) onSaved(body.trip); else router.push(`/trips/${body.trip.id}`); router.refresh();
    } catch { setMessage("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."); } finally { setSaving(false); }
  }
  return <form className="trip-form" onSubmit={submit} noValidate aria-busy={saving}>
    <section className="trip-form-section"><div className="trip-form-heading"><span>01</span><div><h2>Destino</h2><p>Onde será sua próxima história?</p></div></div><div className="trip-form-grid two">
      <label><span>País</span><select value={form.destination_country} onChange={(e) => change("destination_country", e.target.value)} required aria-invalid={Boolean(errors.destination_country)} aria-describedby={fieldError("destination_country")}><option value="">Selecionar país</option>{countries.map((country) => <option value={country.code} key={country.code}>{country.name}</option>)}</select>{errors.destination_country && <small id="destination_country-error">{errors.destination_country}</small>}</label>
      <label><span>Cidade</span><input value={form.destination_city} onChange={(e) => change("destination_city", e.target.value)} placeholder="Tóquio" maxLength={120} autoComplete="address-level2" required aria-invalid={Boolean(errors.destination_city)} aria-describedby={fieldError("destination_city")} />{errors.destination_city && <small id="destination_city-error">{errors.destination_city}</small>}</label>
      <label className="wide-field"><span>Nome da viagem <em>opcional</em></span><input value={form.title || ""} onChange={(e) => change("title", e.target.value || null)} placeholder="Ex.: Japão no outono" maxLength={120} /></label>
    </div></section>
    <section className="trip-form-section"><div className="trip-form-heading"><span>02</span><div><h2>Datas</h2><p>Defina o período da viagem.</p></div></div><div className="trip-form-grid two"><label><span>Ida</span><input type="date" value={form.start_date} onChange={(e) => change("start_date", e.target.value)} required aria-invalid={Boolean(errors.start_date)} aria-describedby={fieldError("start_date")} />{errors.start_date && <small id="start_date-error">{errors.start_date}</small>}</label><label><span>Volta</span><input type="date" min={form.start_date || undefined} value={form.end_date} onChange={(e) => change("end_date", e.target.value)} required aria-invalid={Boolean(errors.end_date)} aria-describedby={fieldError("end_date")} />{errors.end_date && <small id="end_date-error">{errors.end_date}</small>}</label></div></section>
    <section className="trip-form-section"><div className="trip-form-heading"><span>03</span><div><h2>Hospedagem e viajantes</h2><p>Você pode atualizar estes dados depois.</p></div></div><div className="trip-form-grid two"><label><span>Nome da hospedagem</span><input value={form.accommodation_name || ""} onChange={(e) => change("accommodation_name", e.target.value || null)} placeholder="Hotel, pousada ou apartamento" maxLength={160} autoComplete="organization" /></label><label><span>Endereço</span><input value={form.accommodation_address || ""} onChange={(e) => change("accommodation_address", e.target.value || null)} placeholder="Endereço da hospedagem" maxLength={240} autoComplete="street-address" /></label><label><span>Número de viajantes</span><input type="number" min={1} max={20} inputMode="numeric" value={form.travelers_count} onChange={(e) => change("travelers_count", e.target.value === "" ? 0 : Number(e.target.value))} aria-invalid={Boolean(errors.travelers_count)} aria-describedby={fieldError("travelers_count")} />{errors.travelers_count && <small id="travelers_count-error">{errors.travelers_count}</small>}</label>{trip && <label><span>Status</span><select value={form.status} onChange={(e) => change("status", e.target.value as TripInput["status"])}>{TRIP_STATUSES.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label>}</div></section>
    <section className="trip-form-section"><div className="trip-form-heading"><span>04</span><div><h2>Seu ritmo</h2><p>Preferências que ajudam a personalizar o roteiro.</p></div></div><fieldset><legend>Estilo de viagem</legend><div className="trip-choice-grid three">{TRIP_STYLES.map((style) => <label className={form.trip_style === style ? "selected" : ""} key={style}><input type="radio" name="style" checked={form.trip_style === style} onChange={() => change("trip_style", style)} /><strong>{styleLabels[style]}</strong></label>)}</div>{errors.trip_style && <small>{errors.trip_style}</small>}</fieldset><fieldset><legend>Orçamento</legend><div className="trip-choice-grid four">{BUDGET_LEVELS.map((budget) => <label className={form.budget_level === budget ? "selected" : ""} key={budget}><input type="radio" name="budget" checked={form.budget_level === budget} onChange={() => change("budget_level", budget)} /><strong>{budgetLabels[budget]}</strong></label>)}</div>{errors.budget_level && <small>{errors.budget_level}</small>}</fieldset></section>
    <section className="trip-form-section"><div className="trip-form-heading"><span>05</span><div><h2>Interesses</h2><p>Selecione tudo que combina com esta viagem.</p></div></div><div className="interest-grid" aria-label="Interesses da viagem">{TRIP_INTERESTS.map((interest) => <button className={form.interests.includes(interest) ? "selected" : ""} type="button" aria-pressed={form.interests.includes(interest)} onClick={() => toggleInterest(interest)} key={interest}>{interestLabels[interest]}</button>)}</div>{errors.interests && <small>{errors.interests}</small>}<label className="trip-notes"><span>Notas <em>{(form.notes || "").length}/2000</em></span><textarea value={form.notes || ""} onChange={(e) => change("notes", e.target.value || null)} placeholder="Reservas, ideias ou informações importantes…" maxLength={2000} /></label></section>
    <div className="trip-savebar"><p className={message ? "error" : ""} role={message ? "alert" : undefined}>{message || (trip ? "As alterações ficam salvas na sua conta." : "Você poderá editar tudo depois.")}</p><button type="submit" disabled={saving}>{saving ? "Salvando…" : trip ? "Salvar alterações" : "Criar viagem"}</button></div>
  </form>;
}
