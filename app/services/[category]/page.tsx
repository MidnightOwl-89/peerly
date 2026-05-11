import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ServiceCard from '@/components/ServiceCard'
import { FALLBACK_CATEGORIES } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: Promise<{ category: string }>
  searchParams: Promise<{ sort?: string; max?: string }>
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const { sort = 'recent', max } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch category info
  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', category)
    .single()

  const fallbackCat = FALLBACK_CATEGORIES.find(c => c.slug === category)
  const catName = cat?.name ?? fallbackCat?.name ?? category
  const catImage = cat?.cover_image ?? fallbackCat?.cover_image ?? null

  // Build listings query
  let query = supabase
    .from('listings')
    .select(`
      id, title, price, price_unit, images, slug, provider_id,
      provider:profiles(id, name, profile_image),
      reviews(rating)
    `)
    .eq('active', true)

  if (cat?.id) query = query.eq('category_id', cat.id)
  if (max) query = query.lte('price', Number(max))
  if (sort === 'price') query = query.order('price', { ascending: true })
  else query = query.order('created_at', { ascending: false })

  const { data: listings } = await query

  // Compute per-listing avg rating
  const enriched = (listings ?? []).map(l => {
    const reviews = (l.reviews as { rating: number }[]) ?? []
    const avg = reviews.length
      ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
      : undefined
    return { ...l, avgRating: avg, reviewCount: reviews.length }
  })

  const sorted =
    sort === 'rated'
      ? [...enriched].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
      : enriched

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
        {/* Hero banner */}
        <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
          {catImage ? (
            <Image
              src={catImage}
              alt={catName}
              fill
              className="object-cover"
              style={{ filter: 'brightness(0.25) blur(2px)', transform: 'scale(1.05)' }}
              sizes="100vw"
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a0a0a, #0a0a0f)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.4) 100%)' }} />

          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 32px 32px', maxWidth: 1280, margin: '0 auto', left: 0, right: 0 }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(240,237,232,0.5)',
                fontSize: 13,
                textDecoration: 'none',
                marginBottom: 12,
                transition: 'color 0.2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              All Categories
            </Link>
            <h1
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(36px, 6vw, 64px)',
                color: '#f0ede8',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {catName}
            </h1>
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            position: 'sticky',
            top: 68,
            zIndex: 40,
            background: 'rgba(10,10,15,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 32px',
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Most Recent', value: 'recent' },
              { label: 'Top Rated', value: 'rated' },
              { label: 'Lowest Price', value: 'price' },
            ].map(f => (
              <Link
                key={f.value}
                href={`/services/${category}?sort=${f.value}${max ? `&max=${max}` : ''}`}
                style={{
                  padding: '7px 16px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: sort === f.value ? '#e63329' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${sort === f.value ? '#e63329' : 'rgba(255,255,255,0.08)'}`,
                  color: sort === f.value ? '#fff' : 'rgba(240,237,232,0.6)',
                }}
              >
                {f.label}
              </Link>
            ))}
            {[20, 50, 100].map(m => (
              <Link
                key={m}
                href={`/services/${category}?sort=${sort}&max=${m}`}
                style={{
                  padding: '7px 14px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: max === String(m) ? 'rgba(230,51,41,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${max === String(m) ? 'rgba(230,51,41,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  color: max === String(m) ? '#e63329' : 'rgba(240,237,232,0.5)',
                }}
              >
                Under ${m}
              </Link>
            ))}
          </div>
        </div>

        {/* Listings grid */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ color: 'rgba(240,237,232,0.3)', fontSize: 16 }}>
                No listings in this category yet.
              </p>
              <Link
                href="/"
                style={{ color: '#e63329', fontSize: 14, marginTop: 12, display: 'inline-block', textDecoration: 'none' }}
              >
                Back to home
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: 20,
              }}
            >
              {sorted.map(listing => {
                const provider = listing.provider as { id: string; name: string; profile_image: string | null } | null
                return (
                  <ServiceCard
                    key={listing.id}
                    id={listing.id}
                    slug={listing.slug}
                    categorySlug={category}
                    title={listing.title}
                    price={listing.price}
                    priceUnit={listing.price_unit}
                    providerName={provider?.name ?? 'Unknown'}
                    providerImage={provider?.profile_image}
                    rating={listing.avgRating}
                    reviewCount={listing.reviewCount}
                    coverImage={listing.images?.[0] ?? null}
                    isOwn={user?.id === listing.provider_id}
                    isGuest={!user}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
