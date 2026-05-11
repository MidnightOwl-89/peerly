import Link from 'next/link'
import ProviderAvatar from './ProviderAvatar'

interface ProviderChipProps {
  id: string
  name: string
  profileImage?: string | null
  category?: string
  rating?: number
  bookingCount?: number
  verificationStatus?: string
}

export default function ProviderChip({
  id,
  name,
  profileImage,
  category,
  rating,
  bookingCount,
  verificationStatus,
}: ProviderChipProps) {
  return (
    <Link href={`/services?provider=${id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
      <div
        style={{
          width: 160,
          padding: '20px 16px',
          borderRadius: 20,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
          textAlign: 'center',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-4px)'
          el.style.borderColor = 'rgba(230,51,41,0.4)'
          el.style.background = 'rgba(230,51,41,0.06)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(0)'
          el.style.borderColor = 'rgba(255,255,255,0.08)'
          el.style.background = 'rgba(255,255,255,0.04)'
        }}
      >
        {/* Avatar with optional verified ring */}
        <div style={{ position: 'relative' }}>
          <div
            style={
              verificationStatus === 'verified'
                ? {
                    padding: 2,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e63329, #ff6b6b)',
                  }
                : {}
            }
          >
            <ProviderAvatar name={name} imageUrl={profileImage} size={56} />
          </div>
          {verificationStatus === 'verified' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#e63329',
                border: '2px solid #0a0a0f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        <div>
          <p
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 700,
              fontSize: 13,
              color: '#f0ede8',
              marginBottom: 2,
            }}
          >
            {name}
          </p>
          {category && (
            <p style={{ fontSize: 11, color: 'rgba(240,237,232,0.45)', marginBottom: 6 }}>
              {category}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {rating !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#e63329">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ede8' }}>
                {rating.toFixed(1)}
              </span>
            </span>
          )}
          {bookingCount !== undefined && bookingCount > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'rgba(240,237,232,0.45)',
                padding: '2px 7px',
                borderRadius: 100,
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              {bookingCount} jobs
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
