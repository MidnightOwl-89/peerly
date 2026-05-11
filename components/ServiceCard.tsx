'use client'

import Image from 'next/image'
import Link from 'next/link'
import { use3DTilt } from '@/hooks/use3DTilt'
import StarRating from './StarRating'
import ProviderAvatar from './ProviderAvatar'

interface ServiceCardProps {
  id: string
  slug: string
  categorySlug: string
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
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt(6)

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(230,51,41,0.15), rgba(10,10,15,1))',
            }}
          />
        )}

        {/* Own listing badge */}
        {isOwn && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: '4px 10px',
              borderRadius: 8,
              background: 'rgba(230,51,41,0.9)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
            }}
          >
            Your Listing
          </div>
        )}

        {/* Hover overlay with Book Now */}
        {!isOwn && (
          <div
            className="book-now-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.25s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            <Link
              href={isGuest ? `/signin?redirect=/services/${categorySlug}/${slug}` : `/services/${categorySlug}/${slug}`}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                backgroundColor: '#e63329',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'transform 0.2s ease',
              }}
            >
              {isGuest ? 'Sign in to book' : 'Book Now'}
            </Link>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ProviderAvatar name={providerName} imageUrl={providerImage} size={26} />
          <span style={{ color: 'rgba(240,237,232,0.55)', fontSize: 12 }}>{providerName}</span>
          {rating !== undefined && (
            <span style={{ marginLeft: 'auto' }}>
              <StarRating rating={rating} count={reviewCount} size="sm" />
            </span>
          )}
        </div>

        <Link href={`/services/${categorySlug}/${slug}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 700,
              fontSize: 15,
              color: '#f0ede8',
              marginBottom: 10,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: 17,
              color: '#e63329',
            }}
          >
            ${price.toFixed(0)}
            <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(240,237,232,0.4)', marginLeft: 2 }}>
              /{priceUnit}
            </span>
          </span>
          {isOwn ? (
            <Link
              href={`/dashboard/listings/edit/${slug}`}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f0ede8',
                fontSize: 12,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Edit
            </Link>
          ) : (
            <Link
              href={isGuest ? `/signin?redirect=/services/${categorySlug}/${slug}` : `/services/${categorySlug}/${slug}`}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                backgroundColor: '#e63329',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Book
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
