# VivaTrip

> Full-stack travel planning SaaS connecting saved trips, itinerary workflows and destination-aware pre-trip preparation.

**Live product:** https://vivatrip.vercel.app  
**Portfolio case study:** https://brenda-studio-portfolio.vercel.app/projects/vivatrip

## Overview

VivaTrip is a Next.js travel-planning product designed around a simple idea: trip information should stay connected throughout the experience. Instead of treating itinerary creation, traveler preferences and pre-trip preparation as isolated tools, the application uses saved trip context as the foundation for the planning workflow.

The project combines secure authentication, user-owned data, editable AI-assisted itineraries and persistent preparation tools in a production-oriented full-stack architecture.

## Key features

- Public landing, explore, offers, search and pricing routes
- Email/password authentication with SSR session refresh
- Protected private routes
- Traveler profile
- User-owned trip CRUD
- Row Level Security for data isolation
- Editable AI-assisted itineraries with structured validation and persistence
- Destination-aware pre-trip checklist
- Persistent notes and checklist progress per trip
- Saved flight-alert preferences
- Informational miles/rewards area
- Account and billing readiness
- Privacy and affiliate disclosure pages
- Responsive desktop and mobile experience

## Technical challenges

### Secure SSR authentication

Private screens require more than hiding UI elements in the browser. VivaTrip uses server-aware authentication and protected routes so session state is respected before private content is rendered.

### One source of trip context

Trip details are reused across the experience instead of being manually duplicated on every screen. This keeps itinerary and pre-trip features synchronized with the saved trip and reduces inconsistent data.

### AI output as application data

Generated itinerary content needs validation, editability and persistence before it becomes useful product data. The itinerary workflow is designed around structured output rather than displaying an unvalidated block of generated text.

### Travel information changes

Entry requirements, prices, availability and destination details can change. VivaTrip intentionally avoids presenting simulated or unverified external information as live facts; those surfaces require trustworthy providers before being labeled live.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase SSR
- PostgreSQL
- Row Level Security
- Tailwind CSS 4
- AI itinerary integration
- Vercel

## Architecture overview

```text
Public experience
       ↓
Supabase authentication
       ↓
Protected application
       ↓
Traveler profile ── Saved trips
                       ↓
              Shared trip context
                ↙            ↘
       AI itinerary      Pre-trip checklist
                ↘            ↙
                  Persistence
```

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env.local`.
3. Add the public Supabase URL and publishable key.
4. Apply the SQL migrations in `supabase/migrations` to the same Supabase project.
5. Add a server-only AI provider key only when itinerary generation should be enabled.
6. Start development:

```bash
pnpm dev
```

Never commit `.env.local`, service-role keys or provider secrets.

## Validation before production

```bash
pnpm lint
pnpm typecheck
pnpm run build:vercel
```

Then verify login, profile, trip create/edit/delete, itinerary generation/editing, checklist persistence and saved alerts. Test user-owned data with at least two separate accounts to confirm RLS isolation.

## External integrations

VivaTrip intentionally does not present simulated prices, live availability, visa/entry rules, place details or payment status as verified facts. Those surfaces must be connected to trustworthy providers before being described as live.

## What I learned

VivaTrip reinforced the importance of designing around shared domain data instead of individual screens. It also highlighted the difference between adding AI to a product and building a reliable AI workflow: generated content needs validation, persistence, editing and clear boundaries around external facts.

## What I would improve next

- Connect fare alerts to a real flight-data provider
- Add richer itinerary collaboration and editing
- Expand automated testing around authentication and RLS
- Add observability and usage controls around AI generation
- Connect destination information to verified external providers
- Continue improving onboarding and mobile planning flows

## Author

Built by **Brenda Freitas** — Full Stack Developer focused on SaaS products, React/Next.js, Supabase and automation.

Portfolio: https://brenda-studio-portfolio.vercel.app  
GitHub: https://github.com/brenfreitas29
