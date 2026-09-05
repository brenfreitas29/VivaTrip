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
  brlAmount?: number;
  originalAmount?: number;
  originalCurrency?: string;
  miles?: number;
  taxes?: number;
  taxesCurrency?: string;
  brlTaxes?: number;
  originalTaxes?: number;
  originalTaxesCurrency?: string;
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

const fxCache = new Map<string, { rate: number; expires: number }>();

async function convertCurrency(amount: number | undefined, from: string | undefined, to: 'USD' | 'BRL') {
  if (amount === undefined) return undefined;
  const source = String(from || 'USD').toUpperCase();
  if (source === to) return Math.round(amount * 100) / 100;
  const key = `${source}-${to}`;
  const cached = fxCache.get(key);
  if (cached && cached.expires > Date.now()) return Math.round(amount * cached.rate * 100) / 100;
  try {
    const response = await fetch(`https://api.frankfurter.dev/v2/rate/${encodeURIComponent(source)}/${to}`, { cache: 'no-store', signal: AbortSignal.timeout(4500) });
    if (!response.ok) return undefined;
    const data = await response.json() as { rate?: number };
    const rate = safeNumber(data.rate);
    if (!rate) return undefined;
    fxCache.set(key, { rate, expires: Date.now() + 6 * 60 * 60 * 1000 });
    return Math.round(amount * rate * 100) / 100;
  } catch { return undefined; }
}

async function searchDuffel(input: FlightSearchInput): Promise<FlightSearchResult[]> {
  const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
  if (!token) return [];
  const passengers = Array.from({ length: input.adults }, () => ({ type: 'adult' }));
  const slices = [{ origin: input.origin, destination: input.destination, departure_date: input.departureDate }, ...(input.returnDate ? [{ origin: input.destination, destination: input.origin, departure_date: input.returnDate }] : [])];
  const response = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Duffel-Version': 'v2', Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { passengers, cabin_class: input.cabin || 'economy', slices } }), cache: 'no-store' });
  if (!response.ok) throw new Error(`Duffel ${response.status}`);
  const payload = await response.json() as { data?: { offers?: Array<Record<string, unknown>> } };
  return Promise.all((payload.data?.offers || []).slice(0, 30).map(async (offer, index) => {
    const owner = offer.owner as { name?: string } | undefined;
    const slicesData = offer.slices as Array<{ segments?: Array<{ marketing_carrier?: { name?: string } }> }> | undefined;
    const airline = owner?.name || slicesData?.[0]?.segments?.[0]?.marketing_carrier?.name;
    const originalAmount = safeNumber(offer.total_amount);
    const originalCurrency = typeof offer.total_currency === 'string' ? offer.total_currency.toUpperCase() : undefined;
    const [usdAmount, brlAmount] = await Promise.all([convertCurrency(originalAmount, originalCurrency, 'USD'), convertCurrency(originalAmount, originalCurrency, 'BRL')]);
    return { id: `duffel-${String(offer.id || index)}`, kind: 'cash' as const, provider: 'Duffel', airline, origin: input.origin, destination: input.destination, departureDate: input.departureDate, returnDate: input.returnDate, amount: usdAmount ?? originalAmount, currency: usdAmount !== undefined ? 'USD' : originalCurrency, brlAmount, originalAmount, originalCurrency, cabin: input.cabin || 'economy' };
  }));
}

async function amadeusToken() {
  const id = process.env.AMADEUS_CLIENT_ID?.trim(); const secret = process.env.AMADEUS_CLIENT_SECRET?.trim();
  if (!id || !secret) return '';
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret });
  const response = await fetch('https://api.amadeus.com/v1/security/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, cache: 'no-store' });
  if (!response.ok) throw new Error(`Amadeus auth ${response.status}`);
  const data = await response.json() as { access_token?: string }; return data.access_token || '';
}

async function searchAmadeus(input: FlightSearchInput): Promise<FlightSearchResult[]> {
  const token = await amadeusToken(); if (!token) return [];
  const params = new URLSearchParams({ originLocationCode: input.origin, destinationLocationCode: input.destination, departureDate: input.departureDate, adults: String(input.adults), currencyCode: 'USD', max: '30' });
  if (input.returnDate) params.set('returnDate', input.returnDate);
  if (input.cabin) params.set('travelClass', input.cabin === 'premium_economy' ? 'PREMIUM_ECONOMY' : input.cabin.toUpperCase());
  const response = await fetch(`https://api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!response.ok) throw new Error(`Amadeus ${response.status}`);
  const payload = await response.json() as { data?: Array<Record<string, unknown>>; dictionaries?: { carriers?: Record<string, string> } };
  return Promise.all((payload.data || []).map(async (offer, index) => {
    const itineraries = offer.itineraries as Array<{ segments?: Array<{ carrierCode?: string }> }> | undefined;
    const code = itineraries?.[0]?.segments?.[0]?.carrierCode;
    const carrier = code ? payload.dictionaries?.carriers?.[code] || code : undefined;
    const price = offer.price as { grandTotal?: string; currency?: string } | undefined;
    const originalAmount = safeNumber(price?.grandTotal); const originalCurrency = price?.currency || 'USD';
    const brlAmount = await convertCurrency(originalAmount, originalCurrency, 'BRL');
    const segments = itineraries?.[0]?.segments || [];
    return { id: `amadeus-${String(offer.id || index)}`, kind: 'cash' as const, provider: 'Amadeus', airline: carrier, origin: input.origin, destination: input.destination, departureDate: input.departureDate, returnDate: input.returnDate, amount: originalAmount, currency: 'USD', brlAmount, originalAmount, originalCurrency, cabin: input.cabin || 'economy', direct: segments.length === 1 };
  }));
}

async function searchSeatsAero(input: FlightSearchInput): Promise<FlightSearchResult[]> {
  const key = process.env.SEATS_AERO_API_KEY?.trim(); if (!key) return [];
  const params = new URLSearchParams({ origin_airport: input.origin, destination_airport: input.destination, start_date: input.departureDate, end_date: input.departureDate, take: '100', order_by: 'lowest_mileage' });
  const response = await fetch(`https://seats.aero/partnerapi/search?${params.toString()}`, { headers: { 'Partner-Authorization': key }, cache: 'no-store' });
  if (!response.ok) throw new Error(`Seats.aero ${response.status}`);
  const payload = await response.json() as { data?: Array<Record<string, unknown>> };
  const cabinPrefix = input.cabin === 'business' ? 'J' : input.cabin === 'first' ? 'F' : input.cabin === 'premium_economy' ? 'W' : 'Y';
  const rows: Array<FlightSearchResult | null> = await Promise.all((payload.data || []).map(async (item, index): Promise<FlightSearchResult | null> => {
    const route = item.Route as { OriginAirport?: string; DestinationAirport?: string; Source?: string } | undefined;
    const miles = safeNumber(item[`${cabinPrefix}MileageCost`]); if (item[`${cabinPrefix}Available`] !== true || !miles) return null;
    const airlines = typeof item[`${cabinPrefix}Airlines`] === 'string' ? String(item[`${cabinPrefix}Airlines`]) : undefined;
    const originalTaxes = safeNumber(item[`${cabinPrefix}TotalTaxes`]);
    const originalTaxesCurrency = typeof item[`${cabinPrefix}TaxesCurrency`] === 'string' && item[`${cabinPrefix}TaxesCurrency`] ? String(item[`${cabinPrefix}TaxesCurrency`]).toUpperCase() : undefined;
    const [taxesUsd, brlTaxes] = await Promise.all([convertCurrency(originalTaxes, originalTaxesCurrency, 'USD'), convertCurrency(originalTaxes, originalTaxesCurrency, 'BRL')]);
    const rawProgram = typeof item.Source === 'string' ? item.Source : route?.Source;
    const program = rawProgram === 'smiles' ? 'GOL Smiles' : rawProgram === 'azul' ? 'Azul Fidelidade' : rawProgram;
    return { id: `seats-${String(item.ID || index)}-${cabinPrefix}`, kind: 'miles', provider: 'Seats.aero', program, airline: airlines, origin: route?.OriginAirport || input.origin, destination: route?.DestinationAirport || input.destination, departureDate: typeof item.Date === 'string' ? item.Date : input.departureDate, miles, taxes: taxesUsd ?? originalTaxes, taxesCurrency: taxesUsd !== undefined ? 'USD' : originalTaxesCurrency, brlTaxes, originalTaxes, originalTaxesCurrency, cabin: input.cabin || 'economy', direct: item[`${cabinPrefix}Direct`] === true };
  }));
  return rows.filter((row): row is FlightSearchResult => row !== null);
}

export async function searchFlights(raw: FlightSearchInput): Promise<FlightSearchResponse> {
  const input = { ...raw, origin: cleanAirport(raw.origin), destination: cleanAirport(raw.destination), adults: Math.min(9, Math.max(1, Number(raw.adults) || 1)) };
  if (!input.origin || !input.destination) throw new Error('Use códigos IATA de 3 letras, como EZE, GRU, JFK ou NRT.');
  const definitions = [
    { name: 'Duffel', kind: 'cash' as const, configured: Boolean(process.env.DUFFEL_ACCESS_TOKEN?.trim()), run: () => searchDuffel(input) },
    { name: 'Amadeus', kind: 'cash' as const, configured: Boolean(process.env.AMADEUS_CLIENT_ID?.trim() && process.env.AMADEUS_CLIENT_SECRET?.trim()), run: () => searchAmadeus(input) },
    { name: 'Seats.aero · Smiles + Azul + outros', kind: 'miles' as const, configured: Boolean(process.env.SEATS_AERO_API_KEY?.trim()), run: () => searchSeatsAero(input) },
  ];
  const settled = await Promise.all(definitions.map(async (provider) => {
    if (!provider.configured) return { provider, results: [] as FlightSearchResult[], ok: false, message: 'Integração ainda não configurada.' };
    try { const results = await provider.run(); return { provider, results, ok: true, message: results.length ? undefined : 'Nenhuma opção encontrada.' }; }
    catch (error) { return { provider, results: [] as FlightSearchResult[], ok: false, message: error instanceof Error ? error.message : 'Falha na busca.' }; }
  }));
  const results = settled.flatMap((entry) => entry.results).sort((a, b) => { if (a.kind !== b.kind) return a.kind === 'cash' ? -1 : 1; return (a.amount ?? a.miles ?? Number.MAX_SAFE_INTEGER) - (b.amount ?? b.miles ?? Number.MAX_SAFE_INTEGER); });
  return { results, providers: settled.map(({ provider, ok, message }) => ({ name: provider.name, kind: provider.kind, configured: provider.configured, ok, message })) };
}
