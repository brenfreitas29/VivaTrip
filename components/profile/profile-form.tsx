"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import {
  COUNTRY_CODES,
  PROFILE_CURRENCIES,
  PROFILE_LANGUAGES,
  type Profile,
  type ProfileInput,
  type TravelStyle,
} from "@/types/profile";

type FieldErrors = Partial<Record<keyof ProfileInput, string>>;

const languageLabels = { pt: "Português", en: "English", es: "Español" } as const;
const travelStyleLabels: Record<TravelStyle, { title: string; description: string }> = {
  relaxed: { title: "Tranquilo", description: "Mais tempo livre e menos compromissos." },
  moderate: { title: "Moderado", description: "Equilíbrio entre passeios e descanso." },
  intensive: { title: "Intenso", description: "Aproveitar ao máximo cada dia." },
};

function emptyProfile(name: string): ProfileInput {
  return {
    name,
    nationality: null,
    passport_country: null,
    country_of_residence: null,
    preferred_language: "pt",
    currency: "USD",
    home_airport: null,
    travel_style: "moderate",
  };
}

export function ProfileForm({ email, initialName }: { email: string; initialName: string }) {
  const { localeTag, setLocale } = useLanguage();
  const [profile, setProfile] = useState<ProfileInput>(() => emptyProfile(initialName));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const countries = useMemo(() => {
    const displayNames = new Intl.DisplayNames([localeTag], { type: "region" });
    return COUNTRY_CODES.map((code) => ({ code, name: displayNames.of(code) || code }))
      .sort((a, b) => a.name.localeCompare(b.name, localeTag));
  }, [localeTag]);

  useEffect(() => {
    void fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as { profile?: Profile; error?: string };
        if (!response.ok || !body.profile) throw new Error(body.error);
        setProfile({
          name: body.profile.name || initialName,
          nationality: body.profile.nationality,
          passport_country: body.profile.passport_country,
          country_of_residence: body.profile.country_of_residence,
          preferred_language: body.profile.preferred_language,
          currency: body.profile.currency,
          home_airport: body.profile.home_airport,
          travel_style: body.profile.travel_style || "moderate",
        });
      })
      .catch((loadError: Error) => setError(loadError.message || "Não foi possível carregar seu perfil."))
      .finally(() => setLoading(false));
  }, [initialName]);

  function change<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setMessage("");
  }

  function changePreferredLanguage(value: ProfileInput["preferred_language"]) {
    change("preferred_language", value);
    setLocale(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    setFieldErrors({});

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const body = await response.json() as { profile?: Profile; error?: string; fields?: FieldErrors };

    if (!response.ok || !body.profile) {
      setError(body.error || "Não foi possível salvar seu perfil.");
      setFieldErrors(body.fields || {});
      setSaving(false);
      return;
    }

    setMessage("Perfil salvo com sucesso.");
    setSaving(false);
  }

  if (loading) {
    return <div className="profile-loading" role="status"><span /><span /><span />Carregando seu perfil…</div>;
  }

  return (
    <form className="traveler-profile" onSubmit={handleSubmit}>
      <section className="profile-section">
        <div className="profile-section-heading"><span>01</span><div><h2>Informações pessoais</h2><p>Os dados essenciais para personalizar sua experiência.</p></div></div>
        <div className="profile-fields two-columns">
          <label><span>Nome</span><input value={profile.name || ""} onChange={(event) => change("name", event.target.value)} required />{fieldErrors.name ? <small className="field-error">{fieldErrors.name}</small> : null}</label>
          <label><span>E-mail</span><input value={email} disabled /><small>Vinculado à sua conta VivaTrip.</small></label>
          <CountrySelect label="Nacionalidade" value={profile.nationality} countries={countries} onChange={(value) => change("nationality", value)} error={fieldErrors.nationality} />
          <CountrySelect label="País do passaporte" value={profile.passport_country} countries={countries} onChange={(value) => change("passport_country", value)} error={fieldErrors.passport_country} />
          <CountrySelect label="País de residência" value={profile.country_of_residence} countries={countries} onChange={(value) => change("country_of_residence", value)} error={fieldErrors.country_of_residence} />
        </div>
        <p className="profile-privacy">A VivaTrip solicita somente o país emissor do passaporte — nunca número, foto ou documento de identidade.</p>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><span>02</span><div><h2>Preferências de viagem</h2><p>Conte como você gosta de descobrir o mundo.</p></div></div>
        <div className="travel-style-grid">
          {(Object.keys(travelStyleLabels) as TravelStyle[]).map((style) => (
            <label className={profile.travel_style === style ? "selected" : ""} key={style}>
              <input type="radio" name="travelStyle" checked={profile.travel_style === style} onChange={() => change("travel_style", style)} />
              <strong>{travelStyleLabels[style].title}</strong><small>{travelStyleLabels[style].description}</small>
            </label>
          ))}
        </div>
        {fieldErrors.travel_style ? <small className="field-error">{fieldErrors.travel_style}</small> : null}
        <div className="profile-fields">
          <label><span>Aeroporto de origem</span><input value={profile.home_airport || ""} maxLength={3} placeholder="GRU" onChange={(event) => change("home_airport", event.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} /><small>Código IATA com 3 letras.</small>{fieldErrors.home_airport ? <small className="field-error">{fieldErrors.home_airport}</small> : null}</label>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><span>03</span><div><h2>Configurações</h2><p>Idioma e moeda que você prefere usar.</p></div></div>
        <div className="profile-fields two-columns">
          <label><span>Idioma preferido</span><select value={profile.preferred_language} onChange={(event) => changePreferredLanguage(event.target.value as ProfileInput["preferred_language"])}>{PROFILE_LANGUAGES.map((language) => <option key={language} value={language}>{languageLabels[language]}</option>)}</select></label>
          <label><span>Moeda preferida</span><select value={profile.currency} onChange={(event) => change("currency", event.target.value as ProfileInput["currency"])}>{PROFILE_CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}</select></label>
        </div>
      </section>

      <div className="profile-savebar">
        <div>{error ? <p className="profile-feedback error" role="alert">{error}</p> : null}{message ? <p className="profile-feedback success" role="status">✓ {message}</p> : null}</div>
        <button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar perfil"}</button>
      </div>
    </form>
  );
}

function CountrySelect({ label, value, countries, onChange, error }: { label: string; value: string | null; countries: { code: string; name: string }[]; onChange: (value: string | null) => void; error?: string }) {
  return (
    <label><span>{label}</span><select value={value || ""} onChange={(event) => onChange(event.target.value || null)}><option value="">Selecionar país</option>{countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select>{error ? <small className="field-error">{error}</small> : null}</label>
  );
}
