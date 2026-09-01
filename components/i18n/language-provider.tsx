"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type VivaTripLocale = "pt" | "en" | "es";

type Translation = { pt: string; en: string; es: string };

type LanguageContextValue = {
  locale: VivaTripLocale;
  localeTag: "pt-BR" | "en-US" | "es-AR";
  setLocale: (locale: VivaTripLocale) => void;
  translate: (value: string) => string;
};

const translations: Translation[] = [
  { pt: "Idioma", en: "Language", es: "Idioma" },
  { pt: "Moeda", en: "Currency", es: "Moneda" },
  { pt: "Início", en: "Home", es: "Inicio" },
  { pt: "Viagens", en: "Trips", es: "Viajes" },
  { pt: "Minhas viagens", en: "My trips", es: "Mis viajes" },
  { pt: "Alertas", en: "Alerts", es: "Alertas" },
  { pt: "Alertas de preço", en: "Price alerts", es: "Alertas de precio" },
  { pt: "Milhas", en: "Miles", es: "Millas" },
  { pt: "Perfil", en: "Profile", es: "Perfil" },
  { pt: "Plano", en: "Plan", es: "Plan" },
  { pt: "Sair", en: "Sign out", es: "Salir" },
  { pt: "Entrar", en: "Sign in", es: "Ingresar" },
  { pt: "Criar conta", en: "Create account", es: "Crear cuenta" },
  { pt: "E-mail", en: "Email", es: "Correo electrónico" },
  { pt: "Senha", en: "Password", es: "Contraseña" },
  { pt: "Esqueci minha senha", en: "Forgot my password", es: "Olvidé mi contraseña" },
  { pt: "Ainda não tem conta?", en: "Don't have an account yet?", es: "¿Todavía no tienes una cuenta?" },
  { pt: "Entrando…", en: "Signing in…", es: "Ingresando…" },
  { pt: "Seu painel de viagem", en: "Your travel dashboard", es: "Tu panel de viaje" },
  { pt: "Pronto para a próxima aventura?", en: "Ready for your next adventure?", es: "¿Listo para tu próxima aventura?" },
  { pt: "Viagens, roteiro, preparação e alertas em um só lugar.", en: "Trips, itineraries, preparation and alerts in one place.", es: "Viajes, itinerarios, preparación y alertas en un solo lugar." },
  { pt: "+ Planejar viagem", en: "+ Plan a trip", es: "+ Planear viaje" },
  { pt: "Próxima viagem", en: "Next trip", es: "Próximo viaje" },
  { pt: "Abrir planejamento →", en: "Open plan →", es: "Abrir planificación →" },
  { pt: "Nenhuma viagem ainda", en: "No trips yet", es: "Aún no hay viajes" },
  { pt: "Crie uma viagem para começar seu planejamento.", en: "Create a trip to start planning.", es: "Crea un viaje para comenzar tu planificación." },
  { pt: "Criar viagem →", en: "Create trip →", es: "Crear viaje →" },
  { pt: "Roteiros", en: "Itineraries", es: "Itinerarios" },
  { pt: "Roteiros editáveis adaptados ao seu ritmo, interesses e época da viagem.", en: "Editable itineraries adapted to your pace, interests and travel season.", es: "Itinerarios editables adaptados a tu ritmo, intereses y época del viaje." },
  { pt: "Ver viagens →", en: "View trips →", es: "Ver viajes →" },
  { pt: "Preparação", en: "Preparation", es: "Preparación" },
  { pt: "Pré-viagem", en: "Pre-trip", es: "Previaje" },
  { pt: "Organize documentos, conectividade, dinheiro, transporte e checklist.", en: "Organize documents, connectivity, money, transport and checklist.", es: "Organiza documentos, conectividad, dinero, transporte y checklist." },
  { pt: "Escolher viagem →", en: "Choose trip →", es: "Elegir viaje →" },
  { pt: "Economia", en: "Savings", es: "Ahorro" },
  { pt: "Área preparada para acompanhar preços quando um provedor de voos for conectado.", en: "Ready to track prices when a flight provider is connected.", es: "Área preparada para seguir precios cuando se conecte un proveedor de vuelos." },
  { pt: "Ver alertas →", en: "View alerts →", es: "Ver alertas →" },
  { pt: "Destino", en: "Destination", es: "Destino" },
  { pt: "Onde será sua próxima história?", en: "Where will your next story take place?", es: "¿Dónde será tu próxima historia?" },
  { pt: "País", en: "Country", es: "País" },
  { pt: "Selecionar país", en: "Select country", es: "Seleccionar país" },
  { pt: "Cidade", en: "City", es: "Ciudad" },
  { pt: "Nome da viagem", en: "Trip name", es: "Nombre del viaje" },
  { pt: "opcional", en: "optional", es: "opcional" },
  { pt: "Datas", en: "Dates", es: "Fechas" },
  { pt: "Defina o período da viagem.", en: "Set your travel dates.", es: "Define las fechas del viaje." },
  { pt: "Ida", en: "Departure", es: "Ida" },
  { pt: "Volta", en: "Return", es: "Regreso" },
  { pt: "Hospedagem e viajantes", en: "Accommodation and travelers", es: "Alojamiento y viajeros" },
  { pt: "Você pode atualizar estes dados depois.", en: "You can update these details later.", es: "Puedes actualizar estos datos después." },
  { pt: "Nome da hospedagem", en: "Accommodation name", es: "Nombre del alojamiento" },
  { pt: "Endereço", en: "Address", es: "Dirección" },
  { pt: "Número de viajantes", en: "Number of travelers", es: "Número de viajeros" },
  { pt: "Status", en: "Status", es: "Estado" },
  { pt: "Planejamento", en: "Planning", es: "Planificación" },
  { pt: "Em andamento", en: "In progress", es: "En curso" },
  { pt: "Concluída", en: "Completed", es: "Completado" },
  { pt: "Seu ritmo", en: "Your pace", es: "Tu ritmo" },
  { pt: "Preferências que ajudam a personalizar o roteiro.", en: "Preferences that help personalize your itinerary.", es: "Preferencias que ayudan a personalizar tu itinerario." },
  { pt: "Estilo de viagem", en: "Travel style", es: "Estilo de viaje" },
  { pt: "Tranquilo", en: "Relaxed", es: "Tranquilo" },
  { pt: "Moderado", en: "Moderate", es: "Moderado" },
  { pt: "Intenso", en: "Intensive", es: "Intenso" },
  { pt: "Orçamento", en: "Budget", es: "Presupuesto" },
  { pt: "Econômico", en: "Budget", es: "Económico" },
  { pt: "Conforto", en: "Comfort", es: "Confort" },
  { pt: "Luxo", en: "Luxury", es: "Lujo" },
  { pt: "Interesses", en: "Interests", es: "Intereses" },
  { pt: "Selecione tudo que combina com esta viagem.", en: "Select everything that fits this trip.", es: "Selecciona todo lo que encaje con este viaje." },
  { pt: "Cultura", en: "Culture", es: "Cultura" },
  { pt: "História", en: "History", es: "Historia" },
  { pt: "Gastronomia", en: "Food", es: "Gastronomía" },
  { pt: "Natureza", en: "Nature", es: "Naturaleza" },
  { pt: "Praias", en: "Beaches", es: "Playas" },
  { pt: "Vida noturna", en: "Nightlife", es: "Vida nocturna" },
  { pt: "Compras", en: "Shopping", es: "Compras" },
  { pt: "Fotografia", en: "Photography", es: "Fotografía" },
  { pt: "Aventura", en: "Adventure", es: "Aventura" },
  { pt: "Relaxamento", en: "Relaxation", es: "Relaxación" },
  { pt: "Família", en: "Family", es: "Familia" },
  { pt: "Romântico", en: "Romantic", es: "Romántico" },
  { pt: "Notas", en: "Notes", es: "Notas" },
  { pt: "Salvar alterações", en: "Save changes", es: "Guardar cambios" },
  { pt: "Salvando…", en: "Saving…", es: "Guardando…" },
  { pt: "Você poderá editar tudo depois.", en: "You can edit everything later.", es: "Podrás editar todo después." },
  { pt: "As alterações ficam salvas na sua conta.", en: "Changes are saved to your account.", es: "Los cambios quedan guardados en tu cuenta." },
  { pt: "Revise os campos destacados.", en: "Review the highlighted fields.", es: "Revisa los campos resaltados." },
  { pt: "Não foi possível salvar a viagem. Tente novamente.", en: "We couldn't save the trip. Please try again.", es: "No pudimos guardar el viaje. Inténtalo de nuevo." },
  { pt: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.", en: "We couldn't connect to the server. Check your connection and try again.", es: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo." },
  { pt: "Buscar cidade ou país", en: "Search city or country", es: "Buscar ciudad o país" },
  { pt: "Destinos em destaque", en: "Featured destinations", es: "Destinos destacados" },
  { pt: "Planejar →", en: "Plan →", es: "Planear →" },
  { pt: "Cobertura global", en: "Global coverage", es: "Cobertura global" },
  { pt: "Planeje uma viagem para qualquer país", en: "Plan a trip to any country", es: "Planea un viaje a cualquier país" },
  { pt: "Selecione um país e informe a cidade na próxima etapa. Destinos em destaque recebem fotografia específica; a galeria continuará crescendo com imagens licenciadas.", en: "Select a country and enter the city in the next step. Featured destinations use specific photography; the gallery will continue growing with licensed images.", es: "Selecciona un país e indica la ciudad en el siguiente paso. Los destinos destacados usan fotografías específicas; la galería seguirá creciendo con imágenes licenciadas." },
  { pt: "Nenhum destino encontrado. Tente o nome de outro país ou cidade.", en: "No destination found. Try another country or city name.", es: "No se encontró ningún destino. Prueba con otro país o ciudad." },
  { pt: "Cultura, gastronomia e miradouros", en: "Culture, food and viewpoints", es: "Cultura, gastronomía y miradores" },
  { pt: "Bairros, tecnologia e tradição", en: "Neighborhoods, technology and tradition", es: "Barrios, tecnología y tradición" },
  { pt: "Arte, cafés e arquitetura", en: "Art, cafés and architecture", es: "Arte, cafés y arquitectura" },
  { pt: "Natureza, praia e cidade", en: "Nature, beach and city", es: "Naturaleza, playa y ciudad" },
  { pt: "Museus, bairros e gastronomia", en: "Museums, neighborhoods and food", es: "Museos, barrios y gastronomía" },
  { pt: "História, praças e culinária", en: "History, squares and cuisine", es: "Historia, plazas y gastronomía" },
  { pt: "Arquitetura, praias e vida urbana", en: "Architecture, beaches and city life", es: "Arquitectura, playas y vida urbana" },
  { pt: "Cultura, bairros e grandes ícones", en: "Culture, neighborhoods and major landmarks", es: "Cultura, barrios y grandes íconos" },
  { pt: "Costa, natureza e vida urbana", en: "Coast, nature and city life", es: "Costa, naturaleza y vida urbana" },
  { pt: "Montanhas, costa e paisagens", en: "Mountains, coast and landscapes", es: "Montañas, costa y paisajes" },
  { pt: "Templos, mercados e gastronomia", en: "Temples, markets and food", es: "Templos, mercados y gastronomía" },
  { pt: "Medina, mercados e arquitetura", en: "Medina, markets and architecture", es: "Medina, mercados y arquitectura" },
  { pt: "Seu roteiro personalizado começa aqui.", en: "Your personalized itinerary starts here.", es: "Tu itinerario personalizado empieza aquí." },
  { pt: "O VivaTrip usa seu destino, datas, hospedagem, interesses, orçamento, ritmo e época da viagem para criar uma sugestão personalizada.", en: "VivaTrip uses your destination, dates, accommodation, interests, budget, pace and travel season to create a personalized suggestion.", es: "VivaTrip usa tu destino, fechas, alojamiento, intereses, presupuesto, ritmo y época del viaje para crear una sugerencia personalizada." },
  { pt: "Criar roteiro com VivaTrip AI", en: "Create itinerary with VivaTrip AI", es: "Crear itinerario con VivaTrip AI" },
  { pt: "A VivaTrip AI está recebendo muitas solicitações agora. Aguarde um pouco e tente novamente.", en: "VivaTrip AI is receiving too many requests right now. Please wait a moment and try again.", es: "VivaTrip AI está recibiendo demasiadas solicitudes. Espera un momento e inténtalo de nuevo." },
  { pt: "A conta da OpenAI está sem créditos de API disponíveis.", en: "The OpenAI account has no API credits available.", es: "La cuenta de OpenAI no tiene créditos de API disponibles." },
  { pt: "A geração demorou mais que o esperado. Tente novamente em alguns instantes.", en: "Generation took longer than expected. Try again in a few moments.", es: "La generación tardó más de lo esperado. Inténtalo nuevamente en unos momentos." },
  { pt: "Não foi possível conectar ao serviço de IA agora.", en: "We couldn't connect to the AI service right now.", es: "No pudimos conectar con el servicio de IA en este momento." },
  { pt: "A IA não retornou um roteiro estruturado.", en: "The AI did not return a structured itinerary.", es: "La IA no devolvió un itinerario estructurado." },
  { pt: "Ofertas", en: "Deals", es: "Ofertas" },
  { pt: "Como funciona", en: "How it works", es: "Cómo funciona" },
  { pt: "Uma busca. O mundo inteiro.", en: "One search. The whole world.", es: "Una búsqueda. Todo el mundo." },
  { pt: "Viaje para qualquer lugar.", en: "Go anywhere.", es: "Viaja a cualquier lugar." },
  { pt: "Gaste menos.", en: "Spend less.", es: "Gasta menos." },
  { pt: "Ida e volta", en: "Round trip", es: "Ida y vuelta" },
  { pt: "Só ida", en: "One way", es: "Solo ida" },
  { pt: "Vários destinos", en: "Multi-city", es: "Varios destinos" },
  { pt: "Origem", en: "From", es: "Origen" },
  { pt: "Viajantes", en: "Travelers", es: "Viajeros" },
  { pt: "Buscar no mundo", en: "Search the world", es: "Buscar en el mundo" },
  { pt: "Comparar também com milhas", en: "Compare fares with miles", es: "Comparar también con millas" },
  { pt: "Comparamos", en: "Compared across", es: "Comparamos" },
  { pt: "Companhias aéreas", en: "Airlines", es: "Aerolíneas" },
  { pt: "Programas de milhas", en: "Mileage programs", es: "Programas de millas" },
  { pt: "Sites de viagem", en: "Travel partners", es: "Sitios de viajes" },
  { pt: "Tarifas exclusivas", en: "Member fares", es: "Tarifas exclusivas" },
  { pt: "O mundo está mais perto do que você imagina", en: "The world is closer than you think", es: "El mundo está más cerca de lo que imaginas" },
  { pt: "Ver todas as ofertas →", en: "View all deals →", es: "Ver todas las ofertas →" },
  { pt: "Uma rota mais inteligente", en: "A smarter route anywhere", es: "Una ruta más inteligente" },
  { pt: "Nós fazemos a busca.", en: "We do the searching.", es: "Nosotros buscamos." },
  { pt: "Você faz a viagem.", en: "You do the going.", es: "Tú haces el viaje." },
  { pt: "Começar uma busca", en: "Start a search", es: "Comenzar una búsqueda" },
  { pt: "Alertas gratuitos", en: "Free price alerts", es: "Alertas gratuitas" },
  { pt: "Criar alerta grátis", en: "Create free alert", es: "Crear alerta gratis" },
  { pt: "Sem spam. Cancele quando quiser.", en: "No spam. Unsubscribe anytime.", es: "Sin spam. Cancela cuando quieras." },
  { pt: "Privacidade", en: "Privacy", es: "Privacidad" },
  { pt: "Política de afiliados", en: "Affiliate disclosure", es: "Política de afiliados" },
  { pt: "Voltar", en: "Back", es: "Volver" },
  { pt: "Cancelar", en: "Cancel", es: "Cancelar" },
  { pt: "Excluir", en: "Delete", es: "Eliminar" },
  { pt: "Editar", en: "Edit", es: "Editar" },
  { pt: "Salvar", en: "Save", es: "Guardar" },
  { pt: "Fechar", en: "Close", es: "Cerrar" },
  { pt: "Continuar", en: "Continue", es: "Continuar" },
  { pt: "Carregando…", en: "Loading…", es: "Cargando…" },
];

const localeTags: Record<VivaTripLocale, "pt-BR" | "en-US" | "es-AR"> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-AR",
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

const reverse = new Map<string, Translation>();
for (const entry of translations) {
  reverse.set(normalize(entry.pt), entry);
  reverse.set(normalize(entry.en), entry);
  reverse.set(normalize(entry.es), entry);
}

function translateExact(value: string, locale: VivaTripLocale) {
  const clean = normalize(value);
  const entry = reverse.get(clean);
  return entry ? entry[locale] : value;
}

function translateDynamic(value: string, locale: VivaTripLocale) {
  const clean = normalize(value);
  const exact = reverse.get(clean);
  if (exact) return exact[locale];

  const viewMatch = clean.match(/^Vista de (.+), (.+)$/i);
  if (viewMatch) {
    if (locale === "en") return `View of ${viewMatch[1]}, ${viewMatch[2]}`;
    if (locale === "es") return `Vista de ${viewMatch[1]}, ${viewMatch[2]}`;
    return `Vista de ${viewMatch[1]}, ${viewMatch[2]}`;
  }

  return value;
}

function translateTextNode(node: Text, locale: VivaTripLocale) {
  const parent = node.parentElement;
  if (!parent || parent.closest("[data-no-translate]") || ["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA"].includes(parent.tagName)) return;
  const current = node.nodeValue || "";
  if (!current.trim()) return;
  const leading = current.match(/^\s*/)?.[0] || "";
  const trailing = current.match(/\s*$/)?.[0] || "";
  const translated = translateDynamic(current.trim(), locale);
  if (translated !== current.trim()) node.nodeValue = `${leading}${translated}${trailing}`;
}

function translateElementAttributes(element: Element, locale: VivaTripLocale) {
  if (element.closest("[data-no-translate]")) return;
  for (const attribute of ["placeholder", "aria-label", "title"]) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const translated = translateDynamic(value, locale);
    if (translated !== value) element.setAttribute(attribute, translated);
  }
}

function translateSubtree(root: Node, locale: VivaTripLocale) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, locale);
    return;
  }
  if (!(root instanceof Element) && root !== document.body) return;
  if (root instanceof Element) translateElementAttributes(root, locale);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let current: Node | null = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) translateTextNode(current as Text, locale);
    else if (current instanceof Element) translateElementAttributes(current, locale);
    current = walker.nextNode();
  }
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<VivaTripLocale>("pt");

  useEffect(() => {
    const saved = window.localStorage.getItem("vivatrip-language") as VivaTripLocale | null;
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
    translateSubtree(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateSubtree(mutation.target, locale);
        for (const node of mutation.addedNodes) translateSubtree(node, locale);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const syncExistingSelector = () => {
      document.querySelectorAll<HTMLSelectElement>("select.language-select:not([data-global-language])").forEach((select) => {
        if (select.value !== locale) {
          select.value = locale;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    };
    queueMicrotask(syncExistingSelector);

    return () => observer.disconnect();
  }, [locale]);

  useEffect(() => {
    const onChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement) || !target.classList.contains("language-select")) return;
      const next = target.value as VivaTripLocale;
      if (next === "pt" || next === "en" || next === "es") setLocaleState(next);
    };
    document.addEventListener("change", onChange, true);
    return () => document.removeEventListener("change", onChange, true);
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    localeTag: localeTags[locale],
    setLocale: setLocaleState,
    translate: (text: string) => translateDynamic(text, locale),
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
          appearance: auto;
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
          .global-language-switcher {
            top: 8px;
            right: 8px;
            padding: 6px 8px;
          }
          .global-language-switcher .language-select { font-size: 12px; }
        }
      `}</style>
    </LanguageContext.Provider>
  );
}
