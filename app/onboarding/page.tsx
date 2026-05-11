'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import ImageUpload from '@/components/ImageUpload'
import Button from '@/components/Button'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [step, setStep] = useState(0)
  const [intent, setIntent] = useState<'find' | 'offer' | 'both' | null>(null)
  const [bio, setBio] = useState('')
  const [year, setYear] = useState('')
  const [major, setMajor] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [linkedin, setLinkedin] = useState('')
  const [instagram, setInstagram] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isProvider = intent === 'offer' || intent === 'both'

  // Steps: 0=intent, 1=profile (provider only), 2=social (provider only), 3=done
  const totalSteps = isProvider ? 4 : 2
  const stepLabels = isProvider
    ? ['Intent', 'Profile', 'Links', 'Done']
    : ['Intent', 'Done']

  function currentStepIndex() {
    if (!isProvider) return step === 0 ? 0 : 1
    return step
  }

  async function handleFinish() {
    if (!user) return
    setLoading(true)
    const supabase = createClient()
    const socialLinks: Record<string, string> = {}
    if (linkedin) socialLinks.linkedin = linkedin
    if (instagram) socialLinks.instagram = instagram
    if (portfolio) socialLinks.portfolio = portfolio

    const { error: err } = await supabase
      .from('profiles')
      .update({
        is_provider: isProvider,
        bio: bio || null,
        year: year || null,
        major: major || null,
        profile_image: profileImageUrl,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        onboarded: true,
      })
      .eq('id', user.id)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function skipToEnd() {
    if (!user) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ is_provider: false, onboarded: true }).eq('id', user.id)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0d0b0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 48 }}>
        {stepLabels.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: `2px solid ${i <= currentStepIndex() ? '#e63329' : 'rgba(255,255,255,0.15)'}`,
                  background: i < currentStepIndex() ? '#e63329' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: i < currentStepIndex() ? '#fff' : i === currentStepIndex() ? '#e63329' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s',
                }}
              >
                {i < currentStepIndex() ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : i + 1}
              </div>
              <span style={{ fontSize: 10, color: i === currentStepIndex() ? '#e63329' : 'rgba(255,255,255,0.3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div style={{ width: 32, height: 1, background: i < currentStepIndex() ? '#e63329' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s', marginBottom: 18 }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* ── Step 0: Intent ── */}
        {step === 0 && (
          <div className="animate-fade-up">
            <h1 style={headingStyle}>What brings you to Peerly?</h1>
            <p style={subStyle}>This helps us personalize your experience.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                { value: 'find' as const, icon: '🔍', label: 'Find services', desc: "I'm looking to book student services on campus." },
                { value: 'offer' as const, icon: '💼', label: 'Offer services', desc: "I want to list my skills and earn money." },
                { value: 'both' as const, icon: '⚡', label: 'Both', desc: "I want to book services and also offer my own." },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setIntent(opt.value)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 16,
                    border: `1px solid ${intent === opt.value ? 'rgba(230,51,41,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: intent === opt.value ? 'rgba(230,51,41,0.08)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: intent === opt.value ? '#e63329' : '#f0ede8', marginBottom: 2 }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(240,237,232,0.45)' }}>{opt.desc}</p>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${intent === opt.value ? '#e63329' : 'rgba(255,255,255,0.2)'}`,
                    background: intent === opt.value ? '#e63329' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {intent === opt.value && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => {
                if (!intent) return
                if (isProvider) setStep(1)
                else skipToEnd()
              }}
              disabled={!intent}
              variant="primary"
              size="lg"
              fullWidth
            >
              Continue
            </Button>
          </div>
        )}

        {/* ── Step 1: Provider profile ── */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h1 style={headingStyle}>Set up your provider profile</h1>
            <p style={subStyle}>Customers see this when they browse your listings.</p>

            {user && (
              <div style={{ marginBottom: 20 }}>
                <ImageUpload
                  onUpload={urls => setProfileImageUrl(urls[0] ?? null)}
                  bucket="profiles"
                  path={user.id}
                  label="Profile Photo"
                  maxFiles={1}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              <div>
                <label style={labelStyle}>Bio <span style={{ color: 'rgba(240,237,232,0.3)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell customers about yourself and your skills..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Major</label>
                  <input type="text" placeholder="e.g. Computer Science" value={major} onChange={e => setMajor(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <select value={year} onChange={e => setYear(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="">Select...</option>
                    {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button onClick={() => setStep(0)} variant="ghost" size="lg">Back</Button>
              <Button onClick={() => setStep(2)} variant="primary" size="lg" fullWidth>Continue</Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Social links ── */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h1 style={headingStyle}>Add your social links</h1>
            <p style={subStyle}>Help customers trust you by linking your profiles. All optional.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {[
                { icon: '🔗', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname', value: linkedin, set: setLinkedin },
                { icon: '📸', label: 'Instagram', placeholder: '@yourhandle', value: instagram, set: setInstagram },
                { icon: '🌐', label: 'Portfolio / Website', placeholder: 'yoursite.com', value: portfolio, set: setPortfolio },
              ].map(field => (
                <div key={field.label}>
                  <label style={labelStyle}>{field.icon} {field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button onClick={() => setStep(1)} variant="ghost" size="lg">Back</Button>
              <Button onClick={() => setStep(3)} variant="primary" size="lg" fullWidth>
                {linkedin || instagram || portfolio ? 'Continue' : 'Skip for now'}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3/1: Done ── */}
        {((isProvider && step === 3) || (!isProvider && step === 99)) && (
          <DoneStep
            isProvider={isProvider}
            name={profile?.name}
            loading={loading}
            error={error}
            onFinish={handleFinish}
          />
        )}

        {/* Non-provider done state (triggered by skipToEnd directly) */}
      </div>
    </div>
  )
}

function DoneStep({ isProvider, name, loading, error, onFinish }: {
  isProvider: boolean
  name?: string
  loading: boolean
  error: string
  onFinish: () => void
}) {
  return (
    <div className="animate-fade-up" style={{ textAlign: 'center' }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ margin: '0 auto 24px' }}>
        <circle cx="36" cy="36" r="32" fill="none" stroke="#e63329" strokeWidth="2.5"
          strokeDasharray="200" strokeDashoffset="200"
          style={{ animation: 'circleDraw 0.6s ease forwards' }} />
        <polyline points="22,36 31,45 50,27" fill="none" stroke="#e63329" strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" strokeDashoffset="100"
          style={{ animation: 'checkDraw 0.5s ease 0.5s forwards' }} />
      </svg>

      <h1 style={{ ...headingStyle, textAlign: 'center' }}>
        You&apos;re all set{name ? `, ${name.split(' ')[0]}` : ''}!
      </h1>
      <p style={{ ...subStyle, maxWidth: 360, margin: '0 auto 36px', textAlign: 'center' }}>
        {isProvider
          ? 'Your provider profile is ready. Create your first listing to start earning.'
          : 'Welcome to Peerly — your NIU campus marketplace.'}
      </p>

      {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {isProvider ? (
          <>
            <Button href="/services" variant="ghost" size="lg">Browse First</Button>
            <Button onClick={onFinish} disabled={loading} variant="primary" size="lg">
              {loading ? 'Setting up...' : 'Create My First Listing →'}
            </Button>
          </>
        ) : (
          <>
            <Button href="/services" variant="ghost" size="lg">Browse Services</Button>
            <Button onClick={onFinish} disabled={loading} variant="primary" size="lg">
              {loading ? 'Setting up...' : 'Go to Dashboard'}
            </Button>
          </>
        )}
      </div>

      {isProvider && (
        <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(240,237,232,0.3)' }}>
          You can also browse first and create your listing later from the dashboard.
        </p>
      )}
    </div>
  )
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-syne)',
  fontWeight: 800,
  fontSize: 'clamp(24px, 5vw, 32px)',
  color: '#f0ede8',
  letterSpacing: '-0.02em',
  marginBottom: 10,
}

const subStyle: React.CSSProperties = {
  color: 'rgba(240,237,232,0.45)',
  fontSize: 15,
  marginBottom: 32,
  lineHeight: 1.55,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'rgba(240,237,232,0.55)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f0ede8',
  fontSize: 14,
  outline: 'none',
  colorScheme: 'dark',
}
