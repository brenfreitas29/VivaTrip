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

function universalGuidance(country: string, city: string, startDate?: string): DestinationGuidance {
  const destinationCountry = country || "o país de destino";
  const destinationCity = city || "o destino";
  const month = monthLabel(startDate);

  return {
    documents: {
      badge: destinationCountry,
      summary: `Revise os requisitos de entrada para ${destinationCountry} de acordo com o passaporte do viajante e as datas da viagem.`,
      bullets: [
        `Confirme se o passaporte precisa ter validade mínima adicional para entrar em ${destinationCountry}.`,
        "Verifique se o seu passaporte exige visto, autorização eletrônica, formulário de entrada ou cadastro prévio.",
        "Confira regras de trânsito/conexão caso o voo passe por outro país, mesmo sem sair do aeroporto.",
        "Mantenha reservas de hospedagem, passagem de saída/retorno e comprovantes de viagem acessíveis caso sejam solicitados.",
        "Confira restrições alfandegárias e regras para medicamentos antes de embarcar.",
      ],
      sources: [
        { label: "IATA Travel Centre · requisitos de viagem", href: "https://www.iatatravelcentre.com/" },
      ],
    },
    apps: {
      badge: destinationCity,
      summary: `Deixe os principais aplicativos e reservas prontos para usar em ${destinationCity}.`,
      bullets: [
        "Baixe um mapa offline da cidade e salve o endereço da hospedagem.",
        "Instale o aplicativo oficial do transporte público local quando houver.",
        "Mantenha companhia aérea, hospedagem e reservas com acesso offline.",
        "Tenha um tradutor ou pacote de idioma offline se não falar o idioma local.",
      ],
    },
    connectivity: {
      badge: "Internet & eSIM",
      summary: `Planeje como terá internet em ${destinationCountry} antes da chegada.`,
      bullets: [
        "Confira se seu plano atual inclui roaming no destino e quais são as tarifas.",
        "Compare eSIM, SIM local e roaming antes da viagem; ative apenas opções compatíveis com seu aparelho.",
        "Baixe mapas, bilhetes, endereço da hospedagem e documentos importantes para uso offline.",
        "Evite depender apenas de Wi‑Fi público para pagamentos, autenticação e documentos sensíveis.",
      ],
    },
    money: {
      badge: "Pagamentos",
      summary: `Prepare meios de pagamento aceitos em ${destinationCountry} e uma alternativa de emergência.`,
      bullets: [
        "Confirme a moeda local e a conversão antes da viagem.",
        "Confira tarifas de compra internacional, saque e conversão do seu cartão.",
        "Leve pelo menos dois meios de pagamento separados para contingência.",
        "Tenha uma pequena quantia em dinheiro se o destino ainda tiver locais com baixa aceitação de cartão.",
      ],
    },
    transport: {
      badge: destinationCity,
      summary: `Planeje chegada, deslocamentos e regras locais de transporte em ${destinationCity}.`,
      bullets: [
        "Pesquise com antecedência como ir do aeroporto, estação ou porto até a hospedagem.",
        "Confira se existe cartão de transporte, app oficial ou pagamento contactless local.",
        "Salve rotas importantes offline para o primeiro dia.",
        `Se for dirigir em ${destinationCountry}, confirme habilitação aceita, necessidade de permissão internacional, seguro e lado de circulação antes de alugar um veículo.`,
      ],
    },
    packing: {
      badge: month ? month.charAt(0).toUpperCase() + month.slice(1) : "Mala",
      summary: month
        ? `Sua viagem começa em ${month}. Ajuste a mala ao clima esperado e às atividades em ${destinationCity}.`
        : `Ajuste a mala ao clima, costumes e atividades planejadas em ${destinationCity}.`,
      bullets: [
        "Revise a previsão poucos dias antes da viagem para ajustar roupas e calçados.",
        "Confira o tipo de tomada e a voltagem usada no destino antes de levar adaptadores.",
        "Separe medicamentos de uso pessoal na embalagem original e confira regras de entrada quando aplicável.",
        "Leve uma camada versátil para mudanças de temperatura e um calçado confortável para deslocamentos.",
      ],
    },
    insurance: {
      badge: "Seguro",
      summary: `Verifique se ${destinationCountry} exige seguro para o seu tipo de entrada e avalie cobertura adequada para a viagem.`,
      bullets: [
        "Confira cobertura médica e hospitalar válida durante toda a viagem.",
        "Verifique cobertura para cancelamento, bagagem, atrasos e atividades planejadas.",
        "Confirme se alguma cobertura mínima é exigida para visto ou entrada no destino.",
        "Salve apólice e contato de assistência para acesso offline.",
      ],
    },
    emergency: {
      badge: "Emergências",
      summary: `Deixe contatos essenciais de ${destinationCountry} e suas reservas disponíveis mesmo sem internet.`,
      bullets: [
        "Confirme o número local de emergência para polícia, ambulância e bombeiros.",
        "Salve endereço e telefone da hospedagem, voos e principais reservas.",
        "Mantenha uma cópia digital segura dos documentos separada dos originais.",
        "Salve o contato da representação consular do seu país mais próxima do destino.",
        "Compartilhe o roteiro básico e um contato de emergência com alguém de confiança.",
      ],
    },
  };
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

  if (!isUK) return universalGuidance(country, city, startDate);

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
