'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import ProviderAvatar from './ProviderAvatar'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, profile, isLoggedIn, isLoading, isProvider } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease',
    background: scrolled ? 'rgba(13,11,15,0.85)' : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
  }

  return (
    <nav style={navStyle}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
              width: 32,
              height: 32,
              borderRadius: 9,
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
                fontSize: 15,
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
              fontSize: 18,
              color: '#f0ede8',
              letterSpacing: '-0.02em',
            }}
          >
            Peer<span style={{ color: '#e63329' }}>ly</span>
          </span>
        </Link>

        {/* Center links — desktop */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
          className="hidden md:flex"
        >
          <Link
            href="/services"
            style={{ color: 'rgba(240,237,232,0.6)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.6)')}
          >
            Browse
          </Link>
          <a
            href="/#how-it-works"
            style={{ color: 'rgba(240,237,232,0.6)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.6)')}
          >
            How it works
          </a>
        </div>

        {/* Right — desktop */}
        <div className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isLoading ? (
            <div style={{ width: 80, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }} />
          ) : isLoggedIn ? (
            <>
              {isProvider && (
                <Link
                  href="/dashboard/listings/new"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(230,51,41,0.12)',
                    border: '1px solid rgba(230,51,41,0.25)',
                    color: '#e63329',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Listing
                </Link>
              )}
              <Link
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px 6px 6px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <ProviderAvatar name={profile?.name ?? user?.email ?? 'U'} imageUrl={profile?.profile_image} size={28} />
                <span style={{ color: '#f0ede8', fontSize: 13, fontWeight: 500 }}>
                  {profile?.name?.split(' ')[0] ?? 'Dashboard'}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(240,237,232,0.5)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#f0ede8',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  backgroundColor: '#e63329',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ff4438')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e63329')}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                display: 'block',
                width: 22,
                height: 2,
                borderRadius: 2,
                backgroundColor: '#f0ede8',
                transition: 'all 0.25s ease',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translateY(7px)' : i === 2 ? 'rotate(-45deg) translateY(-7px)' : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: 'rgba(13,11,15,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <Link href="/services" style={mobileLink} onClick={() => setMenuOpen(false)}>Browse Services</Link>
          <a href="/#how-it-works" style={mobileLink} onClick={() => setMenuOpen(false)}>How it works</a>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" style={mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {isProvider && (
                <Link href="/dashboard/listings/new" style={mobileLink} onClick={() => setMenuOpen(false)}>
                  + New Listing
                </Link>
              )}
              <button onClick={handleSignOut} style={{ ...mobileLink, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" style={mobileLink} onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link
                href="/signup"
                style={{ ...mobileLink, backgroundColor: '#e63329', borderColor: '#e63329', textAlign: 'center' }}
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

const mobileLink: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f0ede8',
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  display: 'block',
}
