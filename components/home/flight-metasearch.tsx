'use client';

import { FormEvent, useMemo, useState } from 'react';

type Locale = 'pt' | 'en' | 'es';
type Props = { locale: Locale };

type Result = {
  id: string;
  kind: 'cash' | 'miles';
  provider: string;
  airline?: string;
  program?: string;
  origin: string;
  destination: string;
  departureDate: string;
  amount?: number;
  currency?: string;
  miles?: number;
  cabin?: string;
  direct?: boolean;
};

type Provider = { name: string; kind: 'cash' | 'miles'; configured: boolean; ok: boolean; message?: string };

const copy = {
  pt: {
    from: 'Origem', to: 'Destino', depart: 'Ida', back: 'Volta', people: 'Pessoas', cabin: 'Cabine', search: 'Comparar preços',
    hint: 'Compare dinheiro e milhas em um só lugar', code: 'Use cidade + código IATA, ex.: Buenos Aires (EZE)',
    economy: 'Econômica', premium: 'Premium economy', business: 'Executiva', first: 'Primeira',
    loading: 'Buscando nas fontes conectadas…', cheapest: 'Mais barato', cash: 'Dinheiro', miles: 'Milhas', noResults: 'Nenhuma opção disponível nas fontes conectadas.',
    source: 'Fonte', direct: 'Direto', stops: 'Com conexão', providerNote: 'A disponibilidade depende das integrações configuradas. Os preços são confirmados no provedor antes da compra.',
  },
  en: {
    from: 'From', to: 'To', depart: 'Departure', back: 'Return', people: 'Travelers', cabin: 'Cabin', search: 'Compare prices',
    hint: 'Compare cash and miles in one place', code: 'Use city + IATA code, e.g. New York (JFK)',
    economy: 'Economy', premium: 'Premium economy', business: 'Business', first: 'First',
    loading: 'Searching connected sources…', cheapest: 'Cheapest', cash: 'Cash', miles: 'Miles', noResults: 'No options are available from connected sources.',
    source: 'Source', direct: 'Direct', stops: 'With connection', providerNote: 'Availability depends on configured integrations. Prices are reconfirmed with the provider before purchase.',
  },
  es: {
    from: 'Origen', to: 'Destino', depart: 'Ida', back: 'Vuelta', people: 'Personas', cabin: 'Cabina', search: 'Comparar precios',
    hint: 'Compara dinero y millas en un solo lugar', code: 'Usa ciudad + código IATA, ej.: Buenos Aires (EZE)',
    economy: 'Económica', premium: 'Premium economy', business: 'Ejecutiva', first: 'Primera',
    loading: 'Buscando en las fuentes conectadas…', cheapest: 'Más barato', cash: 'Dinero', miles: 'Millas', noResults: 'No hay opciones disponibles en las fuentes conectadas.',
    source: 'Fuente', direct: 'Directo', stops: 'Con escala', providerNote: 'La disponibilidad depende de las integraciones configuradas. Los precios se reconfirman con el proveedor antes de comprar.',
  },
} as const;

function todayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function FlightMetaSearch({ locale }: Props) {
  const t = copy[locale];
  const [origin, setOrigin] = useState('Buenos Aires (EZE)');
  const [destination, setDestination] = useState('Tokyo (NRT)');
  const [departureDate, setDepartureDate] = useState(todayPlus(30));
  const [returnDate, setReturnDate] = useState(todayPlus(40));
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState('economy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searched, setSearched] = useState(false);

  const cheapestCash = useMemo(() => results.filter((r) => r.kind === 'cash' && typeof r.amount === 'number').sort((a, b) => (a.amount || 0) - (b.amount || 0))[0]?.id, [results]);
  const cheapestMiles = useMemo(() => results.filter((r) => r.kind === 'miles' && typeof r.miles === 'number').sort((a, b) => (a.miles || 0) - (b.miles || 0))[0]?.id, [results]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(''); setSearched(true);
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, departureDate, returnDate: returnDate || undefined, adults, cabin }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search failed');
      setResults(data.results || []);
      setProviders(data.providers || []);
    } catch (e) {
      setResults([]);
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally { setLoading(false); }
  }

  return <div className="flight-meta-wrap">
    <form className="flight-meta-search" onSubmit={submit}>
      <div className="flight-meta-topline"><strong>{t.hint}</strong><span>{t.code}</span></div>
      <div className="flight-meta-grid">
        <label><span>✈ {t.from}</span><input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="EZE" required /></label>
        <label><span>⌖ {t.to}</span><input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="NRT" required /></label>
        <label><span>◷ {t.depart}</span><input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required /></label>
        <label><span>◷ {t.back}</span><input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={departureDate} /></label>
        <label><span>♟ {t.people}</span><select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>{[1,2,3,4,5,6,7,8,9].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <label><span>◇ {t.cabin}</span><select value={cabin} onChange={(e) => setCabin(e.target.value)}><option value="economy">{t.economy}</option><option value="premium_economy">{t.premium}</option><option value="business">{t.business}</option><option value="first">{t.first}</option></select></label>
        <button type="submit" disabled={loading}>{loading ? '…' : '→'}<b>{t.search}</b></button>
      </div>
    </form>

    {(loading || searched) && <section className="flight-results-panel" aria-live="polite">
      {loading && <p className="flight-loading">{t.loading}</p>}
      {error && <p className="flight-error">{error}</p>}
      {!loading && !error && results.length === 0 && <p className="flight-empty">{t.noResults}</p>}
      {results.length > 0 && <div className="flight-result-list">{results.slice(0, 12).map((result) => {
        const cheapest = result.id === cheapestCash || result.id === cheapestMiles;
        return <article className="flight-result" key={result.id}>
          <div><span className={`result-kind ${result.kind}`}>{result.kind === 'cash' ? t.cash : t.miles}</span>{cheapest && <span className="cheapest-tag">★ {t.cheapest}</span>}<h3>{result.airline || result.program || result.provider}</h3><p>{result.origin} → {result.destination} · {result.direct ? t.direct : t.stops}</p></div>
          <div className="result-price">{result.kind === 'cash' ? <><strong>{result.currency} {result.amount?.toLocaleString()}</strong><small>{t.source}: {result.provider}</small></> : <><strong>{result.miles?.toLocaleString()} mi</strong><small>{result.program || result.provider}</small></>}</div>
        </article>;
      })}</div>}
      {providers.length > 0 && <div className="provider-status">{providers.map((p) => <span key={p.name} className={p.ok ? 'ok' : ''}>{p.name} · {p.configured ? (p.ok ? '✓' : '—') : 'off'}</span>)}</div>}
      <small className="provider-note">{t.providerNote}</small>
    </section>}

    <style jsx>{`
      .flight-meta-wrap{position:relative;z-index:5;width:min(1480px,92vw);margin:36px auto 0}.flight-meta-search{background:rgba(255,255,255,.97);border:1px solid rgba(255,255,255,.9);border-radius:26px;padding:14px 16px 16px;box-shadow:0 20px 55px rgba(33,29,88,.2);backdrop-filter:blur(16px)}.flight-meta-topline{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:4px 8px 12px;color:#21175f}.flight-meta-topline strong{font-size:14px}.flight-meta-topline span{font-size:12px;color:#827ca7}.flight-meta-grid{display:grid;grid-template-columns:1.25fr 1.25fr .85fr .85fr .65fr .9fr 160px;border:1px solid #e6e2f6;border-radius:17px;overflow:hidden}.flight-meta-grid label{min-width:0;padding:10px 12px;background:#fff;border-right:1px solid #ece8f7}.flight-meta-grid label>span{display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a72a1;margin-bottom:5px}.flight-meta-grid input,.flight-meta-grid select{width:100%;border:0;outline:0;background:transparent;color:#16114e;font-weight:700;font-size:13px;min-height:30px}.flight-meta-grid button{border:0;background:linear-gradient(135deg,#6846f5,#5634db);color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;font-weight:800;cursor:pointer}.flight-meta-grid button b{font-size:12px}.flight-meta-grid button:disabled{opacity:.7}.flight-results-panel{margin-top:12px;background:rgba(255,255,255,.97);border-radius:22px;padding:14px;box-shadow:0 16px 44px rgba(31,24,84,.17)}.flight-result-list{display:grid;gap:8px}.flight-result{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 14px;border:1px solid #eeeafa;border-radius:14px;background:#fff}.flight-result h3{margin:5px 0 2px;color:#15104c;font-size:15px}.flight-result p{margin:0;color:#827da0;font-size:12px}.result-kind,.cheapest-tag{display:inline-flex;padding:4px 7px;border-radius:99px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;margin-right:6px}.result-kind.cash{background:#eee9ff;color:#593be5}.result-kind.miles{background:#eaf8f1;color:#087b55}.cheapest-tag{background:#fff5d7;color:#946a00}.result-price{text-align:right}.result-price strong{display:block;color:#21165e;font-size:17px}.result-price small{display:block;color:#8a84a7;margin-top:3px}.provider-status{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.provider-status span{font-size:10px;padding:5px 8px;border-radius:99px;background:#f2f0f8;color:#86809b}.provider-status span.ok{background:#e8f8f0;color:#08754f}.provider-note{display:block;margin-top:9px;color:#8d88a5;line-height:1.4}.flight-loading,.flight-empty,.flight-error{margin:4px;color:#5d567e}.flight-error{color:#a33}.flight-meta-search :focus{box-shadow:none}.flight-meta-grid label:focus-within{background:#faf9ff;box-shadow:inset 0 0 0 2px #ddd5ff}
      @media(max-width:1180px){.flight-meta-grid{grid-template-columns:1fr 1fr 1fr}.flight-meta-grid button{min-height:58px}.flight-meta-grid label{border-bottom:1px solid #ece8f7}.flight-meta-grid button{grid-column:1/-1}.flight-meta-topline span{display:none}}
      @media(max-width:720px){.flight-meta-wrap{width:92vw;margin-top:26px}.flight-meta-search{padding:10px;border-radius:20px}.flight-meta-grid{grid-template-columns:1fr 1fr}.flight-meta-grid label:nth-child(1),.flight-meta-grid label:nth-child(2){grid-column:span 1}.flight-meta-grid button{grid-column:1/-1}.flight-meta-topline{padding:4px 4px 10px}.flight-result{align-items:flex-start}.result-price strong{font-size:14px}}
      @media(max-width:480px){.flight-meta-grid{grid-template-columns:1fr}.flight-meta-grid label{grid-column:1!important}.flight-result{display:block}.result-price{text-align:left;margin-top:8px}}
    `}</style>
  </div>;
}
