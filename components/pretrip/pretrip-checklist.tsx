"use client";

import { useMemo, useState } from "react";
import { PRETRIP_CATALOG } from "@/lib/pretrip/catalog";
import type { PretripItem, PretripKey } from "@/types/pretrip";

type ChecklistApiResponse = { item?: PretripItem; error?: string };
type TripContext = { city: string; country: string; startDate: string; endDate: string };

export function PretripChecklist({ tripId, initialItems, trip }: { tripId: string; initialItems: PretripItem[]; trip: TripContext }) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState<PretripKey | null>(null);
  const [editing, setEditing] = useState<PretripKey | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>(() => Object.fromEntries(initialItems.map((item) => [item.item_key, item.notes ?? ""])));
  const [error, setError] = useState("");
  const map = useMemo(() => new Map(items.map((item) => [item.item_key, item])), [items]);
  const completed = PRETRIP_CATALOG.filter((item) => map.get(item.key)?.completed).length;

  async function save(key: PretripKey, completedValue: boolean, notesValue: string | null) {
    setSaving(key); setError("");
    try {
      const response = await fetch(`/api/trips/${tripId}/checklist`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item_key: key, completed: completedValue, notes: notesValue }) });
      const body = (await response.json().catch(() => null)) as ChecklistApiResponse | null;
      if (response.status === 401) { window.location.href = `/login?next=${encodeURIComponent(`/trips/${tripId}`)}`; return; }
      if (!response.ok) throw new Error(body?.error || "Não foi possível salvar.");
      const savedItem = body?.item;
      if (!savedItem) throw new Error("O servidor não retornou o item salvo.");
      setItems((previous) => [...previous.filter((item) => item.item_key !== key), savedItem]);
      setDraftNotes((previous) => ({ ...previous, [key]: savedItem.notes ?? "" }));
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível salvar."); }
    finally { setSaving(null); }
  }

  function toggle(key: PretripKey) { const current = map.get(key); void save(key, !current?.completed, current?.notes ?? null); }
  function saveNote(key: PretripKey) { const current = map.get(key); void save(key, Boolean(current?.completed), draftNotes[key]?.trim() || null).then(() => setEditing(null)); }

  return (
    <section className="pretrip-section" aria-label="Pré-viagem">
      <div className="pretrip-heading">
        <span className="auth-eyebrow">Pré-viagem · {trip.city}</span>
        <h2>Prepare o essencial antes de embarcar</h2>
        <p>Checklist para sua viagem a {trip.city}, {trip.country}. Requisitos de entrada variam conforme passaporte, residência e datas; confirme sempre em fontes oficiais antes da viagem.</p>
        <div className="pretrip-progress" aria-label={`${completed} de ${PRETRIP_CATALOG.length} itens concluídos`}><div><span style={{ width: `${(completed / PRETRIP_CATALOG.length) * 100}%` }} /></div><strong>{completed}/{PRETRIP_CATALOG.length} concluídos</strong></div>
      </div>
      {error ? <p className="trips-error" role="alert">{error}</p> : null}
      <div className="pretrip-grid">
        {PRETRIP_CATALOG.map((entry) => {
          const current = map.get(entry.key); const done = Boolean(current?.completed); const isEditing = editing === entry.key;
          return (
            <article key={entry.key} className={done ? "completed" : ""}>
              <button type="button" className="pretrip-check" aria-pressed={done} aria-label={`${done ? "Desmarcar" : "Marcar"} ${entry.title}`} disabled={saving === entry.key} onClick={() => toggle(entry.key)}>{saving === entry.key ? "…" : done ? "✓" : ""}</button>
              <h3>{entry.title}</h3><p>{entry.description}</p>
              {isEditing ? <div className="pretrip-note-editor"><textarea maxLength={500} rows={3} aria-label={`Notas de ${entry.title}`} value={draftNotes[entry.key] ?? ""} onChange={(event) => setDraftNotes((previous) => ({ ...previous, [entry.key]: event.target.value }))} placeholder="Adicione links, reservas ou lembretes…"/><div><button type="button" disabled={saving === entry.key} onClick={() => saveNote(entry.key)}>Salvar nota</button><button type="button" onClick={() => { setDraftNotes((previous) => ({ ...previous, [entry.key]: current?.notes ?? "" })); setEditing(null); }}>Cancelar</button></div></div> : <button type="button" className="pretrip-note-action" onClick={() => setEditing(entry.key)}>{current?.notes ? "Editar nota" : "+ Adicionar nota"}</button>}
              {!isEditing && current?.notes ? <p className="pretrip-note">{current.notes}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
