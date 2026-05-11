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

**Peerly** is a Next.js 15 App Router marketplace for NIU (Northern Illinois University) students to buy/sell peer-to-peer services (tutoring, haircuts, rides, etc.). Only NIU email addresses (`@students.niu.edu` or `@niu.edu`) can register.

### Stack
- **Next.js 15** with App Router and React 19
- **Supabase** for database (PostgreSQL), auth, and file storage
- **Tailwind CSS 4** for styling
- **TypeScript** throughout

### Authentication & Session Management

Auth is handled entirely by Supabase Auth. Two client factories exist:
- [lib/supabase/client.ts](lib/supabase/client.ts) — browser client (`createBrowserClient`), for use in client components
- [lib/supabase/server.ts](lib/supabase/server.ts) — async server client (`createServerClient` + `next/headers` cookies), for server components, server actions, and route handlers

The `useAuth` hook ([hooks/useAuth.ts](hooks/useAuth.ts)) provides client-side user + profile state.

### Route Protection (Middleware)

[middleware.ts](middleware.ts) enforces access control using the server Supabase client:
- `/dashboard`, `/book`, `/booking/confirmed`, `/onboarding` → require auth
- `/signin`, `/signup` → redirect to `/dashboard` if already authenticated
- `/dashboard/listings/new`, `/dashboard/earnings` → require `profile.is_provider = true` (redirects to `/dashboard?upgrade=true` otherwise)
- `/admin/*` → require auth (admin role check deferred to the page component)

### User Roles

Three roles exist via `profiles` table flags:
- **Buyer** — any authenticated user
- **Provider** — `profiles.is_provider = true`
- **Admin** — role check handled at page level (not enforced in middleware beyond auth)

### Database Schema

All data lives in Supabase PostgreSQL. Key tables:
- `profiles` — extends `auth.users` (auto-created via DB trigger on signup); has `is_provider`, `onboarded` flags
- `listings` — service offerings with `slug`, `images[]`, `price`, `category_id`, `provider_id`
- `bookings` — status: `pending | confirmed | completed | cancelled`
- `reviews` — rating 1–5, tied to a booking
- `categories` — 12 seeded categories with slugs (e.g. `tutoring`, `rides`)
- `messages` — per-booking chat
- `site_media` — admin-managed images keyed by unique string

Row Level Security is enabled on all tables. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the full SQL setup including RLS policies, triggers, and storage bucket configuration.

### Storage

[lib/supabase/storage.ts](lib/supabase/storage.ts) provides `uploadImage` and `deleteImage` helpers. Four public buckets: `listings`, `profiles`, `reviews`, `site-media`.

Next.js image domains are configured in [next.config.ts](next.config.ts) to allow `images.unsplash.com` and `*.supabase.co`.

### Key Utilities

[lib/utils.ts](lib/utils.ts) contains:
- `isValidNiuEmail(email)` — enforces campus-only registration
- `generateSlug(title)` — used when creating listings
- `hashColor(name)` / `getInitials(name)` — for avatar rendering
- `FALLBACK_CATEGORIES` — hardcoded fallback if DB is unavailable

[lib/types.ts](lib/types.ts) defines all shared TypeScript interfaces (`Profile`, `Listing`, `Booking`, `Review`, `Category`, `Message`, `SiteMedia`).
