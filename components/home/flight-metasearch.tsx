'use client';

import { FormEvent, useMemo, useState } from 'react';

type Locale = 'pt' | 'en' | 'es';
type Result = { id:string; kind:'cash'|'miles'; provider:string; airline?:string; program?:string; origin:string; destination:string; amount?:number; currency?:string; miles?:number; direct?:boolean };
type Provider = { name:string; kind:'cash'|'miles'; configured:boolean; ok:boolean; message?:string };
type ApiResponse = { results?:Result[]; providers?:Provider[]; error?:string };

const text = {
  pt:{from:'Origem',to:'Destino',depart:'Ida',back:'Volta',people:'Pessoas',cabin:'Cabine',search:'Comparar preços',hint:'Compare dinheiro e milhas em um só lugar',code:'Use cidade + código IATA, ex.: Buenos Aires (EZE)',economy:'Econômica',premium:'Premium economy',business:'Executiva',first:'Primeira',loading:'Buscando nas fontes conectadas…',cheapest:'Mais barato',cash:'Dinheiro',miles:'Milhas',empty:'Nenhuma opção disponível nas fontes conectadas.',source:'Fonte',direct:'Direto',stops:'Com conexão',note:'A disponibilidade depende das integrações configuradas. Os preços são reconfirmados no provedor antes da compra.'},
  en:{from:'From',to:'To',depart:'Departure',back:'Return',people:'Travelers',cabin:'Cabin',search:'Compare prices',hint:'Compare cash and miles in one place',code:'Use city + IATA code, e.g. New York (JFK)',economy:'Economy',premium:'Premium economy',business:'Business',first:'First',loading:'Searching connected sources…',cheapest:'Cheapest',cash:'Cash',miles:'Miles',empty:'No options are available from connected sources.',source:'Source',direct:'Direct',stops:'With connection',note:'Availability depends on configured integrations. Prices are reconfirmed with the provider before purchase.'},
  es:{from:'Origen',to:'Destino',depart:'Ida',back:'Vuelta',people:'Personas',cabin:'Cabina',search:'Comparar precios',hint:'Compara dinero y millas en un solo lugar',code:'Usa ciudad + código IATA, ej.: Buenos Aires (EZE)',economy:'Económica',premium:'Premium economy',business:'Ejecutiva',first:'Primera',loading:'Buscando en las fuentes conectadas…',cheapest:'Más barato',cash:'Dinero',miles:'Millas',empty:'No hay opciones disponibles en las fuentes conectadas.',source:'Fuente',direct:'Directo',stops:'Con escala',note:'La disponibilidad depende de las integraciones configuradas. Los precios se reconfirman con el proveedor antes de comprar.'},
} as const;

function datePlus(days:number){const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}

export function FlightMetaSearch({locale}:{locale:Locale}){
  const t=text[locale];
  const [origin,setOrigin]=useState('Buenos Aires (EZE)');
  const [destination,setDestination]=useState('Tokyo (NRT)');
  const [departureDate,setDepartureDate]=useState(datePlus(30));
  const [returnDate,setReturnDate]=useState(datePlus(40));
  const [adults,setAdults]=useState(1);
  const [cabin,setCabin]=useState('economy');
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [error,setError]=useState('');
  const [results,setResults]=useState<Result[]>([]);
  const [providers,setProviders]=useState<Provider[]>([]);
  const cheapestCash=useMemo(()=>results.filter(r=>r.kind==='cash'&&typeof r.amount==='number').sort((a,b)=>(a.amount||0)-(b.amount||0))[0]?.id,[results]);
  const cheapestMiles=useMemo(()=>results.filter(r=>r.kind==='miles'&&typeof r.miles==='number').sort((a,b)=>(a.miles||0)-(b.miles||0))[0]?.id,[results]);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setLoading(true);setSearched(true);setError('');
    try{
      const response=await fetch('/api/flights/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination,departureDate,returnDate:returnDate||undefined,adults,cabin})});
      const data=(await response.json()) as ApiResponse;
      if(!response.ok) throw new Error(data.error||'Search failed');
      setResults(data.results||[]);setProviders(data.providers||[]);
    }catch(err){setResults([]);setProviders([]);setError(err instanceof Error?err.message:'Search failed')}finally{setLoading(false)}
  }

  return <div className="fm-wrap">
    <form className="fm-card" onSubmit={submit}>
      <div className="fm-top"><strong>{t.hint}</strong><span>{t.code}</span></div>
      <div className="fm-grid">
        <label><span>✈ {t.from}</span><input value={origin} onChange={e=>setOrigin(e.target.value)} required /></label>
        <label><span>⌖ {t.to}</span><input value={destination} onChange={e=>setDestination(e.target.value)} required /></label>
        <label><span>◷ {t.depart}</span><input type="date" value={departureDate} onChange={e=>setDepartureDate(e.target.value)} required /></label>
        <label><span>◷ {t.back}</span><input type="date" value={returnDate} min={departureDate} onChange={e=>setReturnDate(e.target.value)} /></label>
        <label><span>♟ {t.people}</span><select value={adults} onChange={e=>setAdults(Number(e.target.value))}>{[1,2,3,4,5,6,7,8,9].map(n=><option key={n}>{n}</option>)}</select></label>
        <label><span>◇ {t.cabin}</span><select value={cabin} onChange={e=>setCabin(e.target.value)}><option value="economy">{t.economy}</option><option value="premium_economy">{t.premium}</option><option value="business">{t.business}</option><option value="first">{t.first}</option></select></label>
        <button disabled={loading}>{loading?'…':'→'}<b>{t.search}</b></button>
      </div>
    </form>

    {(loading||searched)&&<section className="fm-results" aria-live="polite">
      {loading&&<p>{t.loading}</p>}{error&&<p className="fm-error">{error}</p>}
      {!loading&&!error&&results.length===0&&<p>{t.empty}</p>}
      {results.length>0&&<div className="fm-list">{results.slice(0,12).map(r=>{const cheapest=r.id===cheapestCash||r.id===cheapestMiles;return <article key={r.id}><div><span className={`badge ${r.kind}`}>{r.kind==='cash'?t.cash:t.miles}</span>{cheapest&&<span className="cheap">★ {t.cheapest}</span>}<h3>{r.airline||r.program||r.provider}</h3><p>{r.origin} → {r.destination} · {r.direct?t.direct:t.stops}</p></div><div className="price">{r.kind==='cash'?<><strong>{r.currency} {r.amount?.toLocaleString()}</strong><small>{t.source}: {r.provider}</small></>:<><strong>{r.miles?.toLocaleString()} mi</strong><small>{r.program||r.provider}</small></>}</div></article>})}</div>}
      {providers.length>0&&<div className="fm-providers">{providers.map(p=><span key={p.name} className={p.ok?'ok':''}>{p.name} · {p.configured?(p.ok?'✓':'—'):'off'}</span>)}</div>}
      <small className="fm-note">{t.note}</small>
    </section>}

    <style jsx>{`
      .fm-wrap{position:relative;z-index:5;width:min(1480px,92vw);margin:36px auto 0}.fm-card,.fm-results{background:rgba(255,255,255,.97);border:1px solid rgba(255,255,255,.9);box-shadow:0 20px 55px rgba(33,29,88,.2);backdrop-filter:blur(16px)}.fm-card{border-radius:26px;padding:14px 16px 16px}.fm-top{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:4px 8px 12px;color:#21175f}.fm-top strong{font-size:14px}.fm-top span{font-size:12px;color:#827ca7}.fm-grid{display:grid;grid-template-columns:1.25fr 1.25fr .85fr .85fr .65fr .9fr 160px;border:1px solid #e6e2f6;border-radius:17px;overflow:hidden}.fm-grid label{min-width:0;padding:10px 12px;background:#fff;border-right:1px solid #ece8f7}.fm-grid label>span{display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a72a1;margin-bottom:5px}.fm-grid input,.fm-grid select{width:100%;border:0;outline:0;background:transparent;color:#16114e;font-weight:700;font-size:13px;min-height:30px}.fm-grid button{border:0;background:linear-gradient(135deg,#6846f5,#5634db);color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;font-weight:800;cursor:pointer}.fm-grid button b{font-size:12px}.fm-grid button:disabled{opacity:.7}.fm-grid label:focus-within{background:#faf9ff;box-shadow:inset 0 0 0 2px #ddd5ff}.fm-results{margin-top:12px;border-radius:22px;padding:14px}.fm-list{display:grid;gap:8px}.fm-list article{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 14px;border:1px solid #eeeafa;border-radius:14px;background:#fff}.fm-list h3{margin:5px 0 2px;color:#15104c;font-size:15px}.fm-list p,.fm-results>p{margin:0;color:#827da0;font-size:12px}.badge,.cheap{display:inline-flex;padding:4px 7px;border-radius:99px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;margin-right:6px}.badge.cash{background:#eee9ff;color:#593be5}.badge.miles{background:#eaf8f1;color:#087b55}.cheap{background:#fff5d7;color:#946a00}.price{text-align:right}.price strong{display:block;color:#21165e;font-size:17px}.price small{display:block;color:#8a84a7;margin-top:3px}.fm-providers{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.fm-providers span{font-size:10px;padding:5px 8px;border-radius:99px;background:#f2f0f8;color:#86809b}.fm-providers span.ok{background:#e8f8f0;color:#08754f}.fm-note{display:block;margin-top:9px;color:#8d88a5;line-height:1.4}.fm-error{color:#a33!important}
      @media(max-width:1180px){.fm-grid{grid-template-columns:1fr 1fr 1fr}.fm-grid label{border-bottom:1px solid #ece8f7}.fm-grid button{grid-column:1/-1;min-height:58px}.fm-top span{display:none}}
      @media(max-width:720px){.fm-wrap{width:92vw;margin-top:26px}.fm-card{padding:10px;border-radius:20px}.fm-grid{grid-template-columns:1fr 1fr}.fm-grid button{grid-column:1/-1}.fm-list article{align-items:flex-start}.price strong{font-size:14px}}
      @media(max-width:480px){.fm-grid{grid-template-columns:1fr}.fm-grid label{grid-column:1!important}.fm-list article{display:block}.price{text-align:left;margin-top:8px}}
    `}</style>
  </div>
}
