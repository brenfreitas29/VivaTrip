'use client';

import Link from 'next/link';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FlightMetaSearch } from '@/components/home/flight-metasearch';

type Locale = 'pt' | 'en' | 'es';

const copy = {
  pt: {
    trips:'Viagens', discover:'Descobrir', alerts:'Alertas', planner:'Planejador', profile:'Perfil', logout:'Sair', signIn:'Entrar', language:'Idioma',
    eyebrow:'PLANEJE MELHOR. VIAJE MAIS.', titleA:'Sua próxima', titleAccent:'viagem', titleB:'começa aqui', subtitle:'Roteiros personalizados, alertas de preços, dicas locais e tudo o que você precisa em um só lugar.',
    feature1:'Roteiros personalizados', feature1Text:'Planos criados sob medida para o seu estilo de viagem.', feature2:'Alertas de preços', feature2Text:'Saiba a hora certa de comprar suas passagens e se hospedar.', feature3:'Tudo em um só lugar', feature3Text:'Roteiro, reservas, documentos, clima, mapa e muito mais.',
    howEyebrow:'COMO FUNCIONA', howTitle:'Do plano à viagem em poucos passos', howText:'Planejar sua próxima viagem com o VivaTrip é simples, rápido e intuitivo.',
    step1:'Conte seus planos', step1Text:'Escolha destino, datas e o estilo da sua viagem.', step2:'Receba seu roteiro', step2Text:'A VivaTrip organiza uma sugestão personalizada para você.', step3:'Viaje com tudo organizado', step3Text:'Acompanhe roteiro, clima, mapa, documentos e alertas no mesmo lugar.'
  },
  en: {
    trips:'Trips', discover:'Discover', alerts:'Alerts', planner:'Planner', profile:'Profile', logout:'Sign out', signIn:'Sign in', language:'Language',
    eyebrow:'PLAN BETTER. TRAVEL MORE.', titleA:'Your next', titleAccent:'trip', titleB:'starts here', subtitle:'Personalized itineraries, price alerts, local tips and everything you need in one place.',
    feature1:'Personalized itineraries', feature1Text:'Plans tailored to your travel style.', feature2:'Price alerts', feature2Text:'Know the right time to buy flights and book stays.', feature3:'Everything in one place', feature3Text:'Itinerary, bookings, documents, weather, maps and more.',
    howEyebrow:'HOW IT WORKS', howTitle:'From plan to trip in a few steps', howText:'Planning your next trip with VivaTrip is simple, fast and intuitive.',
    step1:'Tell us your plans', step1Text:'Choose destination, dates and your travel style.', step2:'Get your itinerary', step2Text:'VivaTrip organizes a personalized suggestion for you.', step3:'Travel organized', step3Text:'Keep itinerary, weather, map, documents and alerts together.'
  },
  es: {
    trips:'Viajes', discover:'Descubrir', alerts:'Alertas', planner:'Planificador', profile:'Perfil', logout:'Salir', signIn:'Ingresar', language:'Idioma',
    eyebrow:'PLANEA MEJOR. VIAJA MÁS.', titleA:'Tu próximo', titleAccent:'viaje', titleB:'empieza aquí', subtitle:'Itinerarios personalizados, alertas de precios, consejos locales y todo lo que necesitas en un solo lugar.',
    feature1:'Itinerarios personalizados', feature1Text:'Planes creados a medida para tu estilo de viaje.', feature2:'Alertas de precios', feature2Text:'Conoce el momento indicado para comprar vuelos y reservar alojamiento.', feature3:'Todo en un solo lugar', feature3Text:'Itinerario, reservas, documentos, clima, mapa y mucho más.',
    howEyebrow:'CÓMO FUNCIONA', howTitle:'Del plan al viaje en pocos pasos', howText:'Planear tu próximo viaje con VivaTrip es simple, rápido e intuitivo.',
    step1:'Cuéntanos tus planes', step1Text:'Elige destino, fechas y estilo de viaje.', step2:'Recibe tu itinerario', step2Text:'VivaTrip organiza una propuesta personalizada para ti.', step3:'Viaja con todo organizado', step3Text:'Consulta itinerario, clima, mapa, documentos y alertas en un solo lugar.'
  }
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
    <main className="reference-home clean-reference-home">
      <nav className="reference-nav" aria-label="Main navigation">
        <Link className="reference-brand" href="/" aria-label="VivaTrip"><span>VivaTrip</span><span className="brand-gem" aria-hidden="true" /></Link>
        <div className="reference-links"><Link href="/trips">{t.trips}</Link><Link href="/explore">{t.discover}</Link><Link href="/alerts">{t.alerts}</Link><Link href="/trips/new">{t.planner}</Link><Link href="/profile">{t.profile}</Link></div>
        <div className="reference-actions">
          <label className="reference-language"><span aria-hidden="true">◉</span><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.language}><option value="pt">PT · Português</option><option value="en">EN · English</option><option value="es">ES · Español</option></select></label>
          {user ? <details className="reference-profile"><summary><span className="profile-avatar">{firstName.slice(0,1).toUpperCase()}</span></summary><div className="profile-popover"><Link href="/profile">{t.profile}</Link><button type="button" onClick={logout}>{t.logout}</button></div></details> : <Link className="reference-signin" href="/login">{t.signIn}</Link>}
        </div>
      </nav>

      <section className="reference-hero clean-hero">
        <div className="hero-overlay" />
        <div className="hero-copy-reference clean-hero-copy">
          <span className="hero-eyebrow">{t.eyebrow}</span>
          <h1>{t.titleA}<br/><span>{t.titleAccent}</span> {t.titleB}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="search-shell"><FlightMetaSearch locale={locale} /></div>
      </section>

      <section className="benefits-strip" aria-label="Vantagens VivaTrip">
        <article><div className="benefit-icon">✧</div><div><strong>{t.feature1}</strong><p>{t.feature1Text}</p></div></article>
        <article><div className="benefit-icon">◇</div><div><strong>{t.feature2}</strong><p>{t.feature2Text}</p></div></article>
        <article><div className="benefit-icon">▱</div><div><strong>{t.feature3}</strong><p>{t.feature3Text}</p></div></article>
      </section>

      <section className="how-section">
        <div className="how-heading"><span>{t.howEyebrow}</span><h2>{t.howTitle}</h2><p>{t.howText}</p></div>
        <div className="how-grid">
          <article><span>01</span><h3>{t.step1}</h3><p>{t.step1Text}</p></article>
          <article><span>02</span><h3>{t.step2}</h3><p>{t.step2Text}</p></article>
          <article><span>03</span><h3>{t.step3}</h3><p>{t.step3Text}</p></article>
        </div>
      </section>

      <style jsx global>{`
        body{margin:0;background:#fff}.global-language-switcher{display:none!important}.reference-home{min-height:100vh;background:#fff;color:#0c104d;font-family:Arial,Helvetica,sans-serif}.reference-nav{height:72px;padding:0 5.6vw;background:#fff;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:28px;position:relative;z-index:30;box-shadow:0 1px 0 rgba(25,21,82,.06)}.reference-brand{display:inline-flex;align-items:center;gap:8px;color:#17104d;text-decoration:none;font:800 22px Georgia,'Times New Roman',serif;letter-spacing:.2px;width:max-content}.brand-gem{width:20px;height:20px;border-radius:3px;background:linear-gradient(135deg,#6f57ff,#a18fff)}.reference-links{display:flex;gap:38px;align-items:center;justify-content:center}.reference-links a{color:#11104b;text-decoration:none;font-size:13px;font-weight:700;white-space:nowrap}.reference-actions{justify-self:end;display:flex;align-items:center;gap:13px}.reference-language{height:36px;display:flex;align-items:center;gap:7px;border:1px solid #dedcf1;border-radius:18px;padding:0 10px;color:#5f49ef;background:#fff}.reference-language select{border:0;background:transparent;color:#18114e;font-size:12px;font-weight:700;outline:none;cursor:pointer;max-width:120px}.reference-signin{color:#17114d;text-decoration:none;font-size:13px;font-weight:800}.reference-profile{position:relative}.reference-profile summary{list-style:none;cursor:pointer}.reference-profile summary::-webkit-details-marker{display:none}.profile-avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:#fff;background:#5b43ee;font-weight:800}.profile-popover{position:absolute;right:0;top:42px;min-width:150px;background:#fff;border:1px solid #eceaf5;border-radius:14px;padding:8px;box-shadow:0 18px 45px rgba(32,22,85,.15)}.profile-popover a,.profile-popover button{display:block;width:100%;padding:10px 12px;text-align:left;border:0;background:transparent;color:#17114d;text-decoration:none;cursor:pointer;border-radius:9px;font:inherit}.profile-popover a:hover,.profile-popover button:hover{background:#f4f1ff}
        .clean-hero{height:510px;min-height:510px;position:relative;overflow:visible;background-image:url('https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=2400&q=90');background-size:cover;background-position:center 56%;padding:1px 0}.clean-hero .hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(16,22,66,.73) 0%,rgba(19,25,69,.39) 47%,rgba(14,19,58,.08) 78%)}.clean-hero-copy{position:relative;z-index:2;width:min(1280px,80vw);margin:80px auto 0;color:#fff}.hero-eyebrow{display:block;margin-bottom:14px;font-size:13px;font-weight:850;letter-spacing:.02em}.clean-hero-copy h1{margin:0;font:700 clamp(42px,4.25vw,68px)/.95 Georgia,'Times New Roman',serif;letter-spacing:-2px;text-shadow:0 2px 16px rgba(11,11,42,.18)}.clean-hero-copy h1 span{color:#8b73ff}.clean-hero-copy p{margin:20px 0 0;max-width:585px;font-size:16px;line-height:1.45;font-weight:500}.search-shell{position:absolute;z-index:5;left:50%;bottom:24px;transform:translateX(-50%);width:min(1280px,80vw)}
        .clean-reference-home .fm-wrap{width:100%!important;margin:0!important}.clean-reference-home .fm-card{background:#fff!important;border:0!important;border-radius:20px!important;padding:18px 22px 20px!important;box-shadow:0 14px 38px rgba(20,16,72,.22)!important}.clean-reference-home .fm-top,.clean-reference-home .fm-usdline{display:none!important}.clean-reference-home .fm-grid{grid-template-columns:1.25fr 1.25fr .9fr .9fr .65fr .75fr auto!important;gap:10px!important}.clean-reference-home .fm-grid label,.clean-reference-home .fm-airport-field{min-height:60px!important;border:1px solid #e4e1f0!important;border-radius:12px!important;padding:8px 12px!important;background:#fff!important}.clean-reference-home .fm-grid label>span,.clean-reference-home .fm-airport-field>span{font-size:11px!important;color:#625e7c!important;font-weight:750!important}.clean-reference-home .fm-grid input,.clean-reference-home .fm-grid select{font-size:13px!important;color:#17114d!important;font-weight:700!important}.clean-reference-home .fm-grid button[type='submit']{min-height:60px!important;border-radius:12px!important;background:linear-gradient(135deg,#7257ff,#5039ed)!important;color:#fff!important;border:0!important;padding:0 21px!important;font-weight:850!important;box-shadow:none!important}
        .benefits-strip{width:min(1280px,80vw);margin:0 auto;padding:46px 0 38px;display:grid;grid-template-columns:repeat(3,1fr);gap:0}.benefits-strip article{display:grid;grid-template-columns:54px 1fr;gap:14px;align-items:center;padding:0 28px;border-right:1px solid #e5e2ef}.benefits-strip article:first-child{padding-left:0}.benefits-strip article:last-child{border-right:0}.benefit-icon{width:54px;height:54px;border-radius:14px;background:#f1edff;color:#654af4;display:grid;place-items:center;font-size:25px;font-weight:700}.benefits-strip strong{display:block;font-size:14px;color:#11104b}.benefits-strip p{margin:7px 0 0;color:#716e88;font-size:13px;line-height:1.5;max-width:290px}
        .how-section{width:min(1280px,80vw);margin:0 auto;padding:34px 0 90px}.how-heading span{color:#5c43ee;font-size:12px;font-weight:850;letter-spacing:.04em}.how-heading h2{margin:10px 0 7px;font:700 clamp(30px,3vw,46px)/1.04 Georgia,'Times New Roman',serif;letter-spacing:-1.4px;color:#11104b}.how-heading p{margin:0;color:#77728e;font-size:14px}.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px}.how-grid article{min-height:155px;border:1px solid #ece9f5;border-radius:18px;padding:24px;background:linear-gradient(180deg,#fff,#fbfaff);box-shadow:0 10px 28px rgba(38,28,92,.05)}.how-grid article>span{color:#6a50f1;font-size:12px;font-weight:900}.how-grid h3{margin:14px 0 7px;color:#17114d;font-size:18px}.how-grid p{margin:0;color:#77728e;font-size:13px;line-height:1.55}
        @media(max-width:1050px){.reference-nav{grid-template-columns:auto 1fr auto;padding:0 24px}.reference-links{gap:20px}.reference-links a:nth-child(3),.reference-links a:nth-child(5){display:none}.clean-hero-copy,.search-shell,.benefits-strip,.how-section{width:min(92vw,900px)}.clean-reference-home .fm-grid{grid-template-columns:repeat(2,1fr)!important}.clean-reference-home .fm-grid button[type='submit']{grid-column:1/-1}.benefits-strip{grid-template-columns:1fr;gap:18px}.benefits-strip article{border-right:0;border-bottom:1px solid #ece9f5;padding:0 0 18px}.benefits-strip article:last-child{border-bottom:0}.how-grid{grid-template-columns:1fr}}
        @media(max-width:720px){.reference-nav{height:66px;padding:0 16px;grid-template-columns:auto 1fr auto}.reference-links{display:none}.reference-brand{font-size:20px}.reference-language select{max-width:78px}.clean-hero{height:650px;min-height:650px;background-position:63% center}.clean-hero-copy{margin-top:58px}.clean-hero-copy h1{font-size:48px}.clean-hero-copy p{font-size:15px;max-width:90%}.search-shell{bottom:18px}.clean-reference-home .fm-card{padding:14px!important}.clean-reference-home .fm-grid{grid-template-columns:1fr!important}.clean-reference-home .fm-grid button[type='submit']{grid-column:auto}.benefits-strip{padding-top:34px}.how-section{padding-bottom:60px}}
      `}</style>
    </main>
  );
}
