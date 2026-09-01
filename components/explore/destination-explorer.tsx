"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { COUNTRY_CODES } from "@/types/profile";

type FeaturedDestination = { city: string; countryCode: string; text: string; image: string };

const featured: FeaturedDestination[] = [
  { city: "Lisboa", countryCode: "PT", text: "Cultura, gastronomia e miradouros", image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80" },
  { city: "Tóquio", countryCode: "JP", text: "Bairros, tecnologia e tradição", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80" },
  { city: "Buenos Aires", countryCode: "AR", text: "Arte, cafés e arquitetura", image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80" },
  { city: "Rio de Janeiro", countryCode: "BR", text: "Natureza, praia e cidade", image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80" },
  { city: "Paris", countryCode: "FR", text: "Museus, bairros e gastronomia", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" },
  { city: "Roma", countryCode: "IT", text: "História, praças e culinária", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80" },
  { city: "Barcelona", countryCode: "ES", text: "Arquitetura, praias e vida urbana", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80" },
  { city: "Nova York", countryCode: "US", text: "Cultura, bairros e grandes ícones", image: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1200&q=80" },
  { city: "Sydney", countryCode: "AU", text: "Costa, natureza e vida urbana", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80" },
  { city: "Cidade do Cabo", countryCode: "ZA", text: "Montanhas, costa e paisagens", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80" },
  { city: "Bangkok", countryCode: "TH", text: "Templos, mercados e gastronomia", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80" },
  { city: "Marrakech", countryCode: "MA", text: "Medina, mercados e arquitetura", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=80" },
];

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

export function DestinationExplorer() {
  const [query, setQuery] = useState("");
  const { localeTag } = useLanguage();
  const names = useMemo(() => new Intl.DisplayNames([localeTag], { type: "region" }), [localeTag]);
  const countries = useMemo(() => COUNTRY_CODES.map((code) => ({ code, name: names.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name, localeTag)), [names, localeTag]);
  const normalized = normalize(query.trim());
  const filteredFeatured = featured.filter((place) => !normalized || normalize(`${place.city} ${names.of(place.countryCode) || place.countryCode}`).includes(normalized));
  const filteredCountries = countries.filter((country) => !normalized || normalize(country.name).includes(normalized)).slice(0, normalized ? 24 : 12);

  return <>
    <label className="destination-search"><span>Buscar cidade ou país</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: Japão, Brasil, Paris…" autoComplete="off" /></label>
    {filteredFeatured.length > 0 && <section className="explore-grid" aria-label="Destinos em destaque">{filteredFeatured.map((place) => { const country = names.of(place.countryCode) || place.countryCode; return <article key={`${place.countryCode}-${place.city}`} className="destination-card"><img src={place.image} alt={`Vista de ${place.city}, ${country}`} loading="lazy" decoding="async" /><div className="destination-card-body"><span>{country}</span><h2>{place.city}</h2><p>{place.text}</p><Link href={`/trips/new?destination=${encodeURIComponent(place.city)}&country=${place.countryCode}`}>Planejar →</Link></div></article>; })}</section>}
    <section className="country-directory" aria-labelledby="country-directory-title"><div><span className="auth-eyebrow">Cobertura global</span><h2 id="country-directory-title">Planeje uma viagem para qualquer país</h2><p>Selecione um país e informe a cidade na próxima etapa. Destinos em destaque recebem fotografia específica; a galeria continuará crescendo com imagens licenciadas.</p></div><div className="country-chip-grid">{filteredCountries.map((country) => <Link key={country.code} href={`/trips/new?country=${country.code}`}>{country.name}<span>→</span></Link>)}</div>{normalized && filteredCountries.length === 0 && filteredFeatured.length === 0 && <p>Nenhum destino encontrado. Tente o nome de outro país ou cidade.</p>}</section>
  </>;
}
