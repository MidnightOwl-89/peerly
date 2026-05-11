'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StarRating from './StarRating'
import ProviderAvatar from './ProviderAvatar'

interface ServiceCardProps {
  id: string
  slug: string
  categorySlug: string
  categoryName?: string
  title: string
  price: number
  priceUnit: string
  providerName: string
  providerImage?: string | null
  rating?: number
  reviewCount?: number
  coverImage?: string | null
  isOwn?: boolean
  isGuest?: boolean
}

export default function ServiceCard({
  slug,
  categorySlug,
  categoryName,
  title,
  price,
  priceUnit,
  providerName,
  providerImage,
  rating,
  reviewCount,
  coverImage,
  isOwn = false,
  isGuest = false,
}: ServiceCardProps) {
  const router = useRouter()
  const href = isGuest
    ? `/signin?redirect=/services/${categorySlug}/${slug}`
    : `/services/${categorySlug}/${slug}`

  return (
    <div
      className="service-card"
      onClick={() => router.push(href)}
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 190, overflow: 'hidden' }}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover service-card-img"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(230,51,41,0.18), rgba(13,11,15,1))' }} />
        )}

        {/* Gradient fade at bottom of image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, rgba(13,11,15,0.85), transparent)', pointerEvents: 'none' }} />

        {/* Category pill — bottom left of image */}
        {categoryName && (
          <div style={{ position: 'absolute', bottom: 10, left: 12, padding: '3px 10px', borderRadius: 100, background: 'rgba(13,11,15,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 10, fontWeight: 600, color: 'rgba(240,237,232,0.7)', letterSpacing: '0.05em', textTransform: 'uppercase', pointerEvents: 'none' }}>
            {categoryName}
          </div>
        )}

        {/* Own listing badge */}
        {isOwn && (
          <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 8, background: 'rgba(230,51,41,0.9)', color: '#fff', fontSize: 11, fontWeight: 600, backdropFilter: 'blur(8px)' }}>
            Your Listing
          </div>
        )}

        {/* Hover overlay */}
        {!isOwn && (
          <div
            className="service-card-overlay"
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none' }}
          >
            <span style={{ padding: '9px 22px', borderRadius: 10, backgroundColor: '#e63329', color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {isGuest ? 'Sign in to book' : 'View & Book'}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Provider row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ProviderAvatar name={providerName} imageUrl={providerImage} size={24} />
          <span style={{ color: 'rgba(240,237,232,0.5)', fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{providerName}</span>
          {rating !== undefined && (
            <StarRating rating={rating} count={reviewCount} size="sm" />
          )}
        </div>

        {/* Title */}
        <p style={{ fontWeight: 700, fontSize: 14, color: '#f0ede8', lineHeight: 1.35, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </p>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: 'rgba(240,237,232,0.35)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From </span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#f0ede8' }}>${price.toFixed(0)}</span>
            <span style={{ fontSize: 12, color: 'rgba(240,237,232,0.35)', marginLeft: 2 }}>/{priceUnit}</span>
          </div>

          {isOwn ? (
            <Link
              href={`/dashboard/listings/edit/${slug}`}
              onClick={e => e.stopPropagation()}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', color: '#f0ede8', fontSize: 12, fontWeight: 500, textDecoration: 'none' }}
            >
              Edit
            </Link>
          ) : (
            <Link
              href={href}
              onClick={e => e.stopPropagation()}
              style={{ padding: '7px 16px', borderRadius: 9, backgroundColor: 'rgba(230,51,41,0.12)', border: '1px solid rgba(230,51,41,0.3)', color: '#e63329', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'background 0.15s' }}
            >
              Book
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
