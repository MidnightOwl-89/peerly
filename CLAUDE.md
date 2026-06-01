# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
npm start         # Start production server
```

No test runner is configured.

## Environment Setup

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The legacy `.env` file (NextAuth/Prisma vars) is unused — the app was migrated fully to Supabase.

## Architecture Overview

**Peerly** is a Next.js 16 App Router marketplace for NIU (Northern Illinois University) students to buy/sell peer-to-peer services (tutoring, haircuts, rides, etc.). Only NIU email addresses (`@students.niu.edu` or `@niu.edu`) can register.

### Stack
- **Next.js 16.1.7** with App Router and React 19
- **Supabase** for database (PostgreSQL), auth, and file storage
- **Tailwind CSS 4** for styling
- **TypeScript** throughout (strict mode, `@/*` path alias maps to root)

---

## App Router Structure

```
app/
├── layout.tsx              # Root layout — metadata, wraps in <Providers>
├── page.tsx                # Homepage (hero, popular listings, categories, how-it-works)
├── globals.css             # Design tokens + animations (see Design System)
├── signin/page.tsx         # Email/password sign-in + password reset form
├── signup/page.tsx         # Registration — NIU email gate, buyer/provider role toggle
├── onboarding/page.tsx     # 4-step onboarding (intent → profile → payment → done)
├── services/
│   ├── page.tsx            # Browse all categories + search (URL: /services?q=)
│   └── [category]/
│       ├── page.tsx        # Category listing grid — sort/price filters
│       └── [slug]/page.tsx # Listing detail — images, description, reviews, booking widget
├── book/[slug]/page.tsx    # Booking form — date, time, duration, notes + price calc
├── booking/confirmed/      # Post-booking success page with confetti animation
├── dashboard/
│   ├── page.tsx            # Main dashboard (tabs differ by role — see Roles section)
│   └── listings/           # Provider listing management (new/edit)
└── admin/
    ├── page.tsx            # Redirects to /admin/categories
    ├── categories/         # Category CRUD + cover image upload
    ├── listings/           # Admin listing management
    └── media/              # site_media key-based image management
```

---

## Authentication & Session Management

Auth is handled entirely by Supabase Auth. Two client factories exist:
- [lib/supabase/client.ts](lib/supabase/client.ts) — browser client (`createBrowserClient`), for client components
- [lib/supabase/server.ts](lib/supabase/server.ts) — async server client (`createServerClient` + `next/headers` cookies), for server components, server actions, and route handlers

The `useAuth` hook ([hooks/useAuth.ts](hooks/useAuth.ts)) provides client-side state and returns:
- `user` (Supabase User | null), `profile` (Profile | null)
- `isLoading`, `isLoggedIn`, `isGuest`, `isProvider`, `isBuyer`

Subscribes to `onAuthStateChange` to keep state in sync. Fetches the `profiles` row on each auth change.

---

## Route Protection (Middleware)

[middleware.ts](middleware.ts) enforces access using the server Supabase client:

| Route | Requirement | Redirect if denied |
|---|---|---|
| `/dashboard`, `/book`, `/booking/confirmed`, `/onboarding` | Authenticated | `/signin` |
| `/signin`, `/signup` | Not authenticated | `/dashboard` |
| `/dashboard/listings/new`, `/dashboard/earnings` | `profiles.is_provider = true` | `/dashboard?upgrade=true` |
| `/admin/*` | `profiles.role = 'admin'` | `/dashboard` |

---

## User Roles

Three roles via `profiles` table:
- **Buyer** — any authenticated user
- **Provider** — `profiles.is_provider = true`; unlocks listing creation, earnings tab, provider dashboard view
- **Admin** — `profiles.role = 'admin'`; access to `/admin/*` routes

The dashboard (`app/dashboard/page.tsx`) renders different tab sets per role:
- **Provider tabs:** Overview, My Listings, Bookings, Messages, Settings
- **Buyer tabs:** My Bookings, Messages, Profile Settings

---

## Database Schema

All data lives in Supabase PostgreSQL with Row Level Security on every table. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for full SQL.

### Key Tables

| Table | Purpose | Notable columns |
|---|---|---|
| `profiles` | Extends `auth.users` (trigger on signup) | `is_provider`, `onboarded`, `role ('user'\|'admin')`, `verification_status ('unverified'\|'pending'\|'verified'\|'rejected')`, `social_links`, `stripe_account_id`, `stripe_payouts_enabled` |
| `listings` | Service offerings | `slug`, `images[]`, `price`, `price_unit`, `deposit_percentage`, `category_id`, `provider_id`, `views`, `active` |
| `packages` | Tiered pricing for listings | `listing_id`, `name`, `price`, `duration_minutes`, `features[]` |
| `bookings` | Service requests | `status ('pending'\|'confirmed'\|'completed'\|'cancelled')`, `date`, `time`, `duration`, `total_price` |
| `reviews` | Post-booking ratings | `rating (1–5)`, `text`, `images[]`, tied to a booking |
| `messages` | Per-booking chat | `booking_id`, `sender_id`, `text`, `sent_at` |
| `categories` | 13 seeded service categories | `slug`, `cover_image`, `active`, `display_order` |
| `site_media` | Admin-managed images | keyed by unique string (e.g. `hero-banner`) |
| `payments` | Stripe payment tracking | `stripe_payment_intent_id`, `type ('deposit'\|'balance')`, `status` |
| `notifications` | User notifications | `type`, `title`, `body`, `data`, `read` |
| `disputes` | Booking disputes | `filed_by`, `reason`, `status`, `admin_note` |
| `favorites` | Saved listings | `user_id`, `listing_id` |
| `promo_codes` | Discount codes | `discount_type`, `discount_value`, `max_uses`, `uses`, `expires_at`, `active` |

### Realtime

Messages use Supabase `postgres_changes` subscription in the dashboard for live chat updates.

---

## TypeScript Types

[lib/types.ts](lib/types.ts) defines all shared interfaces. Key ones:

```ts
Profile     — user profile with role, is_provider, verification_status, social_links, stripe fields
Listing     — service listing with images[], packages?, reviews?, provider?, category?
Booking     — with listing?, buyer?, provider? join shapes
Review      — with author? join shape
Message     — with sender? join shape
Category    — slug, cover_image, active, display_order
Package     — tiered pricing for a listing
Payment     — Stripe payment tracking
Notification, Dispute, Favorite, PromoCode, SiteMedia
```

---

## Key Utilities

[lib/utils.ts](lib/utils.ts):
- `isValidNiuEmail(email)` — validates `@students.niu.edu` or `@niu.edu`
- `formatPrice(price)` — formats number as USD string
- `generateSlug(title)` — lowercase kebab-case slug
- `getInitials(name)` — 2-char uppercase initials
- `hashColor(name)` — deterministic color from 8-color palette
- `FALLBACK_CATEGORIES` — 13 hardcoded categories (Unsplash covers) if DB unavailable

---

## Storage

[lib/supabase/storage.ts](lib/supabase/storage.ts):
- `uploadImage(file, bucket, path)` → returns public URL
- `deleteImage(bucket, path)` → removes file

Four public buckets: `listings`, `profiles`, `reviews`, `site-media`.

Next.js Image is configured to allow `images.unsplash.com` and `*.supabase.co` (see [next.config.ts](next.config.ts)).

---

## Component Library

All reusable UI is in `components/`:

| Component | Purpose |
|---|---|
| `Button` | `variant ('primary'\|'secondary'\|'ghost')`, `size ('sm'\|'md'\|'lg')`, `href?` renders as `<Link>` |
| `Navbar` | Sticky nav — logo, search, auth buttons, user dropdown with mobile menu |
| `Footer` | Links, social icons, newsletter form |
| `ServiceCard` | Listing card — image, title, provider, price, rating; hover scale; "Your service" badge |
| `PopularServiceCard` | Compact horizontal listing card for homepage scroll row |
| `CategoryCard` | Image background + gradient overlay, links to `/services/[slug]` |
| `ProviderChip` | Avatar card — name, category, verification status |
| `ProviderAvatar` | Circle avatar with initials fallback, color from `hashColor` |
| `StarRating` | `size ('sm'\|'md'\|'lg')`, shows filled/half/empty stars + count |
| `BookingWidget` | Sticky sidebar — listing preview, date/time selection, price; auth gate |
| `ImageUpload` | Drag-and-drop multi-file upload (max 5) via `uploadImage`, shows preview + spinner |
| `GlassCard` | Wrapper div with glassmorphism styles |
| `Providers` | Root client wrapper (currently passthrough, ready for context providers) |

---

## Hooks

| Hook | Returns |
|---|---|
| `useAuth` | `user`, `profile`, `isLoading`, `isLoggedIn`, `isGuest`, `isProvider`, `isBuyer` |
| `use3DTilt` | `ref`, `handleMouseMove`, `handleMouseLeave` — CSS perspective tilt effect |

---

## Design System

Defined in [app/globals.css](app/globals.css):

**Color tokens:**
- `--color-accent: #e63329` (red — primary CTA)
- `--color-bg: #0d0b0f` (near-black background)
- Text: `#f0ede8` (off-white)
- Success: `#10b981` (green)
- Error: `#ef4444` (red)

**Glassmorphism:** `.glass` class — backdrop-filter blur with `--glass-bg`, `--glass-border`

**Animations:** `fadeUp`, `fadeIn`, `pulseRed`, `spin`, `checkDraw`/`circleDraw` (SVG stroke), `confettiFall`/`confettiSway`

**Utility classes:** `.animate-fade-up`, `.animate-gradient`, `.scroll-row` (horizontal scroll container)

Theme is dark throughout. Accent red (`#e63329`) for primary buttons and interactive states.

---

## Service Categories

13 seeded categories (slugs): `hair-beauty`, `nails-braiding`, `barbering`, `tutoring`, `clothing-resale`, `rides`, `photography`, `graphic-design`, `tech-help`, `food-meals`, `fitness`, `music-audio`, plus one more. Accessible as `FALLBACK_CATEGORIES` in `lib/utils.ts`.

---

## Booking Flow

1. User finds a listing at `/services/[category]/[slug]`
2. `BookingWidget` (sidebar) lets them pick date/time → navigates to `/book/[slug]`
3. `/book/[slug]` — full booking form (date, time, duration buttons, notes, price breakdown); state persisted in `sessionStorage`
4. On submit → creates `bookings` row with `status: 'pending'` → redirects to `/booking/confirmed`
5. Provider sees pending request in dashboard Bookings tab → accepts/declines
6. Once `confirmed`, buyer can message provider via dashboard Messages tab

---

## Development Conventions

- **No test runner** — verify changes manually via `npm run dev`
- **Server vs Client components** — prefer server components; add `'use client'` only when hooks/events are needed
- **Supabase client choice** — use `lib/supabase/server.ts` in server components/actions, `lib/supabase/client.ts` in client components
- **Auth guard** — middleware handles redirects; page components can trust the user is authenticated when middleware protects the route
- **Slug generation** — always use `generateSlug()` from `lib/utils.ts` for new listings
- **Image uploads** — always go through `lib/supabase/storage.ts`; never construct Supabase Storage URLs manually
- **RLS** — all Supabase queries are subject to Row Level Security; use `SUPABASE_SERVICE_ROLE_KEY` (server-side only) when bypassing RLS is intentional
- **TypeScript** — all new code must be typed; use interfaces from `lib/types.ts` rather than inline types for shared shapes
- **Tailwind** — use Tailwind utility classes; avoid inline styles except for dynamic values (e.g. computed colors)
