type DestinationImage = {
  url: string;
  position?: string;
};

const CITY_IMAGES: Record<string, DestinationImage> = {
  london: {
    url: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=2200&q=88",
    position: "center 48%",
  },
  londres: {
    url: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=2200&q=88",
    position: "center 48%",
  },
  tokyo: { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2200&q=88" },
  toquio: { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2200&q=88" },
  paris: { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2200&q=88" },
  roma: { url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=2200&q=88" },
  rome: { url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=2200&q=88" },
  barcelona: { url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=2200&q=88" },
  bali: { url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2200&q=88" },
  "nova york": { url: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=2200&q=88" },
  "new york": { url: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=2200&q=88" },
  "buenos aires": { url: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=2200&q=88" },
  "rio de janeiro": { url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=2200&q=88" },
  sydney: { url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=2200&q=88" },
};

const COUNTRY_IMAGES: Record<string, DestinationImage> = {
  GB: CITY_IMAGES.london,
  UK: CITY_IMAGES.london,
  JP: CITY_IMAGES.tokyo,
  FR: CITY_IMAGES.paris,
  IT: CITY_IMAGES.rome,
  ES: CITY_IMAGES.barcelona,
  ID: CITY_IMAGES.bali,
  US: CITY_IMAGES["new york"],
  AR: CITY_IMAGES["buenos aires"],
  BR: CITY_IMAGES["rio de janeiro"],
  AU: CITY_IMAGES.sydney,
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function destinationHeroImage(city: string, countryCode: string): DestinationImage {
  const cityMatch = CITY_IMAGES[normalize(city)];
  if (cityMatch) return cityMatch;

  const countryMatch = COUNTRY_IMAGES[countryCode.toUpperCase()];
  if (countryMatch) return countryMatch;

  // Source Unsplash provides a destination-relevant fallback for cities/countries
  // that do not yet have a curated photograph in the catalogue.
  const query = encodeURIComponent(`${city} ${countryCode} travel landmark`);
  return {
    url: `https://source.unsplash.com/1800x900/?${query}`,
    position: "center",
  };
}
