# Peerly — Supabase Setup Guide

Everything you need to run in Supabase once. After this, only swap 3 env vars and the app is live.

---

## 1. Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Name it `peerly`, pick a region closest to you
3. Save the database password somewhere safe

---

## 2. Set Environment Variables

Open `.env.local` at the project root and replace the placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Find these in: **Supabase Dashboard → Project Settings → API**

---

## 3. Run the Database Schema

Go to **Supabase Dashboard → SQL Editor → New query**, paste and run:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  profile_image text,
  bio text,
  major text,
  year text,
  is_provider boolean default false,
  onboarded boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Categories
create table categories (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  cover_image text,
  description text,
  active boolean default true,
  display_order int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Listings
create table listings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  price decimal(10,2) not null,
  price_unit text default 'hr',
  images text[] default '{}',
  active boolean default true,
  provider_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id),
  slug text unique not null,
  views int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Bookings
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) not null,
  buyer_id uuid references profiles(id) not null,
  provider_id uuid references profiles(id) not null,
  status text default 'pending',
  date date not null,
  time text not null,
  duration int not null,
  notes text,
  total_price decimal(10,2) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Reviews
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) not null,
  booking_id uuid references bookings(id) not null,
  author_id uuid references profiles(id) not null,
  rating int check (rating >= 1 and rating <= 5) not null,
  text text not null,
  images text[] default '{}',
  created_at timestamp with time zone default now()
);

-- Messages
create table messages (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) not null,
  sender_id uuid references profiles(id) not null,
  text text not null,
  sent_at timestamp with time zone default now()
);

-- Site media (admin-controlled)
create table site_media (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  url text not null,
  alt_text text,
  updated_at timestamp with time zone default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Row Level Security
alter table profiles   enable row level security;
alter table listings   enable row level security;
alter table bookings   enable row level security;
alter table reviews    enable row level security;
alter table messages   enable row level security;
alter table categories enable row level security;
alter table site_media enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Listings policies
create policy "Active listings are viewable by everyone"
  on listings for select using (active = true);
create policy "Providers can insert listings"
  on listings for insert with check (auth.uid() = provider_id);
create policy "Providers can update own listings"
  on listings for update using (auth.uid() = provider_id);
create policy "Providers can delete own listings"
  on listings for delete using (auth.uid() = provider_id);

-- Bookings policies
create policy "Users can view own bookings"
  on bookings for select using (auth.uid() = buyer_id or auth.uid() = provider_id);
create policy "Buyers can create bookings"
  on bookings for insert with check (auth.uid() = buyer_id);
create policy "Participants can update booking status"
  on bookings for update using (auth.uid() = provider_id or auth.uid() = buyer_id);

-- Reviews policies
create policy "Reviews are viewable by everyone"
  on reviews for select using (true);
create policy "Buyers can write reviews"
  on reviews for insert with check (auth.uid() = author_id);

-- Messages policies
create policy "Booking participants can view messages"
  on messages for select using (
    auth.uid() in (
      select buyer_id from bookings where id = booking_id
      union
      select provider_id from bookings where id = booking_id
    )
  );
create policy "Booking participants can send messages"
  on messages for insert with check (auth.uid() = sender_id);

-- Categories: public read
create policy "Categories are viewable by everyone"
  on categories for select using (true);

-- Site media: public read
create policy "Site media is viewable by everyone"
  on site_media for select using (true);
```

---

## 4. Seed Categories

In the same SQL Editor, run:

```sql
insert into categories (slug, name, cover_image, display_order) values
  ('hair-beauty',     'Hair & Beauty',     'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', 1),
  ('nails-braiding',  'Nails & Braiding',  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', 2),
  ('barbering',       'Barbering',         'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80', 3),
  ('tutoring',        'Tutoring',          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', 4),
  ('clothing-resale', 'Clothing & Resale', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', 5),
  ('rides',           'Rides',             'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', 6),
  ('photography',     'Photography',       'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 7),
  ('graphic-design',  'Graphic Design',    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', 8),
  ('tech-help',       'Tech Help',         'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', 9),
  ('food-meals',      'Food & Meals',      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', 10),
  ('fitness',         'Fitness',           'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 11),
  ('music-audio',     'Music & Audio',     'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80', 12);

insert into site_media (key, url, alt_text) values
  ('homepage_hero_bg',  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80', 'NIU campus'),
  ('homepage_cta_bg',   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80', 'Students on campus'),
  ('signin_side_panel', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80',  'Campus life');
```

---

## 5. Create Storage Buckets

Go to **Supabase Dashboard → Storage → New bucket** and create these 4 buckets. Set all to **Public**:

| Bucket name  | Public? | Purpose                        |
|--------------|---------|-------------------------------|
| `listings`   | Yes     | Listing photos from providers  |
| `profiles`   | Yes     | User profile photos            |
| `reviews`    | Yes     | Review photos from buyers      |
| `site-media` | Yes     | Admin-controlled site images   |

To set a bucket public: click the bucket → Settings → Toggle "Public bucket" on.

---

## 6. Configure Auth

Go to **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` (change to your deployed URL later)
- **Redirect URLs:** Add `http://localhost:3000/**`

Go to **Authentication → Email** and confirm "Enable email confirmations" is set how you want it. For dev, you can disable it so signups work instantly.

---

## 7. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## App Structure

```
/                           → Homepage (public)
/signin                     → Sign in
/signup                     → Sign up
/onboarding                 → New user setup (protected)
/services/[category]        → Browse by category
/services/[category]/[slug] → Individual listing
/book/[slug]                → Booking flow (protected)
/booking/confirmed          → Confirmation (protected)
/dashboard                  → User dashboard (protected)
/dashboard/listings/new     → Create listing (provider only)
/admin/categories           → Manage category photos (admin)
/admin/media                → Manage site images (admin)
/admin/listings             → Moderate listings (admin)
```

---

## Making Yourself Admin

After signing up, run this in the SQL Editor (replace with your email):

```sql
-- You'll need to handle admin checks in app logic or add a role column:
-- For now, admin pages are accessible to any logged-in user.
-- To restrict: add a column to profiles and check it in middleware.

alter table profiles add column if not exists role text default 'user';
update profiles set role = 'admin' where email = 'your@niu.edu';
```

Then update `middleware.ts` to check `profile.role === 'admin'` for `/admin` routes.
