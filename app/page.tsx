import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CategoryCard from '@/components/CategoryCard'
import Button from '@/components/Button'
import PopularServiceCard from '@/components/PopularServiceCard'
import ProviderChip from '@/components/ProviderChip'
import Link from 'next/link'
import { FALLBACK_CATEGORIES } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: categories },
    { data: popularListings },
    { data: topProviders },
    { data: categoryCounts },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('slug, name, cover_image')
      .eq('active', true)
      .order('display_order'),

    supabase
      .from('listings')
      .select('id, slug, title, price, price_unit, images, category_id, provider_id, profiles(id, name, profile_image), reviews(rating), categories(slug)')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('profiles')
      .select('id, name, profile_image, major')
      .eq('is_provider', true)
      .limit(8),

    supabase
      .from('listings')
      .select('category_id, categories(slug, name)')
      .eq('active', true),
  ])

  const cats = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES

  // Compute avg rating per popular listing
  const enrichedListings = (popularListings ?? []).map((l: any) => {
    const ratings = (l.reviews ?? []).map((r: any) => r.rating as number)
    const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : undefined
    const categorySlug = l.categories?.slug ?? 'other'
    return { ...l, avgRating, reviewCount: ratings.length, categorySlug }
  })

  const enrichedProviders = (topProviders ?? []).slice(0, 6)

  // Listing count per category slug
  const countMap: Record<string, number> = {}
  ;(categoryCounts ?? []).forEach((l: any) => {
    const slug = l.categories?.slug
    if (slug) countMap[slug] = (countMap[slug] ?? 0) + 1
  })

  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: '#0d0b0f', minHeight: '100vh' }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section
          className="hero-section"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            overflow: 'hidden',
            background:
              'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(230,51,41,0.22) 0%, transparent 65%), #0d0b0f',
          }}
        >
          {[700, 500, 320].map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: s,
                height: s,
                borderRadius: '50%',
                border: `1px solid rgba(230,51,41,${0.04 + i * 0.02})`,
                pointerEvents: 'none',
              }}
            />
          ))}

          <div
            className="animate-fade-up delay-0"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 16px',
              borderRadius: 100,
              backgroundColor: 'rgba(230,51,41,0.1)',
              border: '1px solid rgba(230,51,41,0.25)',
              marginBottom: 28,
              opacity: 0,
            }}
          >
            <span
              className="animate-pulse-red"
              style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#e63329', display: 'block' }}
            />
            <span style={{ color: '#e63329', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
              NIU Campus Exclusive — Now Live
            </span>
          </div>

          <h1
            className="animate-fade-up delay-1"
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(52px, 9vw, 92px)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: '#f0ede8',
              marginBottom: 24,
              opacity: 0,
            }}
          >
            Your Campus
            <br />
            <span className="animate-gradient">Marketplace.</span>
          </h1>

          <p
            className="animate-fade-up delay-2"
            style={{
              maxWidth: 520,
              fontSize: 17,
              lineHeight: 1.65,
              color: 'rgba(240,237,232,0.55)',
              marginBottom: 36,
              opacity: 0,
            }}
          >
            Find and book student services on campus —{' '}
            or earn money doing what you&apos;re already good at.
          </p>

          <div
            className="animate-fade-up delay-3"
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', opacity: 0 }}
          >
            <Button href="/services" variant="primary" size="lg">
              Find a Service
            </Button>
            <Button href="/signup?type=provider" variant="ghost" size="lg">
              Offer a Service
            </Button>
          </div>

          <div
            className="animate-fade-up delay-4 stat-bar"
            style={{
              display: 'flex',
              gap: 0,
              marginTop: 48,
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              overflow: 'hidden',
              opacity: 0,
            }}
          >
            {[
              { value: '15+', label: 'Service Categories' },
              { value: 'NIU', label: 'Campus Exclusive' },
              { value: 'P2P', label: 'Peer-to-Peer' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: '18px 40px',
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : undefined,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <p style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 22, color: '#f0ede8', marginBottom: 3 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(240,237,232,0.4)', letterSpacing: '0.04em' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── POPULAR THIS WEEK ──────────────────────────────────── */}
        <section style={{ padding: '80px 0 60px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <p style={{ color: '#e63329', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Trending
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontWeight: 800,
                    fontSize: 'clamp(28px, 4vw, 40px)',
                    color: '#f0ede8',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Popular This Week
                </h2>
              </div>
              <Link
                href="/services"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#e63329',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                View all
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Scrollable row — extends edge to edge with side padding */}
          <div
            className="scroll-row"
            style={{ paddingLeft: 'max(24px, calc((100vw - 1280px)/2 + 24px))', paddingRight: 24 }}
          >
            {enrichedListings.length > 0 ? (
              enrichedListings.map((listing: any) => (
                <PopularServiceCard
                  key={listing.id}
                  slug={listing.slug}
                  categorySlug={listing.categorySlug}
                  title={listing.title}
                  price={listing.price}
                  priceUnit={listing.price_unit}
                  providerName={listing.profiles?.name ?? 'NIU Student'}
                  providerImage={listing.profiles?.profile_image}
                  rating={listing.avgRating}
                  reviewCount={listing.reviewCount}
                  coverImage={listing.images?.[0] ?? null}
                />
              ))
            ) : (
              /* Empty state placeholder cards */
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 220,
                    height: 320,
                    borderRadius: 20,
                    flexShrink: 0,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'rgba(240,237,232,0.2)', fontSize: 12 }}>No listings yet</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── TOP PROVIDERS ──────────────────────────────────────── */}
        {enrichedProviders.length > 0 && (
          <section style={{ padding: '20px 0 70px' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 32 }}>
              <p style={{ color: '#e63329', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
                Community
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  color: '#f0ede8',
                  letterSpacing: '-0.02em',
                }}
              >
                Top Providers on Campus
              </h2>
            </div>

            <div
              className="scroll-row"
              style={{ paddingLeft: 'max(24px, calc((100vw - 1280px)/2 + 24px))', paddingRight: 24 }}
            >
              {enrichedProviders.map((provider: any) => (
                <ProviderChip
                  key={provider.id}
                  id={provider.id}
                  name={provider.name}
                  profileImage={provider.profile_image}
                  category={provider.major ?? undefined}
                  verificationStatus={undefined}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── EXPLORE SERVICES ───────────────────────────────────── */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <p style={{ color: '#e63329', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
                Browse
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  color: '#f0ede8',
                  letterSpacing: '-0.02em',
                }}
              >
                Explore Services
              </h2>
            </div>
          </div>

          <div
            className="grid-categories"
            style={{
              display: 'grid',
              gap: 16,
            }}
          >
            {cats.map((cat: any) => (
              <div key={cat.slug} style={{ position: 'relative' }}>
                <CategoryCard slug={cat.slug} name={cat.name} coverImage={cat.cover_image} />
                {countMap[cat.slug] !== undefined && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      padding: '3px 9px',
                      borderRadius: 100,
                      background: 'rgba(13,11,15,0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(240,237,232,0.7)',
                      pointerEvents: 'none',
                    }}
                  >
                    {countMap[cat.slug]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section
          id="how-it-works"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '90px 24px',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#e63329', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
                The Process
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(28px, 3.5vw, 42px)',
                  color: '#f0ede8',
                  letterSpacing: '-0.02em',
                }}
              >
                How Peerly Works
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
              {[
                {
                  step: '01', title: 'Browse Services',
                  desc: 'Explore 15+ categories of student-run services — from photography to barbering to tutoring.',
                  icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
                },
                {
                  step: '02', title: 'Book & Pay Deposit',
                  desc: 'Pick a time, pay a small deposit to confirm. The rest is held safely until you\'re satisfied.',
                  icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
                },
                {
                  step: '03', title: 'Get It Done',
                  desc: 'Show up, get the service done. Chat directly with your provider along the way.',
                  icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polyline points="20 6 9 17 4 12" /></svg>),
                },
                {
                  step: '04', title: 'Rate & Release',
                  desc: 'Both parties rate the experience. Payment releases to the provider only after you approve.',
                  icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
                },
              ].map((item) => (
                <div key={item.step} style={{ position: 'relative' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 800,
                      fontSize: 72,
                      color: 'rgba(230,51,41,0.07)',
                      lineHeight: 1,
                      position: 'absolute',
                      top: -10,
                      left: -4,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {item.step}
                  </div>
                  <div style={{ paddingTop: 32 }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        backgroundColor: 'rgba(230,51,41,0.12)',
                        border: '1px solid rgba(230,51,41,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#e63329', marginBottom: 14,
                      }}
                    >
                      {item.icon}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 700, fontSize: 17, color: '#f0ede8', marginBottom: 8 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 14, color: 'rgba(240,237,232,0.5)', lineHeight: 1.65 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ───────────────────────────────────────────── */}
        <section style={{ padding: '90px 24px', position: 'relative' }}>
          <div
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600, height: 300,
              background: 'radial-gradient(ellipse, rgba(230,51,41,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="cta-card"
            style={{
              maxWidth: 860, margin: '0 auto',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              textAlign: 'center', position: 'relative',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                color: '#f0ede8',
                letterSpacing: '-0.02em',
                marginBottom: 12,
              }}
            >
              Ready to get started?
            </h2>
            <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: 15, marginBottom: 32 }}>
              Join hundreds of NIU students already using Peerly.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button href="/signup" variant="primary" size="lg">
                Create Free Account
              </Button>
              <Button href="/services" variant="ghost" size="lg">
                Browse Services
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
