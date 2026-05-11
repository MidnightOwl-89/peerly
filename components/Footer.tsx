import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: '#0a0a0f',
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: '#e63329',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 800,
                fontSize: 14,
                color: '#fff',
              }}
            >
              P
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: 16,
              color: '#f0ede8',
            }}
          >
            Peer<span style={{ color: '#e63329' }}>ly</span>
          </span>
        </Link>

        <p
          style={{
            color: 'rgba(240,237,232,0.4)',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          Peerly — Your Campus Marketplace
        </p>

        <p style={{ color: 'rgba(240,237,232,0.3)', fontSize: 12 }}>
          Made for NIU students, by NIU students.
        </p>
      </div>
    </footer>
  )
}
