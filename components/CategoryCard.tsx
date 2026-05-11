'use client'

import Image from 'next/image'
import Link from 'next/link'
import { use3DTilt } from '@/hooks/use3DTilt'

interface CategoryCardProps {
  slug: string
  name: string
  coverImage: string | null
}

export default function CategoryCard({ slug, name, coverImage }: CategoryCardProps) {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt(8)

  return (
    <Link
      href={`/services/${slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          height: 220,
          borderRadius: 16,
          overflow: 'hidden',
          cursor: 'pointer',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(230,51,41,0.5)'
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(230,51,41,0.3), 0 20px 40px rgba(0,0,0,0.4)'
        }}
        // handleMouseLeave from tilt handles transform reset
      >
        {/* Photo */}
        {coverImage ? (
          <Image
            src={coverImage}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            style={{ transition: 'transform 0.5s ease' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%)',
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
          }}
        />

        {/* Name */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 14px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 700,
              fontSize: 15,
              color: '#fff',
              lineHeight: 1.2,
            }}
          >
            {name}
          </p>
        </div>
      </div>
    </Link>
  )
}
