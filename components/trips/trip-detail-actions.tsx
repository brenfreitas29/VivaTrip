"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TripForm } from "@/components/trips/trip-form";
import type { Trip } from "@/types/trip";

export function TripDetailActions({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (deleting) return;
    if (!window.confirm(`Excluir a viagem para ${trip.destination_city}? Esta ação não pode ser desfeita.`)) return;

    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/trips/${trip.id}`)}`);
        return;
      }

      if (!response.ok) {
        setError(body.error || "Não foi possível excluir a viagem.");
        return;
      }

      router.push("/trips");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <section className="trip-edit-panel">
        <div className="trip-edit-heading">
          <div><span className="auth-eyebrow">Editar viagem</span><h2>Atualize os detalhes</h2></div>
          <button type="button" onClick={() => setEditing(false)}>Cancelar</button>
        </div>
        <TripForm trip={trip} onSaved={() => { setEditing(false); router.refresh(); }} />
      </section>
    );
  }

  return (
    <div className="trip-detail-actions">
      <button type="button" disabled={deleting} onClick={() => { setError(""); setEditing(true); }}>Editar viagem</button>
      <button className="danger" type="button" disabled={deleting} onClick={remove}>{deleting ? "Excluindo…" : "Excluir viagem"}</button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
