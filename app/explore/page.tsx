import Link from "next/link";

type Destination = { city: string; country: string; text: string; image: string };

const destinations: Destination[] = [
  { city: "Lisboa", country: "Portugal", text: "Cultura, gastronomia e miradouros", image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80" },
  { city: "Tóquio", country: "Japão", text: "Bairros, tecnologia e tradição", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80" },
  { city: "Buenos Aires", country: "Argentina", text: "Arte, cafés e arquitetura", image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80" },
  { city: "Rio de Janeiro", country: "Brasil", text: "Natureza, praia e cidade", image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80" },
  { city: "Paris", country: "França", text: "Museus, bairros e gastronomia", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" },
  { city: "Roma", country: "Itália", text: "História, praças e culinária", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80" },
  { city: "Barcelona", country: "Espanha", text: "Arquitetura, praias e vida urbana", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80" },
  { city: "Nova York", country: "Estados Unidos", text: "Cultura, bairros e grandes ícones", image: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1200&q=80" },
  { city: "Sydney", country: "Austrália", text: "Costa, natureza e vida urbana", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80" },
  { city: "Cidade do Cabo", country: "África do Sul", text: "Montanhas, costa e paisagens", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80" },
  { city: "Bangkok", country: "Tailândia", text: "Templos, mercados e gastronomia", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80" },
  { city: "Marrakech", country: "Marrocos", text: "Medina, mercados e arquitetura", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=80" },
];

export default function Explore() {
  return (
    <main className="public-module">
      <Link className="brand" href="/"><span className="brand-mark">VT</span><span>VivaTrip</span></Link>
      <header>
        <span className="auth-eyebrow">Inspiração</span>
        <h1>Explore seu próximo destino</h1>
        <p>Descubra cidades e países visualmente. Estamos ampliando a cobertura para que todos os países tenham imagens relevantes e destinos reais.</p>
      </header>
      <section className="explore-grid">
        {destinations.map((place) => (
          <article key={`${place.country}-${place.city}`} className="destination-card">
            <img src={place.image} alt={`Vista de ${place.city}, ${place.country}`} loading="lazy" decoding="async" />
            <div className="destination-card-body">
              <span>{place.country}</span><h2>{place.city}</h2><p>{place.text}</p>
              <Link href={`/trips/new?destination=${encodeURIComponent(place.city)}&country=${encodeURIComponent(place.country)}`}>Planejar →</Link>
            </div>
          </article>
        ))}
      </section>
      <p className="destination-source-note">Fotos de destinos: Unsplash. Informações operacionais e requisitos de entrada devem ser confirmados em fontes oficiais.</p>
    </main>
  );
}
