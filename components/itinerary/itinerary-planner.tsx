"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ITINERARY_CATEGORIES, ITINERARY_PERIODS, type Itinerary, type ItineraryDay, type ItineraryItem } from "@/types/itinerary";
import type { Season } from "@/lib/trips/season";

const generatingMessages = ["Conhecendo seu destino…", "Organizando seus dias…", "Considerando seus interesses…", "Adaptando à época da viagem…", "Montando seu roteiro…"];
const periodLabels = { morning: "Manhã", afternoon: "Tarde", evening: "Noite", night: "Fim de noite" } as const;
const categoryLabels = { attraction: "Atração", museum: "Museu", food: "Gastronomia", nature: "Natureza", shopping: "Compras", experience: "Experiência", transport: "Transporte", rest: "Descanso", nightlife: "Vida noturna", other: "Outro" } as const;
const seasonLabels = { spring: "🌸 Roteiro adaptado à primavera", summer: "☀️ Roteiro adaptado ao verão", autumn: "🍂 Roteiro adaptado ao outono", winter: "❄️ Roteiro adaptado ao inverno" } as const;

type ItemDraft = Pick<ItineraryItem, "period" | "start_time" | "end_time" | "title" | "description" | "location_name" | "location_address" | "category" | "estimated_duration_minutes" | "notes">;
const emptyItem = (): ItemDraft => ({ period: "morning", start_time: null, end_time: null, title: "", description: null, location_name: null, location_address: null, category: "experience", estimated_duration_minutes: null, notes: null });

async function readResponse<T>(response: Response): Promise<T | null> {
  try {
    return await response.json() as T;
  } catch {
    return null;
  }
}

export function ItineraryPlanner({ tripId, initialItinerary, season, aiConfigured }: { tripId: string; initialItinerary: Itinerary | null; season: Season; aiConfigured: boolean }) {
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [generating, setGenerating] = useState(initialItinerary?.generation_status === "generating");
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerTitle, setHeaderTitle] = useState(initialItinerary?.title || "");
  const [headerSummary, setHeaderSummary] = useState(initialItinerary?.summary || "");
  const pollCount = useRef(0);

  useEffect(() => {
    if (!generating) return;
    const timer = window.setInterval(() => setMessageIndex((value) => (value + 1) % generatingMessages.length), 1800);
    return () => window.clearInterval(timer);
  }, [generating]);

  useEffect(() => {
    if (!generating) {
      pollCount.current = 0;
      return;
    }

    let cancelled = false;
    const poll = window.setInterval(async () => {
      pollCount.current += 1;
      if (pollCount.current > 40) {
        window.clearInterval(poll);
        if (!cancelled) {
          setGenerating(false);
          setError("A geração está demorando mais que o esperado. Atualize a página para verificar se o roteiro foi concluído.");
        }
        return;
      }
      try {
        const response = await fetch(`/api/trips/${tripId}/itinerary`, { cache: "no-store" });
        if (response.status === 401) {
          window.location.assign(`/login?next=${encodeURIComponent(`/trips/${tripId}`)}`);
          return;
        }
        const body = await readResponse<{ itinerary?: Itinerary | null }>(response);
        if (!response.ok || !body?.itinerary) return;
        if (body.itinerary.generation_status !== "generating") {
          if (!cancelled) {
            setItinerary(body.itinerary);
            setHeaderTitle(body.itinerary.title || "");
            setHeaderSummary(body.itinerary.summary || "");
            setGenerating(false);
          }
          window.clearInterval(poll);
        }
      } catch {
        // A transient polling failure should not cancel an in-flight generation.
      }
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [generating, tripId]);

  async function refreshItinerary() {
    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`, { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(`/trips/${tripId}`)}`);
        return null;
      }
      const body = await readResponse<{ itinerary?: Itinerary | null }>(response);
      if (response.ok && body?.itinerary) {
        setItinerary(body.itinerary);
        setHeaderTitle(body.itinerary.title || "");
        setHeaderSummary(body.itinerary.summary || "");
        return body.itinerary;
      }
    } catch {
      // Caller will preserve the current itinerary and show the original error.
    }
    return null;
  }

  async function generate() {
    if (generating) return;
    if (itinerary) {
      const warning = itinerary.has_user_edits
        ? "Você editou este roteiro. Gerar novamente substituirá suas alterações. Deseja continuar?"
        : "Gerar um novo roteiro substituirá o atual. Deseja continuar?";
      if (!window.confirm(warning)) return;
    }

    setGenerating(true);
    setError("");
    setMessageIndex(0);
    pollCount.current = 0;

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary/generate`, { method: "POST", cache: "no-store" });
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(`/trips/${tripId}`)}`);
        return;
      }
      const body = await readResponse<{ itinerary?: Itinerary; error?: string; code?: string }>(response);

      if (response.status === 409) {
        // Another request already owns generation. Polling will pick up the result.
        return;
      }

      if (!response.ok || !body?.itinerary) {
        await refreshItinerary();
        setError(body?.error || "Não foi possível criar o roteiro. Tente novamente.");
        setGenerating(false);
        return;
      }

      setItinerary(body.itinerary);
      setHeaderTitle(body.itinerary.title || "");
      setHeaderSummary(body.itinerary.summary || "");
      setGenerating(false);
    } catch {
      await refreshItinerary();
      setError("A conexão foi interrompida durante a geração. Atualize a página para verificar se o roteiro foi concluído.");
      setGenerating(false);
    }
  }

  async function mutate(payload: Record<string, unknown>) {
    if (saving) return false;
    setError("");
    setSaving(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(`/trips/${tripId}`)}`);
        return false;
      }
      const body = await readResponse<{ itinerary?: Itinerary; error?: string }>(response);
      if (!response.ok || !body?.itinerary) {
        setError(body?.error || "Não foi possível salvar a alteração.");
        return false;
      }
      setItinerary(body.itinerary);
      setHeaderTitle(body.itinerary.title || "");
      setHeaderSummary(body.itinerary.summary || "");
      return true;
    } catch {
      setError("Não foi possível conectar ao servidor para salvar. Tente novamente.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveHeader(event: FormEvent) {
    event.preventDefault();
    if (await mutate({ action: "update_itinerary", title: headerTitle, summary: headerSummary })) setEditingHeader(false);
  }

  if (generating) {
    return <section className="itinerary-generating" aria-live="polite"><div className="ai-orbit"><span>✦</span></div><span className="auth-eyebrow">VivaTrip AI</span><h2>{generatingMessages[messageIndex]}</h2><p>Estamos criando uma sugestão personalizada para esta viagem. Você pode manter esta página aberta enquanto o roteiro é processado.</p>{error && <p className="itinerary-error" role="alert">{error}</p>}</section>;
  }

  if (!itinerary || itinerary.generation_status === "failed") {
    return <section className="itinerary-empty"><div><span className="itinerary-ai-mark">✦</span><span className="auth-eyebrow">VivaTrip AI</span><h2>Seu roteiro personalizado começa aqui.</h2><p>O VivaTrip usa seu destino, datas, hospedagem, interesses, orçamento, ritmo e época da viagem para criar uma sugestão personalizada.</p>{aiConfigured ? <button type="button" onClick={generate}>✨ Criar roteiro com VivaTrip AI</button> : <div className="ai-config-state"><strong>IA ainda não configurada</strong><p>Adicione a chave do provedor como segredo do servidor na Vercel. Nunca use o prefixo NEXT_PUBLIC_ para essa chave.</p></div>}{error && <p className="itinerary-error" role="alert">{error}</p>}</div></section>;
  }

  return <section className="itinerary-planner"><header className="itinerary-heading"><div><span className="auth-eyebrow">Roteiro personalizado</span>{editingHeader ? <form className="itinerary-header-form" onSubmit={saveHeader}><label><span>Título do roteiro</span><input value={headerTitle} onChange={(event) => setHeaderTitle(event.target.value)} maxLength={180} required /></label><label><span>Resumo</span><textarea value={headerSummary} onChange={(event) => setHeaderSummary(event.target.value)} maxLength={1500} required /></label><div><button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar roteiro"}</button><button type="button" disabled={saving} onClick={() => { setHeaderTitle(itinerary.title || ""); setHeaderSummary(itinerary.summary || ""); setEditingHeader(false); }}>Cancelar</button></div></form> : <><h2>{itinerary.title || "Seu roteiro VivaTrip"}</h2><p>{itinerary.summary}</p><button className="text-action" type="button" onClick={() => setEditingHeader(true)}>Editar título e resumo</button></>}{season !== "unknown" && <span className="season-pill">{seasonLabels[season]}</span>}{itinerary.has_user_edits && <span className="edited-pill">Personalizado por você</span>}</div><button type="button" onClick={generate} disabled={!aiConfigured || saving}>Gerar novo roteiro</button></header>{saving && <p className="itinerary-saving" role="status">Salvando alteração…</p>}{error && <p className="itinerary-error" role="alert">{error}</p>}<div className="itinerary-days">{itinerary.days.map((day) => <DayCard day={day} key={day.id} mutate={mutate} saving={saving} />)}</div></section>;
}

function DayCard({ day, mutate, saving }: { day: ItineraryDay; mutate: (payload: Record<string, unknown>) => Promise<boolean>; saving: boolean }) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState(day.title || "");
  const [summary, setSummary] = useState(day.summary || "");
  const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", timeZone: "UTC" }).format(new Date(`${day.date}T00:00:00Z`));

  async function saveDay(event: FormEvent) {
    event.preventDefault();
    if (await mutate({ action: "update_day", dayId: day.id, title, summary })) setEditing(false);
  }

  async function move(index: number, direction: -1 | 1) {
    if (saving) return;
    const reordered = [...day.items];
    const target = index + direction;
    if (target < 0 || target >= reordered.length) return;
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await mutate({ action: "reorder_items", dayId: day.id, orderedIds: reordered.map((item) => item.id) });
  }

  return <article className="itinerary-day"><header><div className="day-number"><span>Dia</span><strong>{String(day.day_number).padStart(2, "0")}</strong></div><div className="day-title"><span>{date}</span>{editing ? <form onSubmit={saveDay}><input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Título do dia" maxLength={180} required /><textarea value={summary} onChange={(event) => setSummary(event.target.value)} aria-label="Resumo do dia" maxLength={1000} /><div><button type="submit" disabled={saving}>Salvar dia</button><button type="button" disabled={saving} onClick={() => { setTitle(day.title || ""); setSummary(day.summary || ""); setEditing(false); }}>Cancelar</button></div></form> : <><h3>{day.title}</h3>{day.summary && <p>{day.summary}</p>}<button className="text-action" type="button" disabled={saving} onClick={() => setEditing(true)}>Editar dia</button></>}</div></header><div className="day-timeline">{day.items.map((item, index) => <ItineraryItemCard item={item} key={item.id} first={index === 0} last={index === day.items.length - 1} move={(direction) => move(index, direction)} mutate={mutate} saving={saving} />)}</div>{adding ? <ItemForm onCancel={() => setAdding(false)} onSave={async (item) => { if (await mutate({ action: "add_item", dayId: day.id, item })) setAdding(false); }} /> : <button className="add-activity" type="button" disabled={saving} onClick={() => setAdding(true)}>+ Adicionar atividade</button>}</article>;
}

function ItineraryItemCard({ item, first, last, move, mutate, saving }: { item: ItineraryItem; first: boolean; last: boolean; move: (direction: -1 | 1) => void; mutate: (payload: Record<string, unknown>) => Promise<boolean>; saving: boolean }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <ItemForm initial={item} onCancel={() => setEditing(false)} onSave={async (draft) => { if (await mutate({ action: "update_item", itemId: item.id, item: draft })) setEditing(false); }} />;
  return <div className="itinerary-item"><div className="timeline-dot" /><div className="item-period"><span>{periodLabels[item.period]}</span>{item.start_time && <time>{item.start_time.slice(0, 5)}</time>}</div><div className="item-content"><span className="item-category">{categoryLabels[item.category]}</span><h4>{item.title}</h4>{item.description && <p>{item.description}</p>}{item.location_name && <div className="item-location">⌖ {item.location_name}</div>}{item.notes && <small>{item.notes}</small>}<div className="item-actions"><button type="button" disabled={saving} onClick={() => setEditing(true)}>Editar</button><button type="button" disabled={saving || first} onClick={() => move(-1)} aria-label={`Mover ${item.title} para cima`}>↑</button><button type="button" disabled={saving || last} onClick={() => move(1)} aria-label={`Mover ${item.title} para baixo`}>↓</button><button className="danger" type="button" disabled={saving} onClick={() => { if (window.confirm(`Excluir a atividade “${item.title}”?`)) void mutate({ action: "delete_item", itemId: item.id }); }}>Excluir</button></div></div></div>;
}

function ItemForm({ initial, onSave, onCancel }: { initial?: ItineraryItem; onSave: (item: ItemDraft) => Promise<void>; onCancel: () => void }) {
  const [draft, setDraft] = useState<ItemDraft>(() => initial ? { period: initial.period, start_time: initial.start_time?.slice(0, 5) || null, end_time: initial.end_time?.slice(0, 5) || null, title: initial.title, description: initial.description, location_name: initial.location_name, location_address: initial.location_address, category: initial.category, estimated_duration_minutes: initial.estimated_duration_minutes, notes: initial.notes } : emptyItem());
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  function change<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (draft.start_time && draft.end_time && draft.end_time < draft.start_time) {
      setLocalError("O horário final precisa ser igual ou posterior ao horário inicial.");
      return;
    }
    setLocalError("");
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return <form className="item-edit-form" onSubmit={submit}>{localError && <p className="itinerary-error" role="alert">{localError}</p>}<div className="item-form-grid"><label><span>Título</span><input value={draft.title} maxLength={160} onChange={(event) => change("title", event.target.value)} required /></label><label><span>Período</span><select value={draft.period} onChange={(event) => change("period", event.target.value as ItemDraft["period"])}>{ITINERARY_PERIODS.map((period) => <option value={period} key={period}>{periodLabels[period]}</option>)}</select></label><label><span>Início</span><input type="time" value={draft.start_time || ""} onChange={(event) => change("start_time", event.target.value || null)} /></label><label><span>Fim</span><input type="time" value={draft.end_time || ""} onChange={(event) => change("end_time", event.target.value || null)} /></label><label><span>Categoria</span><select value={draft.category} onChange={(event) => change("category", event.target.value as ItemDraft["category"])}>{ITINERARY_CATEGORIES.map((category) => <option value={category} key={category}>{categoryLabels[category]}</option>)}</select></label><label><span>Duração aproximada (min)</span><input type="number" min={15} max={720} value={draft.estimated_duration_minutes || ""} onChange={(event) => change("estimated_duration_minutes", event.target.value ? Number(event.target.value) : null)} /></label><label className="wide"><span>Descrição</span><textarea value={draft.description || ""} maxLength={1200} onChange={(event) => change("description", event.target.value || null)} /></label><label><span>Local</span><input value={draft.location_name || ""} maxLength={200} onChange={(event) => change("location_name", event.target.value || null)} /></label><label><span>Endereço</span><input value={draft.location_address || ""} maxLength={300} onChange={(event) => change("location_address", event.target.value || null)} /></label><label className="wide"><span>Notas</span><textarea value={draft.notes || ""} maxLength={800} onChange={(event) => change("notes", event.target.value || null)} /></label></div><div className="item-form-actions"><button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar atividade"}</button><button type="button" disabled={saving} onClick={onCancel}>Cancelar</button></div></form>;
}
