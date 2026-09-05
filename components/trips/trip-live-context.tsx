"use client";

import { useEffect, useMemo, useState } from "react";

type Props = { city: string; countryCode: string; startDate: string; endDate: string };
type Place = { latitude: number; longitude: number; name: string; country?: string; timezone?: string };
type Daily = { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] };

const weatherLabel = (code: number) => {
  if (code === 0) return "Céu limpo";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Neblina";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Neve";
  if (code <= 82) return "Pancadas de chuva";
  if (code <= 86) return "Neve intensa";
  return "Trovoadas";
};
const weatherIcon = (code: number) => code === 0 ? "☀" : code <= 3 ? "⛅" : code <= 48 ? "☁" : code <= 67 ? "🌧" : code <= 77 ? "❄" : code <= 82 ? "🌦" : code <= 86 ? "🌨" : "⛈";

export function TripLiveContext({ city, countryCode, startDate, endDate }: Props) {
  const [place, setPlace] = useState<Place | null>(null);
  const [daily, setDaily] = useState<Daily | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&countryCode=${encodeURIComponent(countryCode)}&count=1&language=pt&format=json`).then(r => r.json());
        const found = geo?.results?.[0] as Place | undefined;
        if (!found || !active) return;
        setPlace(found);
        const forecast = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${found.latitude}&longitude=${found.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`).then(r => r.json());
        if (active && forecast?.daily) setDaily(forecast.daily);
      } catch { /* graceful fallback: map/weather cards explain unavailable data */ }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [city, countryCode]);

  const tripForecast = useMemo(() => {
    if (!daily) return [];
    return daily.time.map((date, i) => ({ date, code: daily.weather_code[i], max: daily.temperature_2m_max[i], min: daily.temperature_2m_min[i], rain: daily.precipitation_probability_max[i] }))
      .filter(day => day.date >= startDate && day.date <= endDate).slice(0, 6);
  }, [daily, startDate, endDate]);

  const mapUrl = place ? `https://www.openstreetmap.org/export/embed.html?bbox=${place.longitude - .08}%2C${place.latitude - .06}%2C${place.longitude + .08}%2C${place.latitude + .06}&layer=mapnik&marker=${place.latitude}%2C${place.longitude}` : "";
  const mapsLink = place ? `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=12/${place.latitude}/${place.longitude}` : "https://www.openstreetmap.org/";

  return <section className="trip-live-context" aria-label="Contexto ao vivo do destino">
    <div className="trip-live-heading"><div><span className="detail-label">Destino ao vivo</span><h2>Clima e localização</h2><p>Informações atuais para ajudar a ajustar o roteiro antes de sair.</p></div><span className="live-badge">● AO VIVO</span></div>
    <div className="trip-live-grid">
      <article className="trip-weather-card">
        <div className="live-card-title"><span>☀</span><div><strong>Previsão do tempo</strong><small>{city}</small></div></div>
        {loading ? <p className="live-muted">Buscando previsão atualizada…</p> : tripForecast.length ? <div className="weather-days">{tripForecast.map(day => <div className="weather-day" key={day.date}><small>{new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit" }).format(new Date(`${day.date}T12:00:00`))}</small><b>{weatherIcon(day.code)}</b><strong>{Math.round(day.max)}°</strong><span>{Math.round(day.min)}°</span><em>☂ {day.rain ?? 0}%</em><i>{weatherLabel(day.code)}</i></div>)}</div> : <div className="forecast-future"><strong>Previsão ainda não disponível para as datas da viagem.</strong><p>A previsão detalhada aparece automaticamente quando a viagem entrar na janela de até 16 dias.</p></div>}
        <small className="weather-source">Dados meteorológicos: Open-Meteo</small>
      </article>
      <article className="trip-map-card">
        <div className="live-card-title"><span>⌖</span><div><strong>Mapa do destino</strong><small>{place ? `${place.name}${place.country ? `, ${place.country}` : ""}` : city}</small></div></div>
        {mapUrl ? <iframe title={`Mapa de ${city}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="map-loading">{loading ? "Localizando destino…" : "Mapa indisponível no momento."}</div>}
        <a href={mapsLink} target="_blank" rel="noreferrer">Abrir mapa completo ↗</a>
      </article>
    </div>
  </section>;
}
