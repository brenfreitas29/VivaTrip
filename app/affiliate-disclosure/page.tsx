import Link from "next/link";

export default function AffiliateDisclosurePage() {
  return <main className="legal-page"><Link className="brand" href="/"><span className="brand-mark">VT</span><span>VivaTrip</span></Link><article><span className="section-kicker">Transparência</span><h1>Política de afiliados.</h1><p>A VivaTrip pode, no futuro, receber comissão quando uma reserva ou compra qualificada for concluída por meio de um parceiro. Isso não deve aumentar o preço apresentado ao viajante.</p><h2>Resultados e publicidade</h2><p>Ofertas patrocinadas ou relações comerciais devem ser identificadas de forma clara. A existência de uma comissão não deve ser apresentada como garantia de que uma oferta é a melhor disponível.</p><h2>Tarifas</h2><p>Preços exibidos no protótipo são ilustrativos até que uma fonte de dados de viagem em tempo real esteja conectada. Tarifas reais podem mudar conforme disponibilidade, impostos, taxas e regras do provedor.</p></article></main>;
}
