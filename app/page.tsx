'use client';

import Link from 'next/link';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Locale = 'pt' | 'en' | 'es';

const copy = {
  pt: {
    language: 'Idioma', currency: 'Moeda', dealsNav: 'Ofertas', alertsNav: 'Alertas de preço', howNav: 'Como funciona', signIn: 'Entrar', myTrips: 'Minhas viagens', profile: 'Perfil', logout: 'Sair',
    eyebrow: 'Uma busca. O mundo inteiro.', title: 'Viaje para qualquer lugar.', accent: 'Gaste menos.',
    hero: 'Compare passagens, milhas e tarifas exclusivas de parceiros confiáveis no mundo inteiro — tudo em uma busca simples.',
    roundTrip: 'Ida e volta', oneWay: 'Só ida', multiCity: 'Vários destinos', from: 'Origem', to: 'Destino', depart: 'Ida', return: 'Volta', travelers: 'Viajantes',
    originValue: 'São Paulo (SAO)', destinationValue: 'Lisboa (LIS)', departValue: '12 out 2026', returnValue: '24 out 2026', travelersValue: '1 viajante · Econômica',
    search: 'Buscar no mundo', miles: 'Comparar também com milhas', searches: 'Busca em mais de 120 sites confiáveis', compared: 'Comparamos', airlines: 'Companhias aéreas', programs: 'Programas de milhas', partners: 'Sites de viagem', memberFares: 'Tarifas exclusivas',
    picked: 'Selecionadas hoje', fresh: 'Novas tarifas para sua busca', worldCloser: 'O mundo está mais perto do que você imagina', viewAll: 'Ver todas as ofertas →', fromPrice: 'a partir de', roundTripPrice: 'ida e volta',
    tags: ['Melhor preço', 'Em alta', 'Tarifa baixa'], countries: ['França', 'Brasil', 'Austrália'],
    smarter: 'Uma rota mais inteligente', searchingTitle: 'Nós fazemos a busca.', goingTitle: 'Você faz a viagem.',
    howBody: 'A VivaTrip reúne tarifas em dinheiro, opções com milhas e ofertas de parceiros em uma visão clara. Compare o custo real e reserve com o provedor que escolher.', start: 'Começar uma busca',
    steps: [
      ['Busque uma vez', 'Conte onde você está e para onde deseja viajar.'],
      ['Compare tudo', 'Veja tarifas, milhas, taxas, escalas e duração lado a lado.'],
      ['Reserve com confiança', 'Escolha a oferta e conclua a reserva com um parceiro confiável.'],
    ],
    freeAlerts: 'Alertas gratuitos', alertTitle: 'Deixe a melhor tarifa', alertAccent: 'encontrar você.', alertBody: 'Acompanhe uma rota e avisaremos quando o preço cair — incluindo oportunidades difíceis de encontrar com milhas.', email: 'seu@email.com', createAlert: 'Criar alerta grátis', created: 'Alerta criado ✓', noSpam: 'Sem spam. Cancele quando quiser.',
    promises: [
      ['Resultados transparentes', 'Ofertas patrocinadas são sempre identificadas.'],
      ['Feito para o mundo', 'Cobertura global de grandes cidades a ilhas remotas.'],
      ['Comparação gratuita', 'Podemos receber comissão quando você reserva com um parceiro.'],
    ],
    tagline: 'Seu caminho mais claro para qualquer lugar.', disclosure: 'Política de afiliados', privacy: 'Privacidade', footer: '© 2026 VivaTrip. As tarifas do protótipo são ilustrativas e dependem da disponibilidade do provedor.',
  },
  en: {
    language: 'Language', currency: 'Currency', dealsNav: 'Explore deals', alertsNav: 'Price alerts', howNav: 'How it works', signIn: 'Sign in', myTrips: 'My trips', profile: 'Profile', logout: 'Sign out',
    eyebrow: 'One search. The whole world.', title: 'Go anywhere.', accent: 'Spend less.',
    hero: 'Compare flights, miles and member-only fares from trusted travel partners worldwide — all in one beautifully simple search.',
    roundTrip: 'Round trip', oneWay: 'One way', multiCity: 'Multi-city', from: 'From', to: 'To', depart: 'Depart', return: 'Return', travelers: 'Travelers',
    originValue: 'São Paulo (SAO)', destinationValue: 'Lisbon (LIS)', departValue: 'Oct 12, 2026', returnValue: 'Oct 24, 2026', travelersValue: '1 traveler · Economy',
    search: 'Search the world', miles: 'Compare fares with miles', searches: 'Searches 120+ trusted travel sites', compared: 'Compared across', airlines: 'Airlines', programs: 'Mileage programs', partners: 'Travel partners', memberFares: 'Member fares',
    picked: 'Handpicked today', fresh: 'Fresh fares for your search', worldCloser: 'The world is closer than you think', viewAll: 'View all deals →', fromPrice: 'from', roundTripPrice: 'round trip',
    tags: ['Best value', 'Trending', 'Low fare'], countries: ['France', 'Brazil', 'Australia'],
    smarter: 'A smarter route anywhere', searchingTitle: 'We do the searching.', goingTitle: 'You do the going.',
    howBody: 'VivaTrip brings cash fares, mileage options and partner deals into one clear view. Compare the true trip cost, then book securely with the provider you choose.', start: 'Start a search',
    steps: [
      ['Search once', 'Tell us where you are and where in the world you want to go.'],
      ['Compare everything', 'See fares, miles, fees, stops and travel time side by side.'],
      ['Book with confidence', 'Choose your deal and complete the booking with a trusted partner.'],
    ],
    freeAlerts: 'Free price alerts', alertTitle: 'Let the best fare', alertAccent: 'find you.', alertBody: 'Track a route and we’ll let you know when the price drops — including hard-to-spot mileage opportunities.', email: 'you@email.com', createAlert: 'Create free alert', created: 'Alert created ✓', noSpam: 'No spam. Unsubscribe anytime.',
    promises: [
      ['Transparent results', 'Sponsored offers are always clearly labeled.'],
      ['Built for the world', 'Global coverage, from major cities to remote islands.'],
      ['Free to compare', 'We may earn a commission when you book with a partner.'],
    ],
    tagline: 'Your clearest path anywhere.', disclosure: 'Affiliate disclosure', privacy: 'Privacy', footer: '© 2026 VivaTrip. Prototype fares are illustrative and subject to provider availability.',
  },
  es: {
    language: 'Idioma', currency: 'Moneda', dealsNav: 'Explorar ofertas', alertsNav: 'Alertas de precio', howNav: 'Cómo funciona', signIn: 'Ingresar', myTrips: 'Mis viajes', profile: 'Perfil', logout: 'Salir',
    eyebrow: 'Una búsqueda. Todo el mundo.', title: 'Viaja a cualquier lugar.', accent: 'Gasta menos.',
    hero: 'Compara vuelos, millas y tarifas exclusivas de socios confiables en todo el mundo — todo en una búsqueda simple.',
    roundTrip: 'Ida y vuelta', oneWay: 'Solo ida', multiCity: 'Varios destinos', from: 'Origen', to: 'Destino', depart: 'Salida', return: 'Regreso', travelers: 'Viajeros',
    originValue: 'São Paulo (SAO)', destinationValue: 'Lisboa (LIS)', departValue: '12 oct 2026', returnValue: '24 oct 2026', travelersValue: '1 viajero · Económica',
    search: 'Buscar en el mundo', miles: 'Comparar también con millas', searches: 'Busca en más de 120 sitios confiables', compared: 'Comparamos', airlines: 'Aerolíneas', programs: 'Programas de millas', partners: 'Sitios de viajes', memberFares: 'Tarifas exclusivas',
    picked: 'Elegidas hoy', fresh: 'Nuevas tarifas para tu búsqueda', worldCloser: 'El mundo está más cerca de lo que imaginas', viewAll: 'Ver todas las ofertas →', fromPrice: 'desde', roundTripPrice: 'ida y vuelta',
    tags: ['Mejor precio', 'En tendencia', 'Tarifa baja'], countries: ['Francia', 'Brasil', 'Australia'],
    smarter: 'Una ruta más inteligente', searchingTitle: 'Nosotros buscamos.', goingTitle: 'Tú haces el viaje.',
    howBody: 'VivaTrip reúne tarifas en dinero, opciones con millas y ofertas de socios en una vista clara. Compara el costo real y reserva con el proveedor que elijas.', start: 'Comenzar una búsqueda',
    steps: [
      ['Busca una vez', 'Dinos dónde estás y adónde quieres viajar.'],
      ['Compara todo', 'Ve tarifas, millas, tasas, escalas y duración lado a lado.'],
      ['Reserva con confianza', 'Elige la oferta y completa la reserva con un socio confiable.'],
    ],
    freeAlerts: 'Alertas gratuitas', alertTitle: 'Deja que la mejor tarifa', alertAccent: 'te encuentre.', alertBody: 'Sigue una ruta y te avisaremos cuando baje el precio — incluso oportunidades difíciles de encontrar con millas.', email: 'tu@email.com', createAlert: 'Crear alerta gratis', created: 'Alerta creada ✓', noSpam: 'Sin spam. Cancela cuando quieras.',
    promises: [
      ['Resultados transparentes', 'Las ofertas patrocinadas siempre están identificadas.'],
      ['Creado para el mundo', 'Cobertura global, desde grandes ciudades hasta islas remotas.'],
      ['Comparación gratuita', 'Podemos recibir una comisión cuando reservas con un socio.'],
    ],
    tagline: 'Tu camino más claro a cualquier lugar.', disclosure: 'Política de afiliados', privacy: 'Privacidad', footer: '© 2026 VivaTrip. Las tarifas del prototipo son ilustrativas y dependen de la disponibilidad del proveedor.',
  },
} as const;

const deals = [
  { city: 'Paris', route: 'New York → Paris', price: '$389', tone: 'paris' },
  { city: 'Rio', route: 'Lisbon → Rio de Janeiro', price: '$496', tone: 'rio' },
  { city: 'Sydney', route: 'Singapore → Sydney', price: '$341', tone: 'sydney' },
];

export default function Home() {
  const [currency, setCurrency] = useState('BRL');
  const [locale, setLocale] = useState<Locale>('pt');
    const [user, setUser] = useState<User | null>(null);
  const t = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale;
  }, [locale]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    void createClient().then(async (supabase) => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      const authState = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      });
      unsubscribe = () => authState.data.subscription.unsubscribe();
    }).catch(() => undefined);

    return () => unsubscribe?.();
  }, []);

  async function handleLogout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign('/search');
  }

  return (
    <main>
      <section className="hero-shell">
        <nav className="nav-wrap" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="VivaTrip home"><span className="brand-mark">VT</span><span>VivaTrip</span></a>
          <div className="nav-links"><a href="#deals">{t.dealsNav}</a><a href="#alerts">{t.alertsNav}</a><a href="#how">{t.howNav}</a></div>
          <div className="nav-actions">
            <select className="language-select" value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.language}>
              <option value="pt">PT</option><option value="en">EN</option><option value="es">ES</option>
            </select>
            <select className="currency-select" value={currency} onChange={(event) => setCurrency(event.target.value)} aria-label={t.currency}>
              <option>BRL</option><option>USD</option><option>EUR</option><option>GBP</option><option>AUD</option><option>CAD</option><option>JPY</option>
            </select>
            {user ? (
              <>
                <Link className="nav-trips" href="/trips">{t.myTrips}</Link>
                <details className="profile-menu">
                  <summary aria-label={t.profile}>{(user.user_metadata.full_name || user.email || 'V').slice(0, 1).toUpperCase()}</summary>
                  <div><Link href="/profile">{t.profile}</Link><button type="button" onClick={handleLogout}>{t.logout}</button></div>
                </details>
              </>
            ) : <Link className="sign-in" href="/login">{t.signIn}</Link>}
          </div>
        </nav>

        <div className="hero" id="top">
          <div className="eyebrow"><span>✦</span> {t.eyebrow}</div>
          <h1>{t.title}<br /><em>{t.accent}</em></h1>
          <p className="hero-copy">{t.hero}</p>
          <form className="search-card" key={locale} onSubmit={handleSearch}>
            <div className="trip-tabs" aria-label="Trip type">
              <label><input defaultChecked name="trip" type="radio" /> {t.roundTrip}</label>
              <label><input name="trip" type="radio" /> {t.oneWay}</label>
              <label><input name="trip" type="radio" /> {t.multiCity}</label>
            </div>
            <div className="search-grid">
              <label><span>{t.from}</span><input aria-label={t.from} defaultValue={t.originValue} /></label>
              <button className="swap" type="button" aria-label="Swap origin and destination">⇄</button>
              <label><span>{t.to}</span><input aria-label={t.to} defaultValue={t.destinationValue} /></label>
              <label><span>{t.depart}</span><input aria-label={t.depart} defaultValue={t.departValue} /></label>
              <label><span>{t.return}</span><input aria-label={t.return} defaultValue={t.returnValue} /></label>
              <label><span>{t.travelers}</span><input aria-label={t.travelers} defaultValue={t.travelersValue} /></label>
              <button className="search-button" type="submit">{t.search} <span>→</span></button>
            </div>
            <div className="search-options"><label><input type="checkbox" /> {t.miles}</label><p><span>✓</span> {t.searches}</p></div>
          </form>
          <div className="trust-row"><span>{t.compared}</span><b>{t.airlines}</b><b>{t.programs}</b><b>{t.partners}</b><b>{t.memberFares}</b></div>
        </div>
      </section>

      <section className="deals-section" id="deals">
        <div className="section-heading"><div><span className="section-kicker">Inspiração</span><h2>{t.worldCloser}</h2></div><Link href="/offers">{t.viewAll}</Link></div>
        <div className="deal-grid">
          {deals.map((deal, index) => (
            <article className={`deal-card ${deal.tone}`} key={deal.city}>
              <div className="deal-visual"><span className="deal-tag">{t.tags[index]}</span><div className="city-code">{deal.city.slice(0, 3).toUpperCase()}</div></div>
              <div className="deal-info"><div><h3>{deal.city}</h3><p>{t.countries[index]} · {deal.route}</p></div><div className="price"><span>{t.fromPrice}</span><strong>{deal.price}</strong><small>{t.roundTripPrice}</small></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="how-copy"><span className="section-kicker">{t.smarter}</span><h2>{t.searchingTitle}<br />{t.goingTitle}</h2><p>{t.howBody}</p><a href="#top">{t.start} <span>↗</span></a></div>
        <div className="steps">{t.steps.map((step, index) => <article key={step[0]}><span>0{index + 1}</span><div><h3>{step[0]}</h3><p>{step[1]}</p></div></article>)}</div>
      </section>

      <section className="alert-section" id="alerts">
        <div className="alert-orbit"><span>CDG</span><span>GIG</span><span>SYD</span></div>
        <div className="alert-content"><span className="section-kicker">{t.freeAlerts}</span><h2>{t.alertTitle}<br />{t.alertAccent}</h2><p>{t.alertBody}</p><div className="alert-form"><input aria-label="Email" placeholder={t.email} type="email" /><button onClick={() => window.location.assign(user ? '/alerts' : '/login?next=/alerts')}>{t.createAlert}</button></div><small>{t.noSpam}</small></div>
      </section>

      <section className="promise-section">
        {t.promises.map((promise, index) => <div key={promise[0]}><span>{['◎', '⌁', '◇'][index]}</span><h3>{promise[0]}</h3><p>{promise[1]}</p></div>)}
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">VT</span><span>VivaTrip</span></a><p>{t.tagline}</p>
        <div><a href="#deals">{t.dealsNav}</a><a href="#alerts">{t.alertsNav}</a><a href="#how">{t.howNav}</a><Link href="/affiliate-disclosure">{t.disclosure}</Link><Link href="/privacy">{t.privacy}</Link></div>
        <small>{t.footer}</small>
      </footer>
    </main>
  );
}
