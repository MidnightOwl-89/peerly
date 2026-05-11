import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CategoryCard from '@/components/CategoryCard'
import { FALLBACK_CATEGORIES } from '@/lib/utils'
import Link from 'next/link'

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  const [{ data: categories }, { data: listings }] = await Promise.all([
    supabase
      .from('categories')
      .select('slug, name, cover_image')
      .eq('active', true)
      .order('display_order'),

    q
      ? supabase
          .from('listings')
          .select('id, slug, title, price, price_unit, images, categories(slug, name), profiles(name)')
          .eq('active', true)
          .ilike('title', `%${q}%`)
          .limit(20)
      : Promise.resolve({ data: null, error: null }),
  ])

  const cats = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES

  // Listing count per category
  const { data: counts } = await supabase
    .from('listings')
    .select('category_id, categories(slug)')
    .eq('active', true)

  const countMap: Record<string, number> = {}
  ;(counts ?? []).forEach((l: any) => {
    const slug = l.categories?.slug
    if (slug) countMap[slug] = (countMap[slug] ?? 0) + 1
  })

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#0d0b0f', minHeight: '100vh', paddingTop: 68 }}>

        {/* Header */}
        <section
          style={{
            background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(230,51,41,0.15) 0%, transparent 70%), #0d0b0f',
            padding: '56px 24px 48px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#e63329', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
            Campus Marketplace
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(32px, 6vw, 56px)',
              color: '#f0ede8',
              letterSpacing: '-0.02em',
              marginBottom: 32,
            }}
          >
            Browse Services
          </h1>

          {/* Search bar */}
          <form
            action="/services"
            method="GET"
            style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}
          >
            <div style={{ position: 'relative' }}>
              <svg
                style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,237,232,0.35)' }}
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                name="q"
                defaultValue={q ?? ''}
                type="search"
                placeholder="Search for any service..."
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '16px 52px 16px 50px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f0ede8',
                  fontSize: 15,
                  outline: 'none',
                  colorScheme: 'dark',
                }}
              />
              {q && (
                <Link
                  href="/services"
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(240,237,232,0.4)', textDecoration: 'none', fontSize: 20, lineHeight: 1,
                  }}
                >
                  ×
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* Search results */}
        {q && (
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
            <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: 14, marginBottom: 24 }}>
              {listings?.length ?? 0} result{listings?.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
            </p>
            {listings && listings.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {listings.map((l: any) => (
                  <Link
                    key={l.id}
                    href={`/services/${l.categories?.slug ?? 'other'}/${l.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'border-color 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(230,51,41,0.4)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                    >
                      <p style={{ fontSize: 11, color: '#e63329', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        {l.categories?.name}
                      </p>
                      <p style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 700, fontSize: 15, color: '#f0ede8', marginBottom: 6 }}>
                        {l.title}
                      </p>
                      <p style={{ fontSize: 13, color: 'rgba(240,237,232,0.45)' }}>
                        by {l.profiles?.name} · ${l.price}/{l.price_unit}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(240,237,232,0.35)', fontSize: 15 }}>
                No services found. Try a different search.
              </div>
            )}
          </section>
        )}

        {/* All categories */}
        {!q && (
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '8px 24px 80px' }}>
            <div className="grid-categories" style={{ display: 'grid', gap: 16 }}>
              {cats.map((cat: any) => (
                <div key={cat.slug} style={{ position: 'relative' }}>
                  <CategoryCard slug={cat.slug} name={cat.name} coverImage={cat.cover_image} />
                  {countMap[cat.slug] !== undefined && (
                    <div
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        padding: '3px 9px', borderRadius: 100,
                        background: 'rgba(13,11,15,0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: 11, fontWeight: 600,
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
        )}
      </main>
      <Footer />
    </>
  )
}
