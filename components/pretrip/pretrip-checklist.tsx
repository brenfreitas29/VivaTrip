"use client";

import { useMemo, useState } from "react";
import { PRETRIP_CATALOG } from "@/lib/pretrip/catalog";
import { getDestinationGuidance } from "@/lib/pretrip/destination-guidance";
import type { PretripItem, PretripKey } from "@/types/pretrip";

type ChecklistApiResponse = { item?: PretripItem; error?: string };
type TripContext = { city: string; country: string; startDate: string; endDate: string };

const ICONS: Record<PretripKey, string> = {
  documents: "▣",
  apps: "⌁",
  connectivity: "⌁",
  money: "£",
  transport: "↔",
  packing: "◌",
  insurance: "✓",
  emergency: "+",
};

export function PretripChecklist({ tripId, initialItems, trip }: { tripId: string; initialItems: PretripItem[]; trip: TripContext }) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState<PretripKey | null>(null);
  const [editing, setEditing] = useState<PretripKey | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>(() => Object.fromEntries(initialItems.map((item) => [item.item_key, item.notes ?? ""])));
  const [error, setError] = useState("");
  const map = useMemo(() => new Map(items.map((item) => [item.item_key, item])), [items]);
  const completed = PRETRIP_CATALOG.filter((item) => map.get(item.key)?.completed).length;
  const guidance = useMemo(() => getDestinationGuidance(trip.country, trip.city, trip.startDate), [trip.country, trip.city, trip.startDate]);
  const hasDestinationGuidance = Object.keys(guidance).length > 0;

  async function save(key: PretripKey, completedValue: boolean, notesValue: string | null): Promise<boolean> {
    setSaving(key);
    setError("");
    try {
      const response = await fetch(`/api/trips/${tripId}/checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_key: key, completed: completedValue, notes: notesValue }),
      });
      const body = (await response.json().catch(() => null)) as ChecklistApiResponse | null;
      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(`/trips/${tripId}`)}`;
        return false;
      }
      if (!response.ok) throw new Error(body?.error || "Não foi possível salvar.");
      const savedItem = body?.item;
      if (!savedItem) throw new Error("O servidor não retornou o item salvo.");
      setItems((previous) => [...previous.filter((item) => item.item_key !== key), savedItem]);
      setDraftNotes((previous) => ({ ...previous, [key]: savedItem.notes ?? "" }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
      return false;
    } finally {
      setSaving(null);
    }
  }

  function toggle(key: PretripKey) {
    const current = map.get(key);
    void save(key, !current?.completed, current?.notes ?? null);
  }

  async function saveNote(key: PretripKey) {
    const current = map.get(key);
    const saved = await save(key, Boolean(current?.completed), draftNotes[key]?.trim() || null);
    if (saved) setEditing(null);
  }

  return (
    <section className="pretrip-section" aria-label="Pré-viagem">
      <div className="pretrip-heading">
        <div className="pretrip-heading-topline">
          <span className="auth-eyebrow">Pré-viagem · {trip.city}</span>
          {hasDestinationGuidance ? <span className="pretrip-live-badge">Guia do destino</span> : null}
        </div>
        <h2>Prepare o essencial antes de embarcar</h2>
        <p>
          {hasDestinationGuidance
            ? `Informações práticas para ${trip.city}, ${trip.country}, organizadas por assunto. Requisitos de entrada dependem do passaporte, residência e datas; confirme os itens críticos nas fontes oficiais indicadas.`
            : `Checklist para sua viagem a ${trip.city}, ${trip.country}. Requisitos de entrada variam conforme passaporte, residência e datas; confirme sempre em fontes oficiais antes da viagem.`}
        </p>
        <div className="pretrip-progress" aria-label={`${completed} de ${PRETRIP_CATALOG.length} itens concluídos`}>
          <div><span style={{ width: `${(completed / PRETRIP_CATALOG.length) * 100}%` }} /></div>
          <strong>{completed}/{PRETRIP_CATALOG.length} concluídos</strong>
        </div>
      </div>

      {error ? <p className="trips-error" role="alert">{error}</p> : null}

      <div className="pretrip-grid">
        {PRETRIP_CATALOG.map((entry) => {
          const current = map.get(entry.key);
          const done = Boolean(current?.completed);
          const isEditing = editing === entry.key;
          const destinationInfo = guidance[entry.key];

          return (
            <article key={entry.key} className={done ? "completed" : ""}>
              <div className="pretrip-card-top">
                <span className="pretrip-icon" aria-hidden="true">{ICONS[entry.key]}</span>
                <button
                  type="button"
                  className="pretrip-check"
                  aria-pressed={done}
                  aria-label={`${done ? "Desmarcar" : "Marcar"} ${entry.title}`}
                  disabled={saving === entry.key}
                  onClick={() => toggle(entry.key)}
                >
                  {saving === entry.key ? "…" : done ? "✓" : ""}
                </button>
              </div>

              <div className="pretrip-card-title-row">
                <h3>{entry.title}</h3>
                {destinationInfo?.badge ? <span className="pretrip-topic-badge">{destinationInfo.badge}</span> : null}
              </div>

              {destinationInfo ? (
                <>
                  <p className="pretrip-summary">{destinationInfo.summary}</p>
                  <ul className="pretrip-detail-list">
                    {destinationInfo.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                  {destinationInfo.sources?.length ? (
                    <div className="pretrip-sources" aria-label={`Fontes de ${entry.title}`}>
                      {destinationInfo.sources.map((source) => (
                        <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label} ↗</a>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="pretrip-summary">{entry.description}</p>
              )}

              <div className="pretrip-note-area">
                {isEditing ? (
                  <div className="pretrip-note-editor">
                    <textarea
                      maxLength={500}
                      rows={3}
                      aria-label={`Notas de ${entry.title}`}
                      value={draftNotes[entry.key] ?? ""}
                      onChange={(event) => setDraftNotes((previous) => ({ ...previous, [entry.key]: event.target.value }))}
                      placeholder="Adicione links, reservas ou lembretes…"
                    />
                    <div>
                      <button type="button" disabled={saving === entry.key} onClick={() => void saveNote(entry.key)}>Salvar nota</button>
                      <button
                        type="button"
                        disabled={saving === entry.key}
                        onClick={() => {
                          setDraftNotes((previous) => ({ ...previous, [entry.key]: current?.notes ?? "" }));
                          setEditing(null);
                        }}
                      >Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="pretrip-note-action" onClick={() => setEditing(entry.key)}>
                    {current?.notes ? "Editar nota" : "+ Adicionar nota"}
                  </button>
                )}
                {!isEditing && current?.notes ? <p className="pretrip-note">{current.notes}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
