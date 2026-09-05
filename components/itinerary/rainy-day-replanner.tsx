"use client";

import { useMemo, useState } from "react";
import type { ItineraryDay } from "@/types/itinerary";

export function RainyDayReplanner({ tripId, days, aiConfigured }: { tripId: string; days: Pick<ItineraryDay, "id" | "day_number" | "date" | "title">[]; aiConfigured: boolean }) {
  const [dayId, setDayId] = useState(days[0]?.id || "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(() => days.find((day) => day.id === dayId), [days, dayId]);

  async function replan() {
    if (!dayId || loading || !aiConfigured) return;
    if (!window.confirm("A IA vai substituir somente este dia por uma versão pensada para chuva. Deseja continuar?")) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary/rainy-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayId, note }),
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(`/trips/${tripId}`)}`);
        return;
      }
      if (!response.ok) {
        setMessage(body.error || "Não foi possível adaptar este dia agora.");
        return;
      }
      setMessage("Dia adaptado para chuva. Atualizando o roteiro…");
      window.location.reload();
    } catch {
      setMessage("A conexão foi interrompida. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!days.length) return null;

  return (
    <section className="rainy-day-assistant">
      <div className="rainy-day-copy">
        <span className="rainy-day-icon" aria-hidden>☔</span>
        <div>
          <span className="auth-eyebrow">VivaTrip AI · Plano B</span>
          <h3>Choveu? Replaneje só esse dia.</h3>
          <p>A IA troca atividades muito expostas por opções cobertas e tenta manter o roteiro coerente com sua hospedagem, interesses e ritmo.</p>
        </div>
      </div>
      <div className="rainy-day-controls">
        <label>
          <span>Dia da viagem</span>
          <select value={dayId} onChange={(event) => setDayId(event.target.value)}>
            {days.map((day) => <option key={day.id} value={day.id}>Dia {day.day_number} · {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${day.date}T00:00:00Z`))}{day.title ? ` · ${day.title}` : ""}</option>)}
          </select>
        </label>
        <label className="rainy-day-note">
          <span>O que você quer preservar? <em>opcional</em></span>
          <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Ex.: quero manter o British Museum e um jantar perto do hotel" />
        </label>
        <button type="button" onClick={replan} disabled={loading || !aiConfigured || !selected}>{loading ? "Adaptando…" : "☔ Adaptar dia para chuva"}</button>
      </div>
      {!aiConfigured && <p className="rainy-day-message">Configure a VivaTrip AI para usar este recurso.</p>}
      {message && <p className="rainy-day-message" role="status">{message}</p>}
    </section>
  );
}
