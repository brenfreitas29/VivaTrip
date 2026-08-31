# VivaTrip

VivaTrip is a Next.js travel-planning product that combines trip organization, an editable AI itinerary, pre-trip preparation, saved fare alerts and traveler preferences.

## Current product areas

- Public landing page, explore, offers, search and pricing routes
- Supabase email/password authentication with SSR session refresh
- Traveler profile
- User-owned trip CRUD with RLS
- Editable AI itineraries with structured validation and persistence
- Persisted pre-trip checklist per trip
- Saved flight-alert preferences (automatic fare monitoring requires a real provider)
- Informational miles/rewards area
- Account/billing readiness page
- Privacy and affiliate-disclosure pages

## Stack

Next.js 16, React 19, TypeScript, Supabase SSR, Tailwind CSS 4, Vercel.

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the public Supabase URL and publishable key.
4. Apply the SQL migrations in `supabase/migrations` to the same Supabase project.
5. Add a server-only AI key only if AI itinerary generation should be enabled.
6. Run `pnpm dev`.

Never commit `.env.local`, service-role keys or provider secrets.

## Validation before production

Run:

```bash
pnpm lint
pnpm typecheck
pnpm run build:vercel
```

Then test login, profile, trip create/edit/delete, itinerary generation/editing, checklist persistence and saved alerts with at least two test users to verify RLS isolation.

## External integrations

VivaTrip intentionally does not present simulated prices, live availability, visa rules, place details or payment status as verified facts. Those surfaces must be connected to trustworthy providers before being labeled as live.
