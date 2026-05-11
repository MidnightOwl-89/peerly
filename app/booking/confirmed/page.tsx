'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/lib/types'

const CONFETTI_COLORS = ['#e63329', '#f0ede8', '#ff9966', '#fff', '#ffcc00']

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  const left = `${(index * 7.3) % 100}%`
  const delay = `${(index * 0.18) % 3}s`
  const duration = `${2.5 + (index % 4) * 0.5}s`
  const size = 6 + (index % 5) * 2
  const isCircle = index % 3 === 0

  return (
    <div
      style={{
        position: 'fixed',
        top: '-20px',
        left,
        width: size,
        height: isCircle ? size : size * 0.6,
        borderRadius: isCircle ? '50%' : 2,
        backgroundColor: color,
        animation: `confettiFall ${duration} ease ${delay} forwards, confettiSway ${duration} ease ${delay} infinite`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

export default function BookingConfirmedPage() {
  const { user } = useAuth()
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('bookings')
      .select('*, listing:listings(title, provider:profiles(id, name))')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setBooking(data))
  }, [user])

  const provider = (booking?.listing as { provider?: { id: string; name: string } } | null)?.provider

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* CSS confetti */}
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 520, textAlign: 'center' }}>
        {/* Animated checkmark */}
        <div style={{ marginBottom: 28 }}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ margin: '0 auto' }}>
            <circle
              cx="44" cy="44" r="40"
              fill="none"
              stroke="#e63329"
              strokeWidth="3"
              strokeDasharray="250"
              strokeDashoffset="250"
              style={{ animation: 'circleDraw 0.7s ease forwards' }}
            />
            <polyline
              points="27,44 38,55 61,32"
              fill="none"
              stroke="#e63329"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="100"
              strokeDashoffset="100"
              style={{ animation: 'checkDraw 0.6s ease 0.6s forwards' }}
            />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: 'clamp(28px, 5vw, 42px)',
            color: '#f0ede8',
            letterSpacing: '-0.02em',
            marginBottom: 10,
          }}
        >
          You&apos;re booked!
        </h1>
        <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: 15, marginBottom: 36 }}>
          Your booking request has been sent. The provider will confirm shortly.
        </p>

        {/* Booking details card */}
        {booking && (
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '24px',
              marginBottom: 32,
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Service', value: (booking.listing as { title?: string } | null)?.title ?? '—' },
                { label: 'Provider', value: provider?.name ?? '—' },
                { label: 'Date', value: booking.date ? new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '—' },
                { label: 'Time', value: booking.time ?? '—' },
                { label: 'Duration', value: booking.duration ? `${booking.duration} min` : '—' },
                { label: 'Total', value: `$${booking.total_price?.toFixed(2)}`, accent: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(240,237,232,0.45)', fontSize: 13 }}>{row.label}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: row.accent ? 700 : 500,
                      color: row.accent ? '#e63329' : '#f0ede8',
                      fontFamily: row.accent ? 'var(--font-syne)' : 'inherit',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              padding: '13px 28px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#f0ede8',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
          {provider && (
            <Link
              href="/dashboard"
              style={{
                padding: '13px 28px',
                borderRadius: 12,
                backgroundColor: '#e63329',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Message {provider.name.split(' ')[0]}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
