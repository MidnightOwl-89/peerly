'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProviderAvatar from './ProviderAvatar'
import StarRating from './StarRating'

interface BookingWidgetProps {
  listing: {
    id: string
    title: string
    price: number
    price_unit: string
    slug: string
    provider_id: string
    category_slug?: string
  }
  provider: {
    id: string
    name: string
    profile_image: string | null
    rating?: number
    reviewCount?: number
  }
  currentUserId?: string | null
}

const TIME_SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM']
const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr', value: 120 },
]

export default function BookingWidget({ listing, provider, currentUserId }: BookingWidgetProps) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isGuest = !currentUserId
  const isOwner = currentUserId === listing.provider_id
  const total = (listing.price * duration) / 60

  async function handleBook() {
    if (!date || !time) {
      setError('Please select a date and time.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: bookErr } = await supabase.from('bookings').insert({
        listing_id: listing.id,
        buyer_id: currentUserId,
        provider_id: listing.provider_id,
        date,
        time,
        duration,
        notes: notes || null,
        total_price: total,
        status: 'pending',
      })
      if (bookErr) throw bookErr
      router.push('/booking/confirmed')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (isOwner) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '24px',
        }}
      >
        <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: 14, marginBottom: 16 }}>
          This is your listing.
        </p>
        <Link
          href={`/dashboard/listings/edit/${listing.slug}`}
          style={{
            display: 'block',
            width: '100%',
            padding: '13px',
            borderRadius: 12,
            backgroundColor: '#e63329',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          Edit Listing
        </Link>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '24px',
        position: 'sticky',
        top: 90,
      }}
    >
      {/* Price */}
      <div style={{ marginBottom: 20 }}>
        <span
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontWeight: 800,
            fontSize: 32,
            color: '#e63329',
          }}
        >
          ${listing.price.toFixed(0)}
        </span>
        <span style={{ color: 'rgba(240,237,232,0.45)', fontSize: 14, marginLeft: 4 }}>
          /{listing.price_unit}
        </span>
      </div>

      {isGuest ? (
        <>
          <p style={{ color: 'rgba(240,237,232,0.55)', fontSize: 13, marginBottom: 16 }}>
            Sign in to book this service.
          </p>
          <Link
            href={`/signin?redirect=/services/${listing.category_slug ?? ''}/${listing.slug}`}
            style={{
              display: 'block',
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              backgroundColor: '#e63329',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Sign in to Book
          </Link>
        </>
      ) : (
        <>
          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Select Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Time slots */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Select Time</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {TIME_SLOTS.map(t => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: time === t ? '#e63329' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${time === t ? '#e63329' : 'rgba(255,255,255,0.1)'}`,
                    color: time === t ? '#fff' : 'rgba(240,237,232,0.7)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Duration</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: duration === d.value ? '#e63329' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${duration === d.value ? '#e63329' : 'rgba(255,255,255,0.1)'}`,
                    color: duration === d.value ? '#fff' : 'rgba(240,237,232,0.7)',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Tell the provider what you need..."
              rows={3}
              style={{ ...inputStyle, resize: 'none', fontFamily: 'var(--font-dm-sans), sans-serif' }}
            />
          </div>

          {/* Total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              marginBottom: 14,
            }}
          >
            <span style={{ color: 'rgba(240,237,232,0.6)', fontSize: 14 }}>Total</span>
            <span
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 800,
                fontSize: 18,
                color: '#e63329',
              }}
            >
              ${total.toFixed(2)}
            </span>
          </div>

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 10 }}>{error}</p>
          )}

          <button
            onClick={handleBook}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              backgroundColor: loading ? '#8b1e1b' : '#e63329',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-syne), sans-serif',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Booking...' : `Book Now — $${total.toFixed(2)}`}
          </button>
        </>
      )}

      {/* Provider info */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <ProviderAvatar name={provider.name} imageUrl={provider.profile_image} size={38} />
        <div style={{ flex: 1 }}>
          <p style={{ color: '#f0ede8', fontSize: 13, fontWeight: 600 }}>{provider.name}</p>
          {provider.rating !== undefined && (
            <StarRating rating={provider.rating} count={provider.reviewCount} size="sm" />
          )}
        </div>
        <Link
          href={`/dashboard?message=${provider.id}`}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#f0ede8',
            fontSize: 12,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Message
        </Link>
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
  padding: '10px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f0ede8',
  fontSize: 13,
  outline: 'none',
  colorScheme: 'dark',
}
