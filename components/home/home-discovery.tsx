'use client';

import Link from 'next/link';

type Locale = 'pt' | 'en' | 'es';

type VideoCard = {
  title: string;
  country: { pt: string; en: string; es: string };
  duration: string;
  image: string;
  href: string;
};

const videos: VideoCard[] = [
  { title: 'Bali', country: { pt: 'Indonésia', en: 'Indonesia', es: 'Indonesia' }, duration: '0:45', image: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=1000&q=86', href: 'https://www.youtube.com/results?search_query=Bali+travel+4k' },
  { title: 'Paris', country: { pt: 'França', en: 'France', es: 'Francia' }, duration: '0:38', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=86', href: 'https://www.youtube.com/results?search_query=Paris+travel+4k' },
  { title: 'Nova York', country: { pt: 'Estados Unidos', en: 'United States', es: 'Estados Unidos' }, duration: '0:52', image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1000&q=86', href: 'https://www.youtube.com/results?search_query=New+York+travel+4k' },
  { title: 'Tóquio', country: { pt: 'Japão', en: 'Japan', es: 'Japón' }, duration: '0:47', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=86', href: 'https://www.youtube.com/results?search_query=Tokyo+travel+4k' },
  { title: 'Santorini', country: { pt: 'Grécia', en: 'Greece', es: 'Grecia' }, duration: '0:33', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=86', href: 'https://www.youtube.com/results?search_query=Santorini+travel+4k' },
  { title: 'Patagônia', country: { pt: 'Argentina', en: 'Argentina', es: 'Argentina' }, duration: '0:50', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=86', href: 'https://www.youtube.com/results?search_query=Patagonia+travel+4k' },
  { title: 'Roma', country: { pt: 'Itália', en: 'Italy', es: 'Italia' }, duration: '0:41', image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1000&q=86', href: 'https://www.youtube.com/results?search_query=Rome+travel+4k' },
  { title: 'Maldivas', country: { pt: 'Maldivas', en: 'Maldives', es: 'Maldivas' }, duration: '0:36', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1000&q=86', href: 'https://www.youtube.com/results?search_query=Maldives+travel+4k' },
];

const copy = {
  pt: { videoTitle:'Descubra o mundo em vídeo', videoSub:'Inspire-se com destinos reais', videos:'Ver mais vídeos', ctaEyebrow:'Roteiros personalizados', ctaTitle:'Transforme seus sonhos em roteiros reais', ctaText:'Crie itinerários, salve destinos e organize toda a sua viagem em um só lugar.', ctaButton:'Começar agora', statCountries:'Mais de 200 países para explorar', statTrips:'Planeje tudo em uma experiência conectada' },
  en: { videoTitle:'Discover the world in video', videoSub:'Get inspired by real destinations', videos:'See more videos', ctaEyebrow:'Personalized itineraries', ctaTitle:'Turn your travel dreams into real itineraries', ctaText:'Create itineraries, save destinations and organize your whole trip in one place.', ctaButton:'Start now', statCountries:'More than 200 countries to explore', statTrips:'Plan everything in one connected experience' },
  es: { videoTitle:'Descubre el mundo en video', videoSub:'Inspírate con destinos reales', videos:'Ver más videos', ctaEyebrow:'Itinerarios personalizados', ctaTitle:'Convierte tus sueños en itinerarios reales', ctaText:'Crea itinerarios, guarda destinos y organiza todo tu viaje en un solo lugar.', ctaButton:'Empezar ahora', statCountries:'Más de 200 países para explorar', statTrips:'Planifica todo en una experiencia conectada' },
} as const;

export function HomeDiscovery({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className="home-discovery">
      <div className="discovery-inner">
        <div className="section-heading video-heading">
          <div><h2>{t.videoTitle}</h2><p>{t.videoSub}</p></div>
          <Link href="/explore">{t.videos} <span>→</span></Link>
        </div>

        <div className="video-strip">
          {videos.map((video) => (
            <a className="video-card" key={video.title} href={video.href} target="_blank" rel="noreferrer">
              <div className="video-media">
                <img src={video.image} alt={video.title} loading="lazy" />
                <span className="play-button" aria-hidden="true">▶</span>
                <span className="video-duration">{video.duration}</span>
              </div>
              <div className="video-caption"><strong>{video.title}</strong><span>{video.country[locale]}</span></div>
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
        .home-discovery{background:linear-gradient(180deg,#f8f7fc 0%,#fff 72%);padding:38px 0 72px;color:#15104c;overflow:hidden}.discovery-inner{width:min(1600px,94vw);margin:0 auto}.section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin:0 0 20px}.section-heading h2{margin:0;font-size:clamp(26px,2.2vw,36px);letter-spacing:-.9px;font-weight:850;color:#17114c}.section-heading p{margin:7px 0 0;color:#7d7897;font-size:15px;line-height:1.45}.section-heading a{color:#5d42e8;text-decoration:none;font-weight:800;font-size:14px;white-space:nowrap}.video-strip{display:grid;grid-auto-flow:column;grid-auto-columns:250px;gap:16px;overflow-x:auto;padding:4px 0 12px;scrollbar-width:thin;scroll-snap-type:x proximity}.video-card{display:block;background:#fff;border:1px solid #ebe8f5;border-radius:18px;overflow:hidden;text-decoration:none;color:#17114c;scroll-snap-align:start;box-shadow:0 10px 28px rgba(32,22,80,.09);transition:transform .2s ease,box-shadow .2s ease}.video-card:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(32,22,80,.14)}.video-media{position:relative;height:172px;background:#17114c;overflow:hidden}.video-media img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;transition:transform .35s ease}.video-card:hover .video-media img{transform:scale(1.04)}.video-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,10,45,.02) 45%,rgba(12,10,45,.34) 100%)}.play-button{position:absolute;z-index:2;left:50%;top:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(21,17,76,.84);color:#fff;font-size:17px;padding-left:3px;box-shadow:0 10px 30px rgba(15,10,60,.24)}.video-duration{position:absolute;z-index:2;right:9px;bottom:9px;color:#fff;font-size:11px;font-weight:800;background:rgba(15,12,55,.76);padding:5px 7px;border-radius:8px}.video-caption{min-height:68px;padding:12px 14px 13px;background:#fff}.video-caption strong{display:block;font-size:17px;line-height:1.2;font-weight:800;letter-spacing:-.2px}.video-caption span{display:block;margin-top:5px;color:#777290;font-size:13px;line-height:1.2}.discovery-cta{margin-top:30px;border-radius:28px;overflow:hidden;display:grid;grid-template-columns:1.12fr .88fr;min-height:260px;background:linear-gradient(90deg,rgba(11,50,88,.94),rgba(35,92,137,.85)),url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=86') center/cover;color:#fff;box-shadow:0 20px 50px rgba(23,42,86,.14)}.cta-copy{padding:38px 42px}.cta-eyebrow{font-size:12px;font-weight:800;opacity:.9}.cta-copy h2{font-size:clamp(28px,3vw,46px);line-height:1.02;margin:12px 0 12px;max-width:650px}.cta-copy p{margin:0 0 22px;max-width:620px;line-height:1.5;opacity:.9}.cta-copy a{display:inline-flex;align-items:center;gap:14px;background:#fff;color:#2b1e86;text-decoration:none;padding:13px 18px;border-radius:14px;font-weight:800}.cta-stats{margin:22px;background:rgba(255,255,255,.92);color:#21175f;border-radius:22px;padding:28px;display:grid;grid-template-columns:1fr 1fr;gap:18px;align-content:center}.cta-stats div{padding:18px;border:1px solid #ece8f6;border-radius:17px;background:#fff}.stat-icon{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#eee9ff;color:#5d42e8;margin-bottom:12px;font-weight:900}.cta-stats strong{font-size:15px;line-height:1.4;display:block}@media(max-width:900px){.home-discovery{padding-top:30px}.video-strip{grid-auto-columns:220px}.video-media{height:150px}.discovery-cta{grid-template-columns:1fr}.cta-stats{margin-top:0}.cta-copy{padding-bottom:24px}}@media(max-width:620px){.discovery-inner{width:92vw}.section-heading{align-items:flex-start}.section-heading a{font-size:12px}.video-media{height:132px}.video-strip{grid-auto-columns:190px}.video-caption{min-height:64px;padding:11px 12px}.video-caption strong{font-size:15px}.video-caption span{font-size:12px}.discovery-cta{border-radius:22px}.cta-copy{padding:28px 24px}.cta-stats{margin:0 14px 14px;grid-template-columns:1fr;padding:14px}.cta-stats div{padding:14px}}
      `}</style>
    </section>
  );
}
