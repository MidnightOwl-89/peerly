'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
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
          background: '#080810',
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
                <span style={{ fontSize: 12, color: '#e63329', cursor: 'pointer' }}>
                  Forgot password?
                </span>
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
