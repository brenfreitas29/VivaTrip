import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  return NextResponse.json(
    { url, key },
    { headers: { "Cache-Control": "no-store" } },
  );
}
