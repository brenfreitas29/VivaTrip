import { NextResponse } from 'next/server';
import { searchFlights } from '@/lib/flights/search';

export const dynamic = 'force-dynamic';

type SearchBody = {
  origin?: unknown;
  destination?: unknown;
  departureDate?: unknown;
  returnDate?: unknown;
  adults?: unknown;
  cabin?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchBody;
    const cabin = body.cabin === 'premium_economy' || body.cabin === 'business' || body.cabin === 'first' ? body.cabin : 'economy';
    const result = await searchFlights({
      origin: String(body.origin || ''),
      destination: String(body.destination || ''),
      departureDate: String(body.departureDate || ''),
      returnDate: body.returnDate ? String(body.returnDate) : undefined,
      adults: Number(body.adults || 1),
      cabin,
    });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível pesquisar os voos.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
