"use client";

import { useEffect, useMemo, useState } from "react";
import type { ItineraryDay } from "@/types/itinerary";

type Props = { city: string; country: string; accommodation?: string | null; days: ItineraryDay[] };
type Point = { lat: number; lon: number; label: string };
type RouteInfo = { distance: number; duration: number };

async function geocode(query: string): Promise<Point | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const rows = await response.json() as Array<{ lat: string; lon: string; display_name: string }>;
  const row = rows[0];
  return row ? { lat: Number(row.lat), lon: Number(row.lon), label: row.display_name } : null;
}

export function ItineraryRouteMap({ city, country, accommodation, days }: Props) {
  const [dayIndex, setDayIndex] = useState(0);
  const [points, setPoints] = useState<Point[]>([]);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const day = days[dayIndex];
  const stops = useMemo(() => day?.items.filter(item => item.location_name || item.location_address) ?? [], [day]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setRoute(null);
      const queries = [
        ...(accommodation ? [accommodation] : []),
        ...stops.map(item => item.location_address || item.location_name || item.title),
      ].slice(0, 9);
      const resolved: Point[] = [];
      for (const query of queries) {
        const point = await geocode(`${query}, ${city}, ${country}`).catch(() => null);
        if (point) resolved.push(point);
      }
      if (!active) return;
      setPoints(resolved);
      if (resolved.length > 1) {
        const coords = resolved.map(p => `${p.lon},${p.lat}`).join(";");
        const data = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false&steps=false`).then(r => r.json()).catch(() => null) as { routes?: Array<{ distance: number; duration: number }> } | null;
        if (active && data?.routes?.[0]) setRoute({ distance: data.routes[0].distance, duration: data.routes[0].duration });
      }
      if (active) setLoading(false);
    }
    if (day) load(); else setLoading(false);
    return () => { active = false; };
  }, [day, stops, accommodation, city, country]);

  if (!days.length) return null;
  const mapSrc = points.length ? `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(...points.map(p=>p.lon))-.025}%2C${Math.min(...points.map(p=>p.lat))-.02}%2C${Math.max(...points.map(p=>p.lon))+.025}%2C${Math.max(...points.map(p=>p.lat))+.02}&layer=mapnik&marker=${points[0].lat}%2C${points[0].lon}` : "";

  return <section className="route-map-section">
    <div className="route-map-heading"><div><span className="detail-label">Mapa do roteiro</span><h2>Seu dia, visualmente organizado</h2><p>Veja a hospedagem e as atividades na ordem do roteiro. O VivaTrip usa a sequência para reduzir deslocamentos desnecessários.</p></div>{route && <div className="route-summary"><strong>{(route.distance/1000).toFixed(1)} km</strong><span>aprox. {Math.max(1, Math.round(route.duration/60))} min de deslocamento*</span></div>}</div>
    <div className="route-day-tabs">{days.map((item, index) => <button type="button" className={index === dayIndex ? "active" : ""} onClick={() => setDayIndex(index)} key={item.id}>Dia {item.day_number}</button>)}</div>
    <div className="route-map-layout"><div className="route-stops">{accommodation && <div className="route-stop hotel"><b>⌂</b><div><small>PARTIDA</small><strong>{accommodation}</strong><span>Hospedagem</span></div></div>}{stops.map((item,index) => <div className="route-stop" key={item.id}><b>{index+1}</b><div><small>{item.start_time?.slice(0,5) || "ROTEIRO"}</small><strong>{item.title}</strong><span>{item.location_name || item.location_address}</span></div></div>)}{!stops.length && <p className="route-empty">Adicione locais às atividades para montar o mapa deste dia.</p>}</div><div className="route-map-frame">{loading ? <div className="route-map-loading">Montando rota…</div> : mapSrc ? <iframe title={`Roteiro do dia ${day?.day_number}`} src={mapSrc} loading="lazy" /> : <div className="route-map-loading">Ainda não há locais suficientes para exibir a rota.</div>}</div></div>
    <small className="route-disclaimer">*Estimativa de rota terrestre. Tempos reais podem variar; transporte público e caminhada serão adicionados em uma próxima integração.</small>
  </section>;
}
