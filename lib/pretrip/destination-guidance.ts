import type { PretripKey } from "@/types/pretrip";

export type GuidanceSource = { label: string; href: string };
export type GuidanceSection = {
  summary: string;
  bullets: string[];
  sources?: GuidanceSource[];
  badge?: string;
};

export type DestinationGuidance = Partial<Record<PretripKey, GuidanceSection>>;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function monthLabel(startDate?: string) {
  if (!startDate) return "";
  const parsed = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(parsed);
}

const UK_GUIDANCE: DestinationGuidance = {
  documents: {
    badge: "Reino Unido",
    summary: "Confira os requisitos de entrada de acordo com o passaporte antes de embarcar.",
    bullets: [
      "Passaporte ou documento de viagem deve permanecer válido durante toda a estadia.",
      "Turismo normalmente se enquadra como Standard Visitor, geralmente por até 6 meses.",
      "Se o passaporte for brasileiro, a ETA é exigida para viagens ao Reino Unido desde 8 de janeiro de 2025.",
      "Tenha reservas, passagem de saída/retorno e meios para custear a viagem acessíveis caso sejam solicitados.",
    ],
    sources: [
      { label: "GOV.UK · Standard Visitor", href: "https://www.gov.uk/standard-visitor" },
      { label: "GOV.UK · ETA", href: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list" },
    ],
  },
  apps: {
    badge: "Londres",
    summary: "Deixe transporte, mapas e reservas prontos antes de sair do aeroporto.",
    bullets: [
      "TfL Go para metrô, ônibus e rotas oficiais de Londres.",
      "Google Maps ou mapa offline para navegação a pé.",
      "App da companhia aérea e da hospedagem com reservas salvas offline.",
      "Carteira digital ou cartão contactless configurado para transporte e pagamentos.",
    ],
    sources: [{ label: "Transport for London", href: "https://tfl.gov.uk/" }],
  },
  connectivity: {
    badge: "Conectividade",
    summary: "Planeje internet móvel antes da chegada e mantenha o essencial disponível offline.",
    bullets: [
      "Confirme se seu plano atual inclui roaming no Reino Unido e quais são as tarifas.",
      "Se necessário, configure eSIM/SIM antes da viagem ou ao chegar.",
      "Baixe mapa de Londres, bilhetes, endereço da hospedagem e documentos importantes para uso offline.",
      "Evite depender apenas de Wi‑Fi público para autenticações, pagamentos ou documentos sensíveis.",
    ],
  },
  money: {
    badge: "GBP · £",
    summary: "A moeda é a libra esterlina e o contactless é muito usado em Londres.",
    bullets: [
      "Leve pelo menos dois meios de pagamento separados para contingência.",
      "Confira taxas de compra internacional e conversão do seu cartão antes da viagem.",
      "Contactless pode ser usado diretamente no transporte público de Londres; taxas do banco estrangeiro podem se aplicar.",
      "Mantenha uma pequena quantia em dinheiro apenas como alternativa de emergência.",
    ],
    sources: [{ label: "TfL · Formas de pagamento", href: "https://tfl.gov.uk/travel-information/visiting-london/getting-around-london/best-ways-for-visitors-to-pay" }],
  },
  transport: {
    badge: "TfL",
    summary: "Para a maioria dos visitantes, contactless ou Oyster simplificam o transporte em Londres.",
    bullets: [
      "Use sempre o mesmo cartão ou dispositivo para entrar e sair do metrô e dos trens.",
      "Ônibus e bondes exigem toque apenas ao embarcar; metrô e trens normalmente exigem toque na entrada e na saída.",
      "Heathrow tem opções como Elizabeth line e Tube; Gatwick conecta-se ao centro por trens.",
      "No Reino Unido dirige-se pela esquerda; considere isso ao atravessar ruas e ao alugar carro.",
    ],
    sources: [
      { label: "TfL · Contactless e Oyster", href: "https://contactless.tfl.gov.uk/" },
      { label: "TfL · Visitando Londres", href: "https://tfl.gov.uk/travel-information/visiting-london" },
    ],
  },
  packing: {
    badge: "Mala",
    summary: "Londres pode ter mudanças rápidas de temperatura e chuva ao longo do dia.",
    bullets: [
      "Leve camadas leves, uma peça impermeável e calçado confortável para caminhar.",
      "Guarda-chuva compacto pode ser útil, especialmente em meses mais úmidos.",
      "Tomadas do Reino Unido são do tipo G; leve adaptador compatível.",
      "Revise a previsão alguns dias antes para ajustar casaco, calçados e bagagem.",
    ],
  },
  insurance: {
    badge: "Recomendado",
    summary: "Seguro de viagem é recomendado para cobrir imprevistos médicos e logísticos.",
    bullets: [
      "Confira cobertura médica e hospitalar durante toda a viagem.",
      "Verifique cobertura para cancelamento, bagagem, atrasos e atividades planejadas.",
      "Declare condições de saúde existentes quando a seguradora exigir, para evitar exclusões.",
      "Salve número da apólice e contato de assistência em local acessível offline.",
    ],
    sources: [{ label: "GOV.UK · Seguro de viagem", href: "https://www.gov.uk/guidance/foreign-travel-insurance" }],
  },
  emergency: {
    badge: "999 / 112",
    summary: "Deixe contatos e reservas importantes disponíveis mesmo sem internet.",
    bullets: [
      "Emergências no Reino Unido: 999 ou 112.",
      "Salve endereço completo e telefone da hospedagem, voos e principais reservas.",
      "Mantenha cópia digital segura do passaporte e documentos de viagem separada dos originais.",
      "Compartilhe o roteiro básico e um contato de emergência com alguém de confiança.",
    ],
    sources: [{ label: "GOV.UK · 999 e 112", href: "https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers" }],
  },
};

export function getDestinationGuidance(country: string, city: string, startDate?: string): DestinationGuidance {
  const normalizedCountry = normalize(country);
  const normalizedCity = normalize(city);
  const isUK = ["reino unido", "united kingdom", "uk", "gb", "great britain"].includes(normalizedCountry) || normalizedCity === "londres" || normalizedCity === "london";

  if (!isUK) return {};

  const month = monthLabel(startDate);
  if (!month || !UK_GUIDANCE.packing) return UK_GUIDANCE;

  return {
    ...UK_GUIDANCE,
    packing: {
      ...UK_GUIDANCE.packing,
      summary: `Sua viagem começa em ${month}. Revise a previsão perto da data e leve opções em camadas para o clima variável de Londres.`,
    },
  };
}
