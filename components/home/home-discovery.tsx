'use client';

import Link from 'next/link';

type Locale = 'pt' | 'en' | 'es';

type Destination = {
  city: string;
  country: { pt: string; en: string; es: string };
  countryCode: string;
  image: string;
};

type VideoCard = {
  title: string;
  duration: string;
  image: string;
  href: string;
};

const destinations: Destination[] = [
  { city: 'Tokyo', country: { pt: 'Japão', en: 'Japan', es: 'Japón' }, countryCode: 'JP', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=86' },
  { city: 'Kyoto', country: { pt: 'Japão', en: 'Japan', es: 'Japón' }, countryCode: 'JP', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=86' },
  { city: 'Paris', country: { pt: 'França', en: 'France', es: 'Francia' }, countryCode: 'FR', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=86' },
  { city: 'Nova York', country: { pt: 'Estados Unidos', en: 'United States', es: 'Estados Unidos' }, countryCode: 'US', image: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?auto=format&fit=crop&w=900&q=86' },
  { city: 'Bali', country: { pt: 'Indonésia', en: 'Indonesia', es: 'Indonesia' }, countryCode: 'ID', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=86' },
  { city: 'Roma', country: { pt: 'Itália', en: 'Italy', es: 'Italia' }, countryCode: 'IT', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=86' },
  { city: 'Barcelona', country: { pt: 'Espanha', en: 'Spain', es: 'España' }, countryCode: 'ES', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=86' },
  { city: 'Cancún', country: { pt: 'México', en: 'Mexico', es: 'México' }, countryCode: 'MX', image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=900&q=86' },
  { city: 'Santorini', country: { pt: 'Grécia', en: 'Greece', es: 'Grecia' }, countryCode: 'GR', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=86' },
  { city: 'Rio de Janeiro', country: { pt: 'Brasil', en: 'Brazil', es: 'Brasil' }, countryCode: 'BR', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=86' },
];

const videos: VideoCard[] = [
  { title: 'Bali', duration: '0:45', image: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=900&q=84', href: 'https://www.youtube.com/results?search_query=Bali+travel+4k' },
  { title: 'Paris', duration: '0:38', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=84', href: 'https://www.youtube.com/results?search_query=Paris+travel+4k' },
  { title: 'Nova York', duration: '0:52', image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=900&q=84', href: 'https://www.youtube.com/results?search_query=New+York+travel+4k' },
  { title: 'Tóquio', duration: '0:47', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=84', href: 'https://www.youtube.com/results?search_query=Tokyo+travel+4k' },
  { title: 'Santorini', duration: '0:33', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=84', href: 'https://www.youtube.com/results?search_query=Santorini+travel+4k' },
  { title: 'Patagônia', duration: '0:50', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=84', href: 'https://www.youtube.com/results?search_query=Patagonia+travel+4k' },
  { title: 'Roma', duration: '0:41', image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=900&q=84', href: 'https://www.youtube.com/results?search_query=Rome+travel+4k' },
  { title: 'Maldivas', duration: '0:36', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=84', href: 'https://www.youtube.com/results?search_query=Maldives+travel+4k' },
];

const copy = {
  pt: {
    featured: 'Destinos em destaque',
    featuredSub: 'Lugares incríveis para a sua próxima viagem',
    all: 'Ver todos os destinos',
    videoTitle: 'Descubra o mundo em vídeo',
    videoSub: 'Inspire-se com paisagens, cidades e experiências de viagem',
    videos: 'Ver mais vídeos',
    ctaEyebrow: 'Roteiros personalizados',
    ctaTitle: 'Transforme seus sonhos em roteiros reais',
    ctaText: 'Crie itinerários, salve destinos e organize toda a sua viagem em um só lugar.',
    ctaButton: 'Começar agora',
    statCountries: 'Mais de 200 países para explorar',
    statTrips: 'Planeje tudo em uma experiência conectada',
  },
  en: {
    featured: 'Featured destinations',
    featuredSub: 'Amazing places for your next trip',
    all: 'See all destinations',
    videoTitle: 'Discover the world in video',
    videoSub: 'Get inspired by landscapes, cities and travel experiences',
    videos: 'See more videos',
    ctaEyebrow: 'Personalized itineraries',
    ctaTitle: 'Turn your travel dreams into real itineraries',
    ctaText: 'Create itineraries, save destinations and organize your whole trip in one place.',
    ctaButton: 'Start now',
    statCountries: 'More than 200 countries to explore',
    statTrips: 'Plan everything in one connected experience',
  },
  es: {
    featured: 'Destinos destacados',
    featuredSub: 'Lugares increíbles para tu próximo viaje',
    all: 'Ver todos los destinos',
    videoTitle: 'Descubre el mundo en video',
    videoSub: 'Inspírate con paisajes, ciudades y experiencias de viaje',
    videos: 'Ver más videos',
    ctaEyebrow: 'Itinerarios personalizados',
    ctaTitle: 'Convierte tus sueños en itinerarios reales',
    ctaText: 'Crea itinerarios, guarda destinos y organiza todo tu viaje en un solo lugar.',
    ctaButton: 'Empezar ahora',
    statCountries: 'Más de 200 países para explorar',
    statTrips: 'Planifica todo en una experiencia conectada',
  },
} as const;

export function HomeDiscovery({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const loop = [...destinations, ...destinations];

  return (
    <section className="home-discovery">
      <div className="discovery-inner">
        <div className="section-heading">
          <div><h2>{t.featured}</h2><p>{t.featuredSub}</p></div>
          <Link href="/explore">{t.all} <span>→</span></Link>
        </div>

        <div className="destination-marquee" aria-label={t.featured}>
          <div className="destination-track">
            {loop.map((item, index) => (
              <Link className="destination-slide" key={`${item.city}-${index}`} href={`/trips/new?destination=${encodeURIComponent(item.city)}&country=${item.countryCode}`}>
                <img src={item.image} alt={`${item.city}, ${item.country[locale]}`} loading="lazy" />
                <div><strong>{item.city}</strong><span>{item.country[locale]}</span></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="section-heading video-heading">
          <div><h2>{t.videoTitle}</h2><p>{t.videoSub}</p></div>
          <Link href="/explore">{t.videos} <span>→</span></Link>
        </div>

        <div className="video-strip">
          {videos.map((video) => (
            <a className="video-card" key={video.title} href={video.href} target="_blank" rel="noreferrer">
              <img src={video.image} alt={video.title} loading="lazy" />
              <span className="play-button" aria-hidden="true">▶</span>
              <div className="video-overlay"><strong>{video.title}</strong><span>{video.duration}</span></div>
            </a>
          ))}
        </div>

        <div className="discovery-cta">
          <div className="cta-copy">
            <span className="cta-eyebrow">✦ {t.ctaEyebrow}</span>
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaText}</p>
            <Link href="/trips/new">{t.ctaButton} <span>→</span></Link>
          </div>
          <div className="cta-stats">
            <div><span className="stat-icon">◎</span><strong>{t.statCountries}</strong></div>
            <div><span className="stat-icon">✈</span><strong>{t.statTrips}</strong></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-discovery{background:linear-gradient(180deg,#f8f7fc 0%,#fff 72%);padding:42px 0 70px;color:#15104c;overflow:hidden}.discovery-inner{width:min(1600px,94vw);margin:0 auto}.section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin:0 0 18px}.section-heading h2{margin:0;font-size:clamp(25px,2.2vw,36px);letter-spacing:-.8px}.section-heading p{margin:6px 0 0;color:#777290;font-size:14px}.section-heading a{color:#5d42e8;text-decoration:none;font-weight:800;font-size:14px;white-space:nowrap}.destination-marquee{overflow:hidden;margin-inline:-3vw;padding-inline:3vw}.destination-track{display:flex;gap:16px;width:max-content;animation:destination-scroll 42s linear infinite}.destination-marquee:hover .destination-track{animation-play-state:paused}.destination-slide{width:250px;flex:none;background:#fff;border:1px solid #ece9f6;border-radius:20px;padding:8px;text-decoration:none;color:#17114c;box-shadow:0 12px 30px rgba(40,30,90,.08);transition:transform .2s ease,box-shadow .2s ease}.destination-slide:hover{transform:translateY(-5px);box-shadow:0 18px 36px rgba(40,30,90,.14)}.destination-slide img{width:100%;height:150px;object-fit:cover;border-radius:14px;display:block}.destination-slide div{padding:10px 6px 7px}.destination-slide strong{display:block;font-size:16px}.destination-slide span{display:block;margin-top:3px;color:#777290;font-size:12px}.video-heading{margin-top:42px}.video-strip{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(210px,1fr);gap:14px;overflow-x:auto;padding-bottom:8px;scrollbar-width:thin;scroll-snap-type:x proximity}.video-card{position:relative;min-height:185px;border-radius:18px;overflow:hidden;display:block;scroll-snap-align:start;background:#17114c;box-shadow:0 12px 30px rgba(32,22,80,.12)}.video-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .35s ease}.video-card:hover img{transform:scale(1.04)}.video-card:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,10,45,.02) 25%,rgba(12,10,45,.82) 100%)}.play-button{position:absolute;z-index:2;left:50%;top:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.92);color:#5d42e8;font-size:17px;padding-left:3px;box-shadow:0 10px 30px rgba(15,10,60,.24)}.video-overlay{position:absolute;z-index:2;left:14px;right:14px;bottom:12px;color:#fff;display:flex;justify-content:space-between;align-items:center}.video-overlay strong{font-size:15px}.video-overlay span{font-size:11px;background:rgba(15,12,55,.68);padding:4px 7px;border-radius:99px}.discovery-cta{margin-top:28px;border-radius:28px;overflow:hidden;display:grid;grid-template-columns:1.12fr .88fr;min-height:260px;background:linear-gradient(90deg,rgba(11,50,88,.94),rgba(35,92,137,.85)),url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=86') center/cover;color:#fff;box-shadow:0 20px 50px rgba(23,42,86,.14)}.cta-copy{padding:38px 42px}.cta-eyebrow{font-size:12px;font-weight:800;opacity:.9}.cta-copy h2{font-size:clamp(28px,3vw,46px);line-height:1.02;margin:12px 0 12px;max-width:650px}.cta-copy p{margin:0 0 22px;max-width:620px;line-height:1.5;opacity:.9}.cta-copy a{display:inline-flex;align-items:center;gap:14px;background:#fff;color:#2b1e86;text-decoration:none;padding:13px 18px;border-radius:14px;font-weight:800}.cta-stats{margin:22px;background:rgba(255,255,255,.92);color:#21175f;border-radius:22px;padding:28px;display:grid;grid-template-columns:1fr 1fr;gap:18px;align-content:center}.cta-stats div{padding:18px;border:1px solid #ece8f6;border-radius:17px;background:#fff}.stat-icon{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#eee9ff;color:#5d42e8;margin-bottom:12px;font-weight:900}.cta-stats strong{font-size:15px;line-height:1.4;display:block}@keyframes destination-scroll{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 8px))}}@media(max-width:900px){.home-discovery{padding-top:32px}.destination-slide{width:220px}.video-strip{grid-auto-columns:240px}.discovery-cta{grid-template-columns:1fr}.cta-stats{margin-top:0}.cta-copy{padding-bottom:24px}}@media(max-width:620px){.discovery-inner{width:92vw}.section-heading{align-items:flex-start}.section-heading a{font-size:12px}.destination-slide{width:190px}.destination-slide img{height:125px}.video-strip{grid-auto-columns:82vw}.discovery-cta{border-radius:22px}.cta-copy{padding:28px 24px}.cta-stats{margin:0 14px 14px;grid-template-columns:1fr;padding:14px}.cta-stats div{padding:14px}}
      `}</style>
    </section>
  );
}
