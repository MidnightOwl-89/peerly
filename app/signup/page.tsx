'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isValidNiuEmail } from '@/lib/utils'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [wantsProvider, setWantsProvider] = useState(false)

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('type') === 'provider') setWantsProvider(true)
  }, [searchParams])

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.email) errs.email = 'Email is required.'
    else if (!isValidNiuEmail(form.email))
      errs.email = 'Peerly is only for NIU students. Use your @students.niu.edu or @niu.edu email.'
    if (!form.password) errs.password = 'Password is required.'
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters.'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, wants_provider: wantsProvider },
      },
    })

    if (error) {
      setErrors({ form: error.message })
      setLoading(false)
      return
    }

    setSuccess(true)
    // After email confirmation, user lands back and middleware sends to /onboarding
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: '48px 36px',
            textAlign: 'center',
          }}
        >
          {/* Animated check */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            style={{ margin: '0 auto 20px' }}
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#e63329"
              strokeWidth="2.5"
              strokeDasharray="175"
              strokeDashoffset="175"
              style={{ animation: 'circleDraw 0.6s ease forwards' }}
            />
            <polyline
              points="20,32 28,40 44,24"
              fill="none"
              stroke="#e63329"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="100"
              strokeDashoffset="100"
              style={{ animation: 'checkDraw 0.5s ease 0.5s forwards' }}
            />
          </svg>
          <h2
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 800,
              fontSize: 24,
              color: '#f0ede8',
              marginBottom: 10,
            }}
          >
            Check your email
          </h2>
          <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            We sent a confirmation link to <strong style={{ color: '#f0ede8' }}>{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link
            href="/signin"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: 12,
              backgroundColor: '#e63329',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
      {/* Left panel */}
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
            Earn money doing
            <br />
            what you&apos;re good at.
          </h2>
          <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 15, lineHeight: 1.6 }}>
            Join NIU students already making money and booking services on Peerly.
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
        <Link href="/" className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: '#e63329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</span>
          </div>
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: '#f0ede8' }}>
            Peer<span style={{ color: '#e63329' }}>ly</span>
          </span>
        </Link>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 28, color: '#f0ede8', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 14, marginBottom: 28 }}>
            NIU students only — .niu.edu email required
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {errors.form && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(230,51,41,0.1)', border: '1px solid rgba(230,51,41,0.25)', color: '#ff8080', fontSize: 13 }}>
                {errors.form}
              </div>
            )}

            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" placeholder="Jane Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ ...inputStyle, borderColor: errors.name ? '#e63329' : 'rgba(255,255,255,0.1)' }} />
              {errors.name && <p style={{ color: '#ff8080', fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
            </div>

            <div>
              <label style={labelStyle}>NIU Email</label>
              <input type="email" placeholder="jdoe@students.niu.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{ ...inputStyle, borderColor: errors.email ? '#e63329' : 'rgba(255,255,255,0.1)' }} />
              {errors.email && <p style={{ color: '#ff8080', fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ ...inputStyle, borderColor: errors.password ? '#e63329' : 'rgba(255,255,255,0.1)' }} />
              {errors.password && <p style={{ color: '#ff8080', fontSize: 11, marginTop: 4 }}>{errors.password}</p>}
            </div>

            {/* Role toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: "I'm looking for services", value: false },
                { label: "I want to offer services", value: true },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setWantsProvider(opt.value)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 12,
                    border: `1px solid ${wantsProvider === opt.value ? 'rgba(230,51,41,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: wantsProvider === opt.value ? 'rgba(230,51,41,0.1)' : 'rgba(255,255,255,0.03)',
                    color: wantsProvider === opt.value ? '#e63329' : 'rgba(240,237,232,0.6)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  {opt.label}
                </button>
              ))}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ color: '#e63329', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
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
