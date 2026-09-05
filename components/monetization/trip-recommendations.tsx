type Props = {
  city: string;
  country: string;
  accommodation?: string | null;
};

type Partner = {
  key: "hotels" | "esim" | "activities";
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  envUrl?: string;
  cta: string;
};

function withDestination(url: string, city: string, country: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "vivatrip");
    parsed.searchParams.set("utm_medium", "recommendation");
    parsed.searchParams.set("utm_campaign", `${city}-${country}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    return parsed.toString();
  } catch {
    return url;
  }
}

export function TripRecommendations({ city, country, accommodation }: Props) {
  const partners: Partner[] = [
    {
      key: "hotels",
      eyebrow: "Hospedagem",
      title: accommodation ? "Compare opções perto da sua hospedagem" : `Encontre onde ficar em ${city}`,
      description: "Compare opções de hospedagem para o destino antes de reservar.",
      icon: "⌂",
      envUrl: process.env.NEXT_PUBLIC_AFFILIATE_HOTELS_URL,
      cta: "Comparar hospedagens",
    },
    {
      key: "activities",
      eyebrow: "Passeios e ingressos",
      title: `Reserve experiências em ${city}`,
      description: "Encontre atrações, museus, tours e experiências que combinem com o roteiro.",
      icon: "✦",
      envUrl: process.env.NEXT_PUBLIC_AFFILIATE_ACTIVITIES_URL,
      cta: "Ver experiências",
    },
    {
      key: "esim",
      eyebrow: "Internet no destino",
      title: `Veja opções de eSIM para ${country}`,
      description: "Compare planos de dados para chegar ao destino com conexão disponível.",
      icon: "⌁",
      envUrl: process.env.NEXT_PUBLIC_AFFILIATE_ESIM_URL,
      cta: "Ver opções de eSIM",
    },
  ];

  const active = partners.filter((partner) => Boolean(partner.envUrl));

  return (
    <section className="trip-recommendations" aria-label="Recomendações para reservar sua viagem">
      <header className="trip-recommendations-heading">
        <div><span className="detail-label">Reserve sua viagem</span><h2>Próximos passos para {city}</h2><p>Serviços úteis para transformar seu planejamento em uma viagem pronta.</p></div>
        {active.length > 0 && <span className="partner-badge">Parceiros VivaTrip</span>}
      </header>
      {active.length > 0 ? (
        <>
          <p className="affiliate-disclosure">Alguns links abaixo são de parceiros. O VivaTrip pode receber uma comissão se você reservar por eles, sem custo adicional informado pelo VivaTrip.</p>
          <div className="trip-recommendations-grid">
            {active.map((partner) => (
              <article key={partner.key} className="trip-recommendation-card">
                <span className="trip-recommendation-icon">{partner.icon}</span>
                <span className="trip-recommendation-eyebrow">{partner.eyebrow}</span>
                <h3>{partner.title}</h3><p>{partner.description}</p>
                <a href={withDestination(partner.envUrl!, city, country)} target="_blank" rel="sponsored noopener noreferrer">{partner.cta} ↗</a>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="monetization-ready"><span>✦</span><div><strong>Área de parceiros preparada</strong><p>As recomendações comerciais aparecem aqui somente quando um parceiro aprovado for configurado. O VivaTrip não mostra links de compra falsos.</p></div></div>
      )}
    </section>
  );
}
