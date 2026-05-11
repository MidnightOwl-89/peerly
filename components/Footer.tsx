import Link from 'next/link'

const CATEGORIES = [
  { label: 'Hair & Beauty', slug: 'hair-beauty' },
  { label: 'Photography', slug: 'photography' },
  { label: 'Tutoring', slug: 'tutoring' },
  { label: 'Music & Audio', slug: 'music-audio' },
  { label: 'Design', slug: 'design' },
  { label: 'Fitness', slug: 'fitness' },
]

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: '#0d0b0f',
        padding: '56px 24px 32px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px 32px',
            marginBottom: 52,
          }}
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 14 }}
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
                  flexShrink: 0,
                }}
              >
                <span style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</span>
              </div>
              <span style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 16, color: '#f0ede8' }}>
                Peer<span style={{ color: '#e63329' }}>ly</span>
              </span>
            </Link>
            <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 13, lineHeight: 1.6, maxWidth: 200 }}>
              The peer-to-peer service marketplace exclusively for NIU students.
            </p>
          </div>

          {/* Browse column */}
          <div>
            <p style={colHeadStyle}>Browse</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link href={`/services/${cat.slug}`} style={linkStyle}>{cat.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/services" style={{ ...linkStyle, color: '#e63329' }}>View All →</Link>
              </li>
            </ul>
          </div>

          {/* Platform column */}
          <div>
            <p style={colHeadStyle}>Platform</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><a href="/#how-it-works" style={linkStyle}>How it works</a></li>
              <li><Link href="/signup?type=provider" style={linkStyle}>Become a Provider</Link></li>
              <li><Link href="/services" style={linkStyle}>Find a Service</Link></li>
              <li><Link href="/onboarding" style={linkStyle}>Set up your profile</Link></li>
            </ul>
          </div>

          {/* Account column */}
          <div>
            <p style={colHeadStyle}>Account</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link href="/signin" style={linkStyle}>Sign In</Link></li>
              <li><Link href="/signup" style={linkStyle}>Create Account</Link></li>
              <li><Link href="/dashboard" style={linkStyle}>Dashboard</Link></li>
              <li><Link href="/dashboard/listings/new" style={linkStyle}>New Listing</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <p style={{ color: 'rgba(240,237,232,0.3)', fontSize: 12 }}>
            © {new Date().getFullYear()} Peerly. Made for NIU students, by NIU students.
          </p>
          <p style={{ color: 'rgba(240,237,232,0.2)', fontSize: 12 }}>
            Northern Illinois University · DeKalb, IL
          </p>
        </div>
      </div>
    </footer>
  )
}

const colHeadStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'rgba(240,237,232,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 16,
}

const linkStyle: React.CSSProperties = {
  color: 'rgba(240,237,232,0.55)',
  fontSize: 13,
  textDecoration: 'none',
  transition: 'color 0.2s',
  display: 'inline-block',
}
