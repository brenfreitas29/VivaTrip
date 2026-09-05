'use client';

import { FormEvent, useMemo, useState } from 'react';

type Locale = 'pt' | 'en' | 'es';
type Result = { id:string; kind:'cash'|'miles'; provider:string; airline?:string; program?:string; origin:string; destination:string; amount?:number; currency?:string; originalAmount?:number; originalCurrency?:string; miles?:number; taxes?:number; taxesCurrency?:string; direct?:boolean };
type Provider = { name:string; kind:'cash'|'miles'; configured:boolean; ok:boolean; message?:string };
type ApiResponse = { results?:Result[]; providers?:Provider[]; error?:string };
type Airport = { code:string; city:string; name:string; country:string; aliases?:string[] };

const airports:Airport[] = [
  {code:'GRU',city:'São Paulo',name:'Aeroporto Internacional de Guarulhos',country:'Brasil',aliases:['guarulhos','sao paulo','sp']},
  {code:'CGH',city:'São Paulo',name:'Aeroporto de Congonhas',country:'Brasil',aliases:['congonhas','sao paulo','sp']},
  {code:'VCP',city:'Campinas',name:'Aeroporto Internacional de Viracopos',country:'Brasil',aliases:['viracopos','campinas','sao paulo']},
  {code:'GIG',city:'Rio de Janeiro',name:'Aeroporto Internacional do Galeão',country:'Brasil',aliases:['galeao','rio','rio de janeiro']},
  {code:'SDU',city:'Rio de Janeiro',name:'Aeroporto Santos Dumont',country:'Brasil',aliases:['santos dumont','rio','rio de janeiro']},
  {code:'BSB',city:'Brasília',name:'Aeroporto Internacional de Brasília',country:'Brasil'},
  {code:'CNF',city:'Belo Horizonte',name:'Aeroporto Internacional de Confins',country:'Brasil',aliases:['confins']},
  {code:'POA',city:'Porto Alegre',name:'Aeroporto Salgado Filho',country:'Brasil'},
  {code:'SSA',city:'Salvador',name:'Aeroporto Internacional de Salvador',country:'Brasil'},
  {code:'REC',city:'Recife',name:'Aeroporto Internacional do Recife',country:'Brasil'},
  {code:'FOR',city:'Fortaleza',name:'Aeroporto Internacional de Fortaleza',country:'Brasil'},
  {code:'EZE',city:'Buenos Aires',name:'Aeropuerto Internacional Ministro Pistarini (Ezeiza)',country:'Argentina',aliases:['ezeiza']},
  {code:'AEP',city:'Buenos Aires',name:'Aeroparque Jorge Newbery',country:'Argentina',aliases:['aeroparque']},
  {code:'SCL',city:'Santiago',name:'Aeropuerto Internacional Arturo Merino Benítez',country:'Chile'},
  {code:'MVD',city:'Montevidéu',name:'Aeropuerto Internacional de Carrasco',country:'Uruguai'},
  {code:'LIM',city:'Lima',name:'Aeropuerto Internacional Jorge Chávez',country:'Peru'},
  {code:'BOG',city:'Bogotá',name:'Aeropuerto Internacional El Dorado',country:'Colômbia'},
  {code:'MEX',city:'Cidade do México',name:'Aeropuerto Internacional Benito Juárez',country:'México'},
  {code:'CUN',city:'Cancún',name:'Aeropuerto Internacional de Cancún',country:'México'},
  {code:'MIA',city:'Miami',name:'Miami International Airport',country:'Estados Unidos'},
  {code:'JFK',city:'Nova York',name:'John F. Kennedy International Airport',country:'Estados Unidos',aliases:['new york','nyc']},
  {code:'LGA',city:'Nova York',name:'LaGuardia Airport',country:'Estados Unidos',aliases:['new york','nyc']},
  {code:'EWR',city:'Nova York',name:'Newark Liberty International Airport',country:'Estados Unidos',aliases:['newark','new york','nyc']},
  {code:'LAX',city:'Los Angeles',name:'Los Angeles International Airport',country:'Estados Unidos'},
  {code:'SFO',city:'San Francisco',name:'San Francisco International Airport',country:'Estados Unidos'},
  {code:'ORD',city:'Chicago',name:"O'Hare International Airport",country:'Estados Unidos'},
  {code:'YYZ',city:'Toronto',name:'Toronto Pearson International Airport',country:'Canadá'},
  {code:'YUL',city:'Montreal',name:'Montréal–Trudeau International Airport',country:'Canadá'},
  {code:'LHR',city:'Londres',name:'Heathrow Airport',country:'Reino Unido',aliases:['london','heathrow']},
  {code:'LGW',city:'Londres',name:'Gatwick Airport',country:'Reino Unido',aliases:['london','gatwick']},
  {code:'CDG',city:'Paris',name:'Aéroport Charles de Gaulle',country:'França'},
  {code:'ORY',city:'Paris',name:'Aéroport de Paris-Orly',country:'França'},
  {code:'MAD',city:'Madri',name:'Aeropuerto Adolfo Suárez Madrid-Barajas',country:'Espanha'},
  {code:'BCN',city:'Barcelona',name:'Aeroport Josep Tarradellas Barcelona-El Prat',country:'Espanha'},
  {code:'LIS',city:'Lisboa',name:'Aeroporto Humberto Delgado',country:'Portugal'},
  {code:'FCO',city:'Roma',name:'Aeroporto Leonardo da Vinci–Fiumicino',country:'Itália'},
  {code:'MXP',city:'Milão',name:'Aeroporto di Milano Malpensa',country:'Itália'},
  {code:'AMS',city:'Amsterdã',name:'Amsterdam Airport Schiphol',country:'Países Baixos'},
  {code:'FRA',city:'Frankfurt',name:'Frankfurt Airport',country:'Alemanha'},
  {code:'ZRH',city:'Zurique',name:'Zürich Airport',country:'Suíça'},
  {code:'IST',city:'Istambul',name:'Istanbul Airport',country:'Turquia'},
  {code:'DXB',city:'Dubai',name:'Dubai International Airport',country:'Emirados Árabes Unidos'},
  {code:'DOH',city:'Doha',name:'Hamad International Airport',country:'Catar'},
  {code:'NRT',city:'Tokyo',name:'Narita International Airport',country:'Japão',aliases:['tokyo','tóquio']},
  {code:'HND',city:'Tokyo',name:'Haneda Airport',country:'Japão',aliases:['tokyo','tóquio']},
  {code:'KIX',city:'Osaka',name:'Kansai International Airport',country:'Japão'},
  {code:'ICN',city:'Seul',name:'Incheon International Airport',country:'Coreia do Sul',aliases:['seoul']},
  {code:'GMP',city:'Seul',name:'Gimpo International Airport',country:'Coreia do Sul',aliases:['seoul']},
  {code:'BKK',city:'Bangkok',name:'Suvarnabhumi Airport',country:'Tailândia'},
  {code:'SIN',city:'Singapura',name:'Singapore Changi Airport',country:'Singapura'},
  {code:'HKG',city:'Hong Kong',name:'Hong Kong International Airport',country:'Hong Kong'},
  {code:'SYD',city:'Sydney',name:'Sydney Kingsford Smith Airport',country:'Austrália'},
  {code:'MEL',city:'Melbourne',name:'Melbourne Airport',country:'Austrália'},
  {code:'JNB',city:'Joanesburgo',name:'O. R. Tambo International Airport',country:'África do Sul'},
  {code:'CPT',city:'Cidade do Cabo',name:'Cape Town International Airport',country:'África do Sul'},
];

const text = {
  pt:{from:'Origem',to:'Destino',depart:'Ida',back:'Volta',people:'Pessoas',cabin:'Cabine',search:'Comparar preços',hint:'Compare companhias aéreas e sites de milhas em um só lugar',code:'Digite cidade, aeroporto ou código IATA',economy:'Econômica',premium:'Premium economy',business:'Executiva',first:'Primeira',loading:'Buscando preços reais nas fontes conectadas…',cheapest:'Mais barato',cash:'Passagem',miles:'Milhas',empty:'Ainda não há preços porque as fontes de tarifas estão desconectadas.',source:'Buscador',direct:'Direto',stops:'Com conexão',taxes:'taxas',usd:'Valores em dólar (USD)',note:'Os resultados usam tarifas retornadas pelos provedores conectados. Preços e disponibilidade devem ser reconfirmados antes da compra.',airport:'Aeroporto',city:'Cidade'},
  en:{from:'From',to:'To',depart:'Departure',back:'Return',people:'Travelers',cabin:'Cabin',search:'Compare prices',hint:'Compare airlines and mileage sites in one place',code:'Type a city, airport or IATA code',economy:'Economy',premium:'Premium economy',business:'Business',first:'First',loading:'Searching real prices from connected sources…',cheapest:'Cheapest',cash:'Fare',miles:'Miles',empty:'Prices are not available yet because fare sources are disconnected.',source:'Search source',direct:'Direct',stops:'With connection',taxes:'taxes',usd:'Prices in US dollars (USD)',note:'Results use fares returned by connected providers. Price and availability must be reconfirmed before purchase.',airport:'Airport',city:'City'},
  es:{from:'Origen',to:'Destino',depart:'Ida',back:'Vuelta',people:'Personas',cabin:'Cabina',search:'Comparar precios',hint:'Compara aerolíneas y sitios de millas en un solo lugar',code:'Escribe ciudad, aeropuerto o código IATA',economy:'Económica',premium:'Premium economy',business:'Ejecutiva',first:'Primera',loading:'Buscando precios reales en las fuentes conectadas…',cheapest:'Más barato',cash:'Pasaje',miles:'Millas',empty:'Todavía no hay precios porque las fuentes de tarifas están desconectadas.',source:'Buscador',direct:'Directo',stops:'Con escala',taxes:'tasas',usd:'Valores en dólares (USD)',note:'Los resultados usan tarifas devueltas por los proveedores conectados. Precio y disponibilidad deben reconfirmarse antes de comprar.',airport:'Aeropuerto',city:'Ciudad'},
} as const;

function datePlus(days:number){const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function money(value:number|undefined){return typeof value==='number'?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value):'—'}
function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function airportLabel(airport:Airport){return `${airport.city} (${airport.code})`}
function airportMatches(value:string){
  const query=normalize(value).replace(/[(),]/g,' ').split(/\s+/).filter(Boolean);
  if(!query.length) return airports.slice(0,6);
  return airports.filter(airport=>{
    const haystack=normalize([airport.code,airport.city,airport.name,airport.country,...(airport.aliases||[])].join(' '));
    return query.every(part=>haystack.includes(part));
  }).slice(0,7);
}

function AirportPicker({label,icon,value,onChange,locale}:{label:string;icon:string;value:string;onChange:(value:string)=>void;locale:Locale}){
  const [open,setOpen]=useState(false);
  const suggestions=useMemo(()=>airportMatches(value),[value]);
  const t=text[locale];
  return <label className="fm-airport-field">
    <span>{icon} {label}</span>
    <input value={value} autoComplete="off" onFocus={()=>setOpen(true)} onChange={e=>{onChange(e.target.value);setOpen(true)}} onBlur={()=>window.setTimeout(()=>setOpen(false),120)} required aria-autocomplete="list" aria-expanded={open&&suggestions.length>0} />
    {open&&suggestions.length>0&&<div className="fm-airport-menu" role="listbox">
      {suggestions.map(airport=><button type="button" key={airport.code} className="fm-airport-option" onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(airportLabel(airport));setOpen(false)}}>
        <span className="fm-airport-icon">✈</span>
        <span className="fm-airport-copy"><strong>{airport.city}</strong><small>{airport.name} · {airport.country}</small></span>
        <span className="fm-airport-code"><b>{airport.code}</b><small>{t.airport}</small></span>
      </button>)}
    </div>}
  </label>
}

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
      <div className="fm-usdline"><span>USD</span>{t.usd}</div>
      <div className="fm-grid">
        <AirportPicker label={t.from} icon="✈" value={origin} onChange={setOrigin} locale={locale}/>
        <AirportPicker label={t.to} icon="⌖" value={destination} onChange={setDestination} locale={locale}/>
        <label><span>◷ {t.depart}</span><input type="date" value={departureDate} onChange={e=>setDepartureDate(e.target.value)} required /></label>
        <label><span>◷ {t.back}</span><input type="date" value={returnDate} min={departureDate} onChange={e=>setReturnDate(e.target.value)} /></label>
        <label><span>♟ {t.people}</span><select value={adults} onChange={e=>setAdults(Number(e.target.value))}>{[1,2,3,4,5,6,7,8,9].map(n=><option key={n}>{n}</option>)}</select></label>
        <label><span>◇ {t.cabin}</span><select value={cabin} onChange={e=>setCabin(e.target.value)}><option value="economy">{t.economy}</option><option value="premium_economy">{t.premium}</option><option value="business">{t.business}</option><option value="first">{t.first}</option></select></label>
        <button className="fm-submit" disabled={loading}>{loading?'…':'→'}<b>{t.search}</b></button>
      </div>
    </form>

    {(loading||searched)&&<section className="fm-results" aria-live="polite">
      {loading&&<p>{t.loading}</p>}{error&&<p className="fm-error">{error}</p>}
      {!loading&&!error&&results.length===0&&<p>{t.empty}</p>}
      {results.length>0&&<div className="fm-list">{results.slice(0,18).map(r=>{const cheapest=r.id===cheapestCash||r.id===cheapestMiles;return <article key={r.id}>
        <div className="result-main"><div className="provider-logo">{(r.airline||r.program||r.provider).slice(0,2).toUpperCase()}</div><div><span className={`badge ${r.kind}`}>{r.kind==='cash'?t.cash:t.miles}</span>{cheapest&&<span className="cheap">★ {t.cheapest}</span>}<h3>{r.airline||r.program||r.provider}</h3><p>{r.origin} → {r.destination} · {r.direct?t.direct:t.stops}</p><small>{t.source}: {r.provider}</small></div></div>
        <div className="price">{r.kind==='cash'?<><strong>{r.currency==='USD'?money(r.amount):`${r.currency||''} ${r.amount?.toLocaleString()||'—'}`}</strong>{r.originalCurrency&&r.originalCurrency!=='USD'&&<small>{r.originalCurrency} {r.originalAmount?.toLocaleString()}</small>}</>:<><strong>{r.miles?.toLocaleString()} mi</strong><small>{r.taxesCurrency==='USD'&&typeof r.taxes==='number'?`+ ${money(r.taxes)} ${t.taxes}`:(r.program||r.provider)}</small></>}</div>
      </article>})}</div>}
      {providers.length>0&&<div className="fm-providers">{providers.map(p=><span key={p.name} className={p.ok?'ok':''}>{p.kind==='cash'?'✈':'★'} {p.name} · {p.configured?(p.ok?'✓':'—'):'off'}</span>)}</div>}
      <small className="fm-note">{t.note}</small>
    </section>}

    <style jsx>{`
      .fm-wrap{position:relative;z-index:5;width:min(1480px,92vw);margin:36px auto 0}.fm-card,.fm-results{background:rgba(255,255,255,.97);border:1px solid rgba(255,255,255,.9);box-shadow:0 20px 55px rgba(33,29,88,.2);backdrop-filter:blur(16px)}.fm-card{border-radius:26px;padding:14px 16px 16px;overflow:visible}.fm-top{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:4px 8px 8px;color:#21175f}.fm-top strong{font-size:14px}.fm-top span{font-size:12px;color:#827ca7}.fm-usdline{display:flex;align-items:center;gap:8px;padding:0 8px 10px;color:#817a9f;font-size:11px}.fm-usdline span{display:inline-flex;padding:4px 7px;border-radius:99px;background:#eee9ff;color:#5b40e2;font-weight:900;letter-spacing:.06em}.fm-grid{display:grid;grid-template-columns:1.25fr 1.25fr .85fr .85fr .65fr .9fr 160px;border:1px solid #e6e2f6;border-radius:17px;overflow:visible;background:#fff}.fm-grid>label{min-width:0;padding:10px 12px;background:#fff;border-right:1px solid #ece8f7;position:relative}.fm-grid>label:first-child{border-radius:17px 0 0 17px}.fm-grid>label>span{display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a72a1;margin-bottom:5px}.fm-grid input,.fm-grid select{width:100%;border:0;outline:0;background:transparent;color:#16114e;font-weight:700;font-size:13px;min-height:30px}.fm-submit{border:0;border-radius:0 17px 17px 0;background:linear-gradient(135deg,#6846f5,#5634db);color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;font-weight:800;cursor:pointer}.fm-submit b{font-size:12px}.fm-submit:disabled{opacity:.7}.fm-grid>label:focus-within{background:#faf9ff;box-shadow:inset 0 0 0 2px #ddd5ff;z-index:20}.fm-airport-menu{position:absolute;left:-1px;top:calc(100% + 8px);width:min(440px,92vw);z-index:100;background:#fff;border:1px solid #e4e0f5;border-radius:18px;padding:7px;box-shadow:0 22px 58px rgba(24,17,78,.22);max-height:360px;overflow:auto}.fm-airport-option{width:100%;border:0;background:#fff;border-radius:13px;padding:10px;display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:10px;text-align:left;color:#17114d;cursor:pointer}.fm-airport-option:hover,.fm-airport-option:focus{background:#f5f2ff;outline:0}.fm-airport-icon{width:34px;height:34px;border-radius:10px;background:#eee9ff;color:#5b40e2;display:grid;place-items:center;font-size:14px}.fm-airport-copy{min-width:0}.fm-airport-copy strong{display:block;font-size:13px;line-height:1.3}.fm-airport-copy small{display:block;margin-top:3px;color:#817ba0;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fm-airport-code{text-align:right}.fm-airport-code b{display:block;color:#5a3de2;font-size:13px}.fm-airport-code small{display:block;color:#9a95ad;font-size:9px;margin-top:2px}.fm-results{margin-top:12px;border-radius:22px;padding:14px}.fm-list{display:grid;gap:8px}.fm-list article{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px;border:1px solid #eeeafa;border-radius:16px;background:#fff}.result-main{display:flex;align-items:center;gap:12px}.provider-logo{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#f0edff;color:#5a3de2;font-weight:900;font-size:12px}.fm-list h3{margin:5px 0 2px;color:#15104c;font-size:15px}.fm-list p,.fm-results>p{margin:0;color:#827da0;font-size:12px}.result-main small{display:block;margin-top:4px;color:#9a95ad;font-size:10px}.badge,.cheap{display:inline-flex;padding:4px 7px;border-radius:99px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;margin-right:6px}.badge.cash{background:#eee9ff;color:#593be5}.badge.miles{background:#eaf8f1;color:#087b55}.cheap{background:#fff5d7;color:#946a00}.price{text-align:right;min-width:160px}.price strong{display:block;color:#21165e;font-size:20px}.price small{display:block;color:#8a84a7;margin-top:4px}.fm-providers{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.fm-providers span{font-size:10px;padding:6px 9px;border-radius:99px;background:#f2f0f8;color:#86809b}.fm-providers span.ok{background:#e8f8f0;color:#08754f}.fm-note{display:block;margin-top:9px;color:#8d88a5;line-height:1.4}.fm-error{color:#a33!important}
      @media(max-width:1180px){.fm-grid{grid-template-columns:1fr 1fr 1fr}.fm-grid>label{border-bottom:1px solid #ece8f7}.fm-submit{grid-column:1/-1;min-height:58px;border-radius:0 0 17px 17px}.fm-top span{display:none}.fm-airport-menu{width:min(430px,80vw)}}
      @media(max-width:720px){.fm-wrap{width:92vw;margin-top:26px}.fm-card{padding:10px;border-radius:20px}.fm-grid{grid-template-columns:1fr 1fr}.fm-submit{grid-column:1/-1}.fm-list article{align-items:flex-start}.price strong{font-size:16px}.provider-logo{display:none}.fm-airport-menu{position:fixed;left:4vw;right:4vw;top:auto;width:auto;max-height:46vh}}
      @media(max-width:480px){.fm-grid{grid-template-columns:1fr}.fm-grid>label{grid-column:1!important}.fm-list article{display:block}.price{text-align:left;margin-top:10px}}
    `}</style>
  </div>
}
