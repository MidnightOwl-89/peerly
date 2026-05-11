import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingWidget from '@/components/BookingWidget'
import StarRating from '@/components/StarRating'
import ProviderAvatar from '@/components/ProviderAvatar'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FALLBACK_CATEGORIES } from '@/lib/utils'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export default async function ListingPage({ params }: Props) {
  const { category, slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from('listings')
    .select(`
      *,
      provider:profiles(*),
      category:categories(slug, name),
      reviews(*, author:profiles(name, profile_image))
    `)
    .eq('slug', slug)
    .single()

  if (!listing) notFound()

  if (!listing.active) {
    const { data: related } = await supabase
      .from('listings')
      .select('id, title, slug, price, price_unit, images, provider:profiles(name, profile_image)')
      .eq('active', true)
      .neq('id', listing.id)
      .limit(3)

    return (
      <>
        <Navbar />
        <main style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', padding: '120px 24px 60px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: 'rgba(240,237,232,0.3)', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Unavailable
            </p>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 28, color: '#f0ede8', marginBottom: 12 }}>
              This service is no longer available
            </h1>
            <p style={{ color: 'rgba(240,237,232,0.45)', marginBottom: 36 }}>
              The provider has deactivated this listing.
            </p>
            {related && related.length > 0 && (
              <div>
                <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 13, marginBottom: 20 }}>Similar services you might like:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {related.map((r) => {
                    const p = r.provider as { name: string } | null
                    return (
                      <Link key={r.id} href={`/services/${category}/${r.slug}`} style={{ padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#f0ede8', fontSize: 14, fontWeight: 500 }}>{r.title}</span>
                        <span style={{ color: '#e63329', fontWeight: 700, fontSize: 14 }}>${r.price}/{r.price_unit}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const provider = listing.provider as { id: string; name: string; profile_image: string | null; bio: string | null } | null
  const reviews = (listing.reviews ?? []) as Array<{ id: string; rating: number; text: string; created_at: string; author: { name: string; profile_image: string | null } | null }>
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null

  const catName = (listing.category as { name: string } | null)?.name
    ?? FALLBACK_CATEGORIES.find(c => c.slug === category)?.name
    ?? category

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', paddingTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          {/* Back link */}
          <Link
            href={`/services/${category}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(240,237,232,0.45)', fontSize: 13, textDecoration: 'none', marginBottom: 28 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {catName}
          </Link>

          {/* Two-column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 360px',
              gap: 36,
              alignItems: 'start',
            }}
            className="listing-layout"
          >
            {/* Left */}
            <div>
              {/* Hero image */}
              <div style={{ position: 'relative', height: 420, borderRadius: 20, overflow: 'hidden', marginBottom: 16 }}>
                {listing.images?.[0] ? (
                  <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(230,51,41,0.12), #0a0a0f)' }} />
                )}
              </div>

              {/* Thumbnail strip */}
              {listing.images?.length > 1 && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 36 }}>
                  {listing.images.slice(1, 4).map((img: string, i: number) => (
                    <div key={i} style={{ position: 'relative', width: 110, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Image src={img} alt={`Photo ${i + 2}`} fill className="object-cover" sizes="110px" />
                    </div>
                  ))}
                </div>
              )}

              {/* Title + provider */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 34px)', color: '#f0ede8', letterSpacing: '-0.02em', marginBottom: 12 }}>
                  {listing.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {provider && <ProviderAvatar name={provider.name} imageUrl={provider.profile_image} size={32} />}
                  <span style={{ color: 'rgba(240,237,232,0.6)', fontSize: 14 }}>{provider?.name}</span>
                  {avgRating !== null && (
                    <StarRating rating={avgRating} count={reviews.length} size="sm" />
                  )}
                </div>
              </div>

              {/* Description */}
              <div
                style={{
                  padding: '24px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16,
                  marginBottom: 36,
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#f0ede8', marginBottom: 12 }}>
                  About this service
                </h2>
                <p style={{ color: 'rgba(240,237,232,0.6)', fontSize: 14, lineHeight: 1.75 }}>
                  {listing.description}
                </p>
              </div>

              {/* Reviews */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#f0ede8' }}>
                    Reviews
                  </h2>
                  {avgRating !== null && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 28, color: '#f0ede8' }}>
                        {avgRating.toFixed(1)}
                      </span>
                      <StarRating rating={avgRating} count={reviews.length} size="sm" />
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <p style={{ color: 'rgba(240,237,232,0.3)', fontSize: 14 }}>No reviews yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {reviews.map(rev => (
                      <div
                        key={rev.id}
                        style={{
                          padding: '20px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: 14,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <ProviderAvatar name={rev.author?.name ?? 'U'} imageUrl={rev.author?.profile_image ?? null} size={32} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: '#f0ede8' }}>{rev.author?.name ?? 'Student'}</p>
                            <StarRating rating={rev.rating} size="sm" showCount={false} />
                          </div>
                          <span style={{ marginLeft: 'auto', color: 'rgba(240,237,232,0.3)', fontSize: 11 }}>
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ color: 'rgba(240,237,232,0.6)', fontSize: 13, lineHeight: 1.6 }}>{rev.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right — booking widget */}
            <div>
              <BookingWidget
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  price_unit: listing.price_unit,
                  slug: listing.slug,
                  provider_id: listing.provider_id,
                  category_slug: category,
                }}
                provider={{
                  id: provider?.id ?? '',
                  name: provider?.name ?? 'Provider',
                  profile_image: provider?.profile_image ?? null,
                  rating: avgRating ?? undefined,
                  reviewCount: reviews.length,
                }}
                currentUserId={user?.id ?? null}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .listing-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
