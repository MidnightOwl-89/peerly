'use client'

import Image from 'next/image'
import Link from 'next/link'
import ProviderAvatar from './ProviderAvatar'
import StarRating from './StarRating'

interface PopularServiceCardProps {
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
}

export default function PopularServiceCard({
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
}: PopularServiceCardProps) {
  return (
    <Link
      href={`/services/${categorySlug}/${slug}`}
      style={{ textDecoration: 'none', flexShrink: 0 }}
    >
      <div
        style={{
          width: 220,
          height: 320,
          borderRadius: 20,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px) scale(1.02)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(230,51,41,0.25)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(1)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* Full-card background image */}
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="220px"
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(145deg, rgba(230,51,41,0.3) 0%, rgba(10,10,15,1) 100%)',
            }}
          />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
          }}
        />

        {/* Price badge top-right */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '5px 10px',
            borderRadius: 100,
            background: 'rgba(230,51,41,0.9)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ${price.toFixed(0)}
          <span style={{ fontWeight: 400, opacity: 0.8, fontSize: 10 }}>/{priceUnit}</span>
        </div>

        {/* Bottom info panel */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 14px',
          }}
        >
          {rating !== undefined && (
            <div style={{ marginBottom: 6 }}>
              <StarRating rating={rating} count={reviewCount} size="sm" />
            </div>
          )}

          <h3
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: '#f0ede8',
              lineHeight: 1.3,
              marginBottom: 10,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ProviderAvatar name={providerName} imageUrl={providerImage} size={22} />
            <span style={{ color: 'rgba(240,237,232,0.65)', fontSize: 11, fontWeight: 500 }}>
              {providerName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
