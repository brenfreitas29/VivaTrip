"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type VivaTripLocale = "pt" | "en" | "es";

type LanguageContextValue = {
  locale: VivaTripLocale;
  localeTag: "pt-BR" | "en-US" | "es-AR";
  setLocale: (locale: VivaTripLocale) => void;
  translate: (value: string) => string;
};

const localeTags: Record<VivaTripLocale, "pt-BR" | "en-US" | "es-AR"> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-AR",
};

const common: Record<string, Record<VivaTripLocale, string>> = {
  "Início": { pt: "Início", en: "Home", es: "Inicio" },
  "Viagens": { pt: "Viagens", en: "Trips", es: "Viajes" },
  "Minhas viagens": { pt: "Minhas viagens", en: "My trips", es: "Mis viajes" },
  "Alertas": { pt: "Alertas", en: "Alerts", es: "Alertas" },
  "Milhas": { pt: "Milhas", en: "Miles", es: "Millas" },
  "Perfil": { pt: "Perfil", en: "Profile", es: "Perfil" },
  "Plano": { pt: "Plano", en: "Plan", es: "Plan" },
  "Entrar": { pt: "Entrar", en: "Sign in", es: "Ingresar" },
  "Sair": { pt: "Sair", en: "Sign out", es: "Salir" },
  "Salvar": { pt: "Salvar", en: "Save", es: "Guardar" },
  "Cancelar": { pt: "Cancelar", en: "Cancel", es: "Cancelar" },
  "Excluir": { pt: "Excluir", en: "Delete", es: "Eliminar" },
  "Editar": { pt: "Editar", en: "Edit", es: "Editar" },
  "Idioma": { pt: "Idioma", en: "Language", es: "Idioma" },
  "Moeda": { pt: "Moeda", en: "Currency", es: "Moneda" },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<VivaTripLocale>("pt");

  useEffect(() => {
    const saved = window.localStorage.getItem("vivatrip-language");
    if (saved === "pt" || saved === "en" || saved === "es") {
      setLocaleState(saved);
      return;
    }
    const browser = navigator.language.toLowerCase();
    if (browser.startsWith("es")) setLocaleState("es");
    else if (browser.startsWith("en")) setLocaleState("en");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("vivatrip-language", locale);
    document.documentElement.lang = localeTags[locale];
    document.documentElement.dataset.locale = locale;

    document.querySelectorAll("select.language-select:not([data-global-language])").forEach((element) => {
      const select = element as unknown as { value: string; dispatchEvent: (event: Event) => boolean };
      if (select.value !== locale) {
        select.value = locale;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }, [locale]);

  useEffect(() => {
    const onChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement) || !target.classList.contains("language-select")) return;
      const next = target.value;
      if (next === "pt" || next === "en" || next === "es") setLocaleState(next);
    };
    document.addEventListener("change", onChange, true);
    return () => document.removeEventListener("change", onChange, true);
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    localeTag: localeTags[locale],
    setLocale: setLocaleState,
    translate: (text: string) => common[text]?.[locale] || text,
  }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <div className="global-language-switcher" data-no-translate>
        <span aria-hidden="true">🌐</span>
        <select
          data-global-language
          className="language-select"
          value={locale}
          onChange={(event) => setLocaleState(event.target.value as VivaTripLocale)}
          aria-label={locale === "en" ? "Language" : "Idioma"}
        >
          <option value="pt">PT · Português</option>
          <option value="en">EN · English</option>
          <option value="es">ES · Español</option>
        </select>
      </div>
      <style jsx global>{`
        .global-language-switcher {
          position: fixed;
          top: 14px;
          right: 14px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 9px;
          border: 1px solid rgba(7, 55, 48, .16);
          border-radius: 999px;
          background: rgba(255, 255, 250, .94);
          box-shadow: 0 8px 30px rgba(7, 55, 48, .10);
          backdrop-filter: blur(12px);
        }
        .global-language-switcher .language-select {
          border: 0;
          background: transparent;
          color: #073730;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          outline: none;
        }
        .global-language-switcher:focus-within {
          outline: 2px solid #ff7145;
          outline-offset: 2px;
        }
        @media (max-width: 720px) {
          .global-language-switcher { top: 8px; right: 8px; padding: 6px 8px; }
          .global-language-switcher .language-select { font-size: 12px; }
        }
      `}</style>
    </LanguageContext.Provider>
  );
}
