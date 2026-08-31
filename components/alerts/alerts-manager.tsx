"use client";

import { FormEvent, useState } from "react";
import type { FlightAlert } from "@/types/alert";

type AlertApiResponse = {
  alert?: FlightAlert;
  error?: string;
};

export function AlertsManager({ initialAlerts }: { initialAlerts: FlightAlert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body: AlertApiResponse | null = await response.json().catch(() => null);

      if (response.status === 401) {
        location.href = "/login?next=/alerts";
        return;
      }
      if (!response.ok) throw new Error(body?.error || "Não foi possível salvar.");
      if (!body?.alert) throw new Error("O servidor não retornou o alerta salvo.");

      setAlerts((current) => [body.alert as FlightAlert, ...current]);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
      if (response.status === 401) {
        location.href = "/login?next=/alerts";
        return;
      }
      if (!response.ok) throw new Error("Não foi possível excluir o alerta.");
      setAlerts((current) => current.filter((alert) => alert.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível excluir o alerta.");
    }
  }

  return (
    <div className="alerts-layout">
      <form className="module-card alert-form" onSubmit={submit}>
        <span className="module-status">Salvar rota</span><h2>Novo alerta</h2>
        <div className="alert-form-grid">
          <label><span>Origem</span><input name="origin" placeholder="SAO" maxLength={40} required /></label>
          <label><span>Destino</span><input name="destination" placeholder="LIS" maxLength={40} required /></label>
          <label><span>Ida</span><input name="departure_date" type="date" /></label>
          <label><span>Volta</span><input name="return_date" type="date" /></label>
          <label><span>Moeda</span><select name="currency" defaultValue="USD"><option>USD</option><option>EUR</option><option>BRL</option><option>ARS</option><option>GBP</option></select></label>
          <label><span>Preço-alvo opcional</span><input name="target_price" type="number" min="1" step="1" placeholder="750" /></label>
        </div>
        <button className="primary-trip-action" disabled={busy}>{busy ? "Salvando…" : "Salvar alerta"}</button>
        <p className="alert-disclaimer">O alerta fica salvo na sua conta. A verificação automática de tarifas será ativada somente após a integração de um provedor real de voos.</p>
        {error ? <p className="trips-error" role="alert">{error}</p> : null}
      </form>
      <section className="saved-alerts">
        <div className="saved-alerts-heading"><h2>Seus alertas</h2><span>{alerts.length}</span></div>
        {alerts.length ? alerts.map((alert) => (
          <article key={alert.id} className="saved-alert">
            <div><strong>{alert.origin} → {alert.destination}</strong><p>{alert.departure_date || "Data flexível"}{alert.return_date ? ` — ${alert.return_date}` : ""}</p>{alert.target_price ? <small>Meta: {alert.currency} {alert.target_price.toLocaleString("pt-BR")}</small> : <small>Sem preço-alvo</small>}</div>
            <div className="saved-alert-actions"><span>Aguardando integração</span><button type="button" onClick={() => remove(alert.id)}>Excluir</button></div>
          </article>
        )) : <div className="empty-inline"><h3>Nenhum alerta salvo</h3><p>Adicione uma rota para deixar sua preferência pronta para a integração de preços.</p></div>}
      </section>
    </div>
  );
}
