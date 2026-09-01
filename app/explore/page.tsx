import Link from "next/link";
import { DestinationExplorer } from "@/components/explore/destination-explorer";

export default function Explore() {
  return (
    <main className="public-module">
      <Link className="brand" href="/"><span className="brand-mark">VT</span><span>VivaTrip</span></Link>
      <header>
        <span className="auth-eyebrow">Inspiração</span>
        <h1>Explore seu próximo destino</h1>
        <p>Pesquise países e cidades, descubra destinos visualmente e leve sua escolha direto para o planejamento da viagem.</p>
      </header>
      <DestinationExplorer />
      <p className="destination-source-note">Fotos dos destinos em destaque: Unsplash. Requisitos de entrada variam conforme passaporte, residência, destino e datas; confirme sempre em fontes oficiais.</p>
    </main>
  );
}
