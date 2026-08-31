import { AppNav } from "@/components/trips/app-nav";
import { AlertsManager } from "@/components/alerts/alerts-manager";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { listAlerts } from "@/lib/alerts/server";
export const dynamic="force-dynamic";
export default async function Alerts(){const user=await requireUser("/alerts");const s=await createClient();const alerts=await listAlerts(s,user).catch(()=>[]);return <main className="trips-page"><AppNav/><div className="app-shell"><header className="module-header"><span className="auth-eyebrow">Economize acompanhando</span><h1>Alertas de preço</h1><p>Salve as rotas que quer acompanhar. O VivaTrip só mostrará tarifas quando houver uma fonte real conectada — sem preços inventados.</p></header><AlertsManager initialAlerts={alerts}/></div></main>}
