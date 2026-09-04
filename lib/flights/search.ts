export type FlightSearchInput = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
};

export type FlightSearchResult = {
  id: string;
  kind: 'cash' | 'miles';
  provider: string;
  airline?: string;
  program?: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  amount?: number;
  currency?: string;
  miles?: number;
  taxes?: number;
  taxesCurrency?: string;
  cabin?: string;
  direct?: boolean;
  bookingUrl?: string;
};

export type FlightSearchResponse = {
  results: FlightSearchResult[];
  providers: Array<{ name: string; kind: 'cash' | 'miles'; configured: boolean; ok: boolean; message?: string }>;
};

function cleanAirport(value: string) {
  const match = value.toUpperCase().match(/\b([A-Z]{3})\b/);
  return match?.[1] || '';
}

function safeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

async function searchDuffel(input: FlightSearchInput): Promise<FlightSearchResult[]> {
  const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
  if (!token) return [];

  const passengers = Array.from({ length: input.adults }, () => ({ type: 'adult' }));
  const slices = [
    { origin: input.origin, destination: input.destination, departure_date: input.departureDate },
    ...(input.returnDate ? [{ origin: input.destination, destination: input.origin, departure_date: input.returnDate }] : []),
  ];

  const response = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Duffel-Version': 'v2',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: { passengers, cabin_class: input.cabin || 'economy', slices } }),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Duffel ${response.status}`);
  const payload = await response.json() as { data?: { offers?: Array<Record<string, unknown>> } };
  const offers = payload.data?.offers || [];

  return offers.slice(0, 30).map((offer, index) => {
    const owner = offer.owner as { name?: string } | undefined;
    const slicesData = offer.slices as Array<{ segments?: Array<{ marketing_carrier?: { name?: string } }> }> | undefined;
    const airline = owner?.name || slicesData?.[0]?.segments?.[0]?.marketing_carrier?.name;
    return {
      id: `duffel-${String(offer.id || index)}`,
      kind: 'cash' as const,
      provider: 'Duffel',
      airline,
      origin: input.origin,
      destination: input.destination,
      departureDate: input.departureDate,
      returnDate: input.returnDate,
      amount: safeNumber(offer.total_amount),
      currency: typeof offer.total_currency === 'string' ? offer.total_currency : undefined,
      cabin: input.cabin || 'economy',
    };
  });
}

async function amadeusToken() {
  const id = process.env.AMADEUS_CLIENT_ID?.trim();
  const secret = process.env.AMADEUS_CLIENT_SECRET?.trim();
  if (!id || !secret) return '';
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret });
  const response = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Amadeus auth ${response.status}`);
  const data = await response.json() as { access_token?: string };
  return data.access_token || '';
}

async function searchAmadeus(input: FlightSearchInput): Promise<FlightSearchResult[]> {
  const token = await amadeusToken();
  if (!token) return [];
  const params = new URLSearchParams({
    originLocationCode: input.origin,
    destinationLocationCode: input.destination,
    departureDate: input.departureDate,
    adults: String(input.adults),
    currencyCode: process.env.FLIGHT_SEARCH_CURRENCY?.trim() || 'USD',
    max: '30',
  });
  if (input.returnDate) params.set('returnDate', input.returnDate);
  if (input.cabin) params.set('travelClass', input.cabin === 'premium_economy' ? 'PREMIUM_ECONOMY' : input.cabin.toUpperCase());

  const response = await fetch(`https://api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Amadeus ${response.status}`);
  const payload = await response.json() as { data?: Array<Record<string, unknown>>; dictionaries?: { carriers?: Record<string, string> } };
  return (payload.data || []).map((offer, index) => {
    const itineraries = offer.itineraries as Array<{ segments?: Array<{ carrierCode?: string; number?: string; numberOfStops?: number }> }> | undefined;
    const code = itineraries?.[0]?.segments?.[0]?.carrierCode;
    const carrier = code ? payload.dictionaries?.carriers?.[code] || code : undefined;
    const price = offer.price as { grandTotal?: string; currency?: string } | undefined;
    const segments = itineraries?.[0]?.segments || [];
    return {
      id: `amadeus-${String(offer.id || index)}`,
      kind: 'cash' as const,
      provider: 'Amadeus',
      airline: carrier,
      origin: input.origin,
      destination: input.destination,
      departureDate: input.departureDate,
      returnDate: input.returnDate,
      amount: safeNumber(price?.grandTotal),
      currency: price?.currency,
      cabin: input.cabin || 'economy',
      direct: segments.length === 1,
    };
  });
}

async function searchSeatsAero(input: FlightSearchInput): Promise<FlightSearchResult[]> {
  const key = process.env.SEATS_AERO_API_KEY?.trim();
  if (!key) return [];
  const params = new URLSearchParams({
    origin_airport: input.origin,
    destination_airport: input.destination,
    start_date: input.departureDate,
    end_date: input.departureDate,
    take: '100',
    order_by: 'lowest_mileage',
  });
  const response = await fetch(`https://seats.aero/partnerapi/search?${params.toString()}`, {
    headers: { 'Partner-Authorization': key },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Seats.aero ${response.status}`);
  const payload = await response.json() as { data?: Array<Record<string, unknown>> };
  const cabinPrefix = input.cabin === 'business' ? 'J' : input.cabin === 'first' ? 'F' : input.cabin === 'premium_economy' ? 'W' : 'Y';

  return (payload.data || []).flatMap((item, index) => {
    const route = item.Route as { OriginAirport?: string; DestinationAirport?: string; Source?: string } | undefined;
    const available = item[`${cabinPrefix}Available`] === true;
    const miles = safeNumber(item[`${cabinPrefix}MileageCost`]);
    if (!available || !miles) return [];
    const airlines = typeof item[`${cabinPrefix}Airlines`] === 'string' ? String(item[`${cabinPrefix}Airlines`]) : undefined;
    return [{
      id: `seats-${String(item.ID || index)}-${cabinPrefix}`,
      kind: 'miles' as const,
      provider: 'Seats.aero',
      program: typeof item.Source === 'string' ? item.Source : route?.Source,
      airline: airlines,
      origin: route?.OriginAirport || input.origin,
      destination: route?.DestinationAirport || input.destination,
      departureDate: typeof item.Date === 'string' ? item.Date : input.departureDate,
      miles,
      cabin: input.cabin || 'economy',
      direct: item[`${cabinPrefix}Direct`] === true,
    }];
  });
}

export async function searchFlights(raw: FlightSearchInput): Promise<FlightSearchResponse> {
  const input = {
    ...raw,
    origin: cleanAirport(raw.origin),
    destination: cleanAirport(raw.destination),
    adults: Math.min(9, Math.max(1, Number(raw.adults) || 1)),
  };
  if (!input.origin || !input.destination) throw new Error('Use códigos IATA de 3 letras, como EZE, GRU, JFK ou NRT.');

  const definitions = [
    { name: 'Duffel', kind: 'cash' as const, configured: Boolean(process.env.DUFFEL_ACCESS_TOKEN?.trim()), run: () => searchDuffel(input) },
    { name: 'Amadeus', kind: 'cash' as const, configured: Boolean(process.env.AMADEUS_CLIENT_ID?.trim() && process.env.AMADEUS_CLIENT_SECRET?.trim()), run: () => searchAmadeus(input) },
    { name: 'Seats.aero', kind: 'miles' as const, configured: Boolean(process.env.SEATS_AERO_API_KEY?.trim()), run: () => searchSeatsAero(input) },
  ];

  const settled = await Promise.all(definitions.map(async (provider) => {
    if (!provider.configured) return { provider, results: [] as FlightSearchResult[], ok: false, message: 'Integração ainda não configurada.' };
    try {
      const results = await provider.run();
      return { provider, results, ok: true, message: results.length ? undefined : 'Nenhuma opção encontrada.' };
    } catch (error) {
      return { provider, results: [] as FlightSearchResult[], ok: false, message: error instanceof Error ? error.message : 'Falha na busca.' };
    }
  }));

  const results = settled.flatMap((entry) => entry.results).sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'cash' ? -1 : 1;
    return (a.amount ?? a.miles ?? Number.MAX_SAFE_INTEGER) - (b.amount ?? b.miles ?? Number.MAX_SAFE_INTEGER);
  });

  return {
    results,
    providers: settled.map(({ provider, ok, message }) => ({ name: provider.name, kind: provider.kind, configured: provider.configured, ok, message })),
  };
}
