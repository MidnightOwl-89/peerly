'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Listing } from '@/lib/types'
import Link from 'next/link'

const TIME_SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM']
const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr', value: 120 },
]

export default function BookPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [listing, setListing] = useState<Listing | null>(null)
  const [date, setDate] = useState(() => sessionStorage.getItem(`book_date_${slug}`) ?? '')
  const [time, setTime] = useState(() => sessionStorage.getItem(`book_time_${slug}`) ?? '')
  const [duration, setDuration] = useState(() => Number(sessionStorage.getItem(`book_dur_${slug}`)) || 60)
  const [notes, setNotes] = useState(() => sessionStorage.getItem(`book_notes_${slug}`) ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Persist booking state for session recovery
  useEffect(() => {
    if (date) sessionStorage.setItem(`book_date_${slug}`, date)
    if (time) sessionStorage.setItem(`book_time_${slug}`, time)
    sessionStorage.setItem(`book_dur_${slug}`, String(duration))
    if (notes) sessionStorage.setItem(`book_notes_${slug}`, notes)
  }, [date, time, duration, notes, slug])

  useEffect(() => {
    if (!slug) return
    const supabase = createClient()
    supabase
      .from('listings')
      .select('*, provider:profiles(id, name, profile_image)')
      .eq('slug', slug)
      .single()
      .then(({ data }) => setListing(data))
  }, [slug])

  async function handleConfirm() {
    if (!listing || !user) return
    if (!date || !time) { setError('Please select a date and time.'); return }

    if (user.id === listing.provider_id) {
      setError("You can't book your own service.")
      return
    }

    setError('')
    setSubmitting(true)
    const total = (listing.price * duration) / 60
    const supabase = createClient()

    const { error: err } = await supabase.from('bookings').insert({
      listing_id: listing.id,
      buyer_id: user.id,
      provider_id: listing.provider_id,
      date,
      time,
      duration,
      notes: notes || null,
      total_price: total,
      status: 'pending',
    })

    if (err) { setError(err.message); setSubmitting(false); return }

    // Clean up session storage
    ;['date', 'time', 'dur', 'notes'].forEach(k =>
      sessionStorage.removeItem(`book_${k}_${slug}`)
    )

    router.push('/booking/confirmed')
  }

  if (isLoading || !listing) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', paddingTop: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#e63329' }} className="animate-spin-slow" />
        </main>
      </>
    )
  }

  const total = (listing.price * duration) / 60
  const provider = listing.provider as { name: string } | null

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
          <Link
            href={`/services`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(240,237,232,0.45)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </Link>

          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 28, color: '#f0ede8', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Confirm Booking
          </h1>
          <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 14, marginBottom: 32 }}>
            {listing.title} with {provider?.name}
          </p>

          {/* Summary card */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: 'rgba(240,237,232,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
              Booking Details
            </h2>

            {/* Date */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Date</label>
              <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} style={inputStyle} />
            </div>

            {/* Time */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Time</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setTime(t)} style={{ padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: time === t ? '#e63329' : 'rgba(255,255,255,0.05)', border: `1px solid ${time === t ? '#e63329' : 'rgba(255,255,255,0.1)'}`, color: time === t ? '#fff' : 'rgba(240,237,232,0.7)' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Duration</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {DURATIONS.map(d => (
                  <button key={d.value} onClick={() => setDuration(d.value)} style={{ padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: duration === d.value ? '#e63329' : 'rgba(255,255,255,0.05)', border: `1px solid ${duration === d.value ? '#e63329' : 'rgba(255,255,255,0.1)'}`, color: duration === d.value ? '#fff' : 'rgba(240,237,232,0.7)' }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything the provider should know..." rows={3} style={{ ...inputStyle, resize: 'none', fontFamily: 'var(--font-dm-sans)' }} />
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: 'rgba(240,237,232,0.5)', fontSize: 14 }}>
                ${listing.price}/{listing.price_unit} × {duration / 60} hr
              </span>
              <span style={{ color: '#f0ede8', fontWeight: 500 }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#f0ede8' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#e63329' }}>${total.toFixed(2)}</span>
            </div>
            <p style={{ color: 'rgba(240,237,232,0.3)', fontSize: 11, marginTop: 10, textAlign: 'center' }}>
              Payment held until service is complete
            </p>
          </div>

          {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{ width: '100%', padding: '16px', borderRadius: 14, backgroundColor: submitting ? '#8b1e1b' : '#e63329', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-syne)', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {submitting ? 'Confirming...' : `Confirm & Pay — $${total.toFixed(2)}`}
          </button>
        </div>
      </main>
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 500,
  color: 'rgba(240,237,232,0.45)', marginBottom: 8,
  textTransform: 'uppercase', letterSpacing: '0.08em',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#f0ede8', fontSize: 14, outline: 'none', colorScheme: 'dark',
}
