'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const redirect = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('redirect') ?? '/dashboard')
    : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    })
    setResetSent(true)
    setResetLoading(false)
  }

  if (showReset) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0b0f', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: '#e63329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</span>
            </div>
            <span style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 18, color: '#f0ede8' }}>
              Peer<span style={{ color: '#e63329' }}>ly</span>
            </span>
          </Link>

          {resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(230,51,41,0.12)', border: '1px solid rgba(230,51,41,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63329" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 24, color: '#f0ede8', marginBottom: 10 }}>Check your email</h2>
              <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
                We sent a password reset link to <strong style={{ color: '#f0ede8' }}>{resetEmail}</strong>.
              </p>
              <button onClick={() => { setShowReset(false); setResetSent(false) }} style={{ color: '#e63329', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, fontSize: 28, color: '#f0ede8', letterSpacing: '-0.02em', marginBottom: 6 }}>Reset password</h1>
              <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 14, marginBottom: 32 }}>Enter your NIU email and we&apos;ll send you a reset link.</p>
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>NIU Email</label>
                  <input
                    type="email"
                    placeholder="jdoe@students.niu.edu"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  style={{ padding: '14px', borderRadius: 12, backgroundColor: resetLoading ? '#8b1e1b' : '#e63329', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-syne), sans-serif', border: 'none', cursor: resetLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                <button onClick={() => setShowReset(false)} style={{ color: '#e63329', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  Back to Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0b0f' }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex"
        style={{
          width: '48%',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px',
          background: '#0a0714',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=900&q=80"
          alt="Campus life"
          fill
          className="object-cover"
          style={{ opacity: 0.12 }}
          sizes="48vw"
        />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#e63329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 16, color: '#fff' }}>P</span>
            </div>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 20, color: '#f0ede8' }}>
              Peer<span style={{ color: '#e63329' }}>ly</span>
            </span>
          </Link>

          <h2
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 800,
              fontSize: 36,
              color: '#f0ede8',
              lineHeight: 1.1,
              marginBottom: 14,
              letterSpacing: '-0.02em',
            }}
          >
            Your campus,
            <br />
            your marketplace.
          </h2>
          <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 15, lineHeight: 1.6 }}>
            Exclusively for Northern Illinois University students.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px',
        }}
      >
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: '#e63329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</span>
          </div>
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: '#f0ede8' }}>
            Peer<span style={{ color: '#e63329' }}>ly</span>
          </span>
        </Link>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 800,
              fontSize: 28,
              color: '#f0ede8',
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 14, marginBottom: 32 }}>
            Sign in to your Peerly account
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(230,51,41,0.1)',
                  border: '1px solid rgba(230,51,41,0.25)',
                  color: '#ff8080',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>NIU Email</label>
              <input
                type="email"
                placeholder="jdoe@students.niu.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={labelStyle}>Password</label>
                <button
                  type="button"
                  onClick={() => { setResetEmail(email); setShowReset(true) }}
                  style={{ fontSize: 12, color: '#e63329', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px',
                borderRadius: 12,
                backgroundColor: loading ? '#8b1e1b' : '#e63329',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'var(--font-syne)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                marginTop: 4,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#e63329', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'rgba(240,237,232,0.55)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f0ede8',
  fontSize: 14,
  outline: 'none',
  colorScheme: 'dark',
  fontFamily: 'var(--font-dm-sans), sans-serif',
}
