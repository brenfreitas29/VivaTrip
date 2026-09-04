'use client';

import Link from 'next/link';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FlightMetaSearch } from '@/components/home/flight-metasearch';

type Locale = 'pt' | 'en' | 'es';
type Destination = { city: string; country: { pt: string; en: string; es: string }; image: string; countryCode: string };

const destinations: Destination[] = [
  { city: 'Tokyo', country: { pt: 'Japão', en: 'Japan', es: 'Japón' }, countryCode: 'JP', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=700&q=86' },
  { city: 'Kyoto', country: { pt: 'Japão', en: 'Japan', es: 'Japón' }, countryCode: 'JP', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=700&q=86' },
  { city: 'Osaka', country: { pt: 'Japão', en: 'Japan', es: 'Japón' }, countryCode: 'JP', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=700&q=86' },
  { city: 'Seoul', country: { pt: 'Coreia do Sul', en: 'South Korea', es: 'Corea del Sur' }, countryCode: 'KR', image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=700&q=86' },
  { city: 'Busan', country: { pt: 'Coreia do Sul', en: 'South Korea', es: 'Corea del Sur' }, countryCode: 'KR', image: 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?auto=format&fit=crop&w=700&q=86' },
];

const copy = {
  pt: { trips: 'Viagens', discover: 'Descobrir', saved: 'Salvos', itinerary: 'Roteiro', planner: 'Planejador', titleA: 'Explorar', titleB: 'um mundo maior', subtitle: 'Compare voos em dinheiro e milhas. Encontre a melhor opção para a sua viagem.', language: 'Idioma', signIn: 'Entrar', profile: 'Perfil', logout: 'Sair' },
  en: { trips: 'Trips', discover: 'Discover', saved: 'Saved', itinerary: 'Itinerary', planner: 'Planner', titleA: 'Explore', titleB: 'a bigger world', subtitle: 'Compare flights with cash and miles. Find the best option for your trip.', language: 'Language', signIn: 'Sign in', profile: 'Profile', logout: 'Sign out' },
  es: { trips: 'Viajes', discover: 'Descubrir', saved: 'Guardados', itinerary: 'Itinerario', planner: 'Planificador', titleA: 'Explora', titleB: 'un mundo más grande', subtitle: 'Compara vuelos con dinero y millas. Encuentra la mejor opción para tu viaje.', language: 'Idioma', signIn: 'Ingresar', profile: 'Perfil', logout: 'Salir' },
} as const;

export default function Home() {
  const [locale, setLocale] = useState<Locale>('pt');
  const [user, setUser] = useState<User | null>(null);
  const t = copy[locale];

  useEffect(() => {
    const stored = window.localStorage.getItem('vivatrip-language');
    if (stored === 'pt' || stored === 'en' || stored === 'es') setLocale(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('vivatrip-language', locale);
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-AR' : 'en-US';
  }, [locale]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    void createClient().then(async (supabase) => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      const authState = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => setUser(session?.user ?? null));
      unsubscribe = () => authState.data.subscription.unsubscribe();
    }).catch(() => undefined);
    return () => unsubscribe?.();
  }, []);

  const firstName = useMemo(() => {
    const raw = String(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Viajante').trim();
    return raw.split(/\s+/)[0] || 'Viajante';
  }, [user]);

  async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <main className="reference-home">
      <nav className="reference-nav" aria-label="Main navigation">
        <Link className="reference-brand" href="/" aria-label="VivaTrip"><span>VivaTrip</span><span className="plane-mark" aria-hidden="true">✈</span></Link>
        <div className="reference-links"><Link href="/trips">{t.trips}</Link><Link href="/explore">{t.discover}</Link><Link href="/alerts">{t.saved}</Link><Link href="/trips">{t.itinerary}</Link><Link href="/trips/new">{t.planner}</Link></div>
        <div className="reference-actions">
          <label className="reference-language"><span aria-hidden="true">◎</span><select className="language-select" value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.language}><option value="pt">PT</option><option value="en">EN</option><option value="es">ES</option></select></label>
          <span className="nav-divider" />
          {user ? <details className="reference-profile"><summary><span className="profile-avatar">{firstName.slice(0, 1).toUpperCase()}</span><span>{firstName}</span><span className="chevron">⌄</span></summary><div className="profile-popover"><Link href="/profile">{t.profile}</Link><button type="button" onClick={logout}>{t.logout}</button></div></details> : <Link className="reference-signin" href="/login">{t.signIn}</Link>}
        </div>
      </nav>

      <section className="reference-hero">
        <div className="hero-overlay" />
        <div className="hero-copy-reference"><h1><span>{t.titleA}</span><br />{t.titleB}</h1><p>{t.subtitle}</p></div>
        <FlightMetaSearch locale={locale} />
        <div className="reference-destinations" aria-label="Featured destinations">
          {destinations.map((destination) => <Link className="reference-card" key={destination.city} href={`/trips/new?destination=${encodeURIComponent(destination.city)}&country=${destination.countryCode}`}><img src={destination.image} alt={`${destination.city}, ${destination.country[locale]}`} loading="eager" /><strong>{destination.city}</strong><span>{destination.country[locale]}</span></Link>)}
        </div>
      </section>

      <style jsx global>{`
        body{margin:0;background:#f6f5fb}.global-language-switcher{display:none!important}.reference-home{min-height:100vh;background:#f7f6fb;color:#11104d;font-family:Arial,Helvetica,sans-serif}.reference-nav{height:102px;padding:0 6.25vw;background:rgba(255,255,255,.98);display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:32px;position:relative;z-index:20;box-shadow:0 1px 0 rgba(25,21,82,.05)}.reference-brand{display:inline-flex;align-items:center;gap:10px;color:#221879;text-decoration:none;font-size:28px;font-weight:800;letter-spacing:-.8px;width:max-content}.plane-mark{font-size:34px;line-height:1;transform:rotate(-10deg);color:#4231bc}.reference-links{display:flex;gap:clamp(28px,3.6vw,56px);align-items:center;justify-content:center}.reference-links a{color:#14104c;text-decoration:none;font-size:16px;font-weight:500;white-space:nowrap}.reference-links a:hover{color:#6046f5}.reference-actions{justify-self:end;display:flex;align-items:center;gap:18px}.reference-language{display:flex;align-items:center;gap:7px;font-size:18px}.reference-language select{border:0;background:transparent;color:#15104d;font-size:15px;font-weight:700;outline:none;cursor:pointer}.nav-divider{width:1px;height:40px;background:#dad8e9}.reference-signin{color:#15104d;font-weight:700}.reference-profile{position:relative}.reference-profile summary{list-style:none;display:flex;align-items:center;gap:10px;cursor:pointer;font-size:15px}.reference-profile summary::-webkit-details-marker{display:none}.profile-avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:white;font-weight:800;background:linear-gradient(145deg,#3020a4,#f18465)}.profile-popover{position:absolute;right:0;top:52px;min-width:150px;background:white;border:1px solid #eceaf5;border-radius:14px;padding:8px;box-shadow:0 18px 45px rgba(32,22,85,.15)}.profile-popover a,.profile-popover button{display:block;width:100%;padding:10px 12px;text-align:left;border:0;background:transparent;color:#17114d;text-decoration:none;cursor:pointer;border-radius:9px;font:inherit}.profile-popover a:hover,.profile-popover button:hover{background:#f4f1ff}.reference-hero{min-height:calc(100vh - 102px);position:relative;overflow:hidden;background-image:url('https://images.unsplash.com/photo-1570459027562-4a916cc6113f?auto=format&fit=crop&w=2200&q=90');background-size:cover;background-position:center 48%;padding:1px 0 48px}.hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(32,50,104,.5) 0%,rgba(25,43,95,.16) 50%,rgba(17,33,75,.03) 76%),linear-gradient(180deg,rgba(255,255,255,.02) 54%,rgba(250,244,252,.79) 100%)}.hero-copy-reference{position:relative;z-index:2;width:min(1480px,90vw);margin:70px auto 0;color:#fff}.hero-copy-reference h1{margin:0;font-size:clamp(58px,6vw,98px);line-height:.95;letter-spacing:-4px;font-weight:800;text-shadow:0 2px 18px rgba(20,30,80,.16)}.hero-copy-reference p{margin:26px 0 0;max-width:760px;font-size:clamp(17px,1.5vw,24px);line-height:1.45;font-weight:500}.reference-destinations{position:relative;z-index:4;width:min(1480px,92vw);margin:34px auto 0;display:grid;grid-template-columns:repeat(5,1fr);gap:14px;align-items:end}.reference-card{min-width:0;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(247,246,251,.98));border-radius:22px;padding:9px 9px 16px;text-decoration:none;color:#17114c;box-shadow:0 14px 32px rgba(28,23,72,.18);border:1px solid rgba(255,255,255,.9);transition:transform .2s ease,box-shadow .2s ease}.reference-card:hover{transform:translateY(-5px);box-shadow:0 20px 38px rgba(28,23,72,.23)}.reference-card img{width:100%;aspect-ratio:1.45/1;object-fit:cover;display:block;border-radius:16px}.reference-card strong{display:block;margin:12px 8px 3px;font-size:18px}.reference-card span{display:block;margin:0 8px;color:#6e6a8f;font-size:13px}@media(max-width:1050px){.reference-nav{grid-template-columns:auto 1fr auto;padding:0 28px}.reference-links{gap:20px}.reference-links a:nth-child(3),.reference-links a:nth-child(4){display:none}.reference-destinations{grid-template-columns:repeat(5,220px);overflow-x:auto;width:auto;margin-left:4vw;margin-right:0;padding:0 4vw 18px 0;scrollbar-width:none}.reference-destinations::-webkit-scrollbar{display:none}}@media(max-width:720px){.reference-nav{height:78px;padding:0 18px;grid-template-columns:auto 1fr auto;gap:12px}.reference-brand{font-size:22px}.plane-mark{font-size:27px}.reference-links{display:none}.nav-divider,.reference-language span{display:none}.reference-actions{gap:8px}.reference-profile summary>span:nth-child(2),.chevron{display:none}.reference-hero{min-height:calc(100vh - 78px);background-position:63% center;padding-bottom:28px}.hero-copy-reference{width:92vw;margin-top:54px}.hero-copy-reference h1{font-size:clamp(46px,15vw,70px);letter-spacing:-3px}.hero-copy-reference p{margin-top:18px;font-size:17px}.reference-destinations{margin-top:30px;grid-template-columns:repeat(5,178px)}.reference-card{border-radius:18px}.reference-card img{border-radius:13px}.reference-card strong{font-size:16px}}
      `}</style>
    </main>
  );
}
