'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import ProviderAvatar from '@/components/ProviderAvatar'
import StarRating from '@/components/StarRating'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { Booking, Message } from '@/lib/types'

type Tab = 'overview' | 'listings' | 'bookings' | 'messages' | 'settings'

export default function DashboardPage() {
  const { user, profile, isProvider, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('overview')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradingToProvider, setUpgradingToProvider] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgrade') === 'true') {
      setShowUpgrade(true)
    }
    const msgId = searchParams.get('message')
    if (msgId) setTab('messages')
  }, [searchParams])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    // Fetch bookings (as buyer or provider)
    supabase
      .from('bookings')
      .select('*, listing:listings(title, provider:profiles(name, profile_image)), buyer:profiles!bookings_buyer_id_fkey(name, profile_image)')
      .or(`buyer_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => setBookings(data ?? []))

    // Fetch listings (if provider)
    if (isProvider) {
      supabase
        .from('listings')
        .select('*, reviews(rating)')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setListings(data ?? []))
    }

    // Fetch conversations (unique bookings with messages)
    supabase
      .from('bookings')
      .select('id, listing:listings(title), buyer:profiles!bookings_buyer_id_fkey(id, name, profile_image), provider:profiles!bookings_provider_id_fkey(id, name, profile_image)')
      .or(`buyer_id.eq.${user.id},provider_id.eq.${user.id}`)
      .then(({ data }) => setConversations(data ?? []))
  }, [user, isProvider])

  useEffect(() => {
    if (!activeConvId) return
    const supabase = createClient()
    supabase
      .from('messages')
      .select('*, sender:profiles(name, profile_image)')
      .eq('booking_id', activeConvId)
      .order('sent_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))

    const sub = supabase
      .channel(`messages:${activeConvId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${activeConvId}` }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [activeConvId])

  async function sendMessage() {
    if (!newMsg.trim() || !activeConvId || !user) return
    const supabase = createClient()
    await supabase.from('messages').insert({ booking_id: activeConvId, sender_id: user.id, text: newMsg.trim() })
    setNewMsg('')
  }

  async function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled') {
    const supabase = createClient()
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  async function toggleListingActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('listings').update({ active: !current }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, active: !current } : l))
  }

  async function enableProviderMode() {
    if (!user) return
    setUpgradingToProvider(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ is_provider: true }).eq('id', user.id)
    setShowUpgrade(false)
    setUpgradingToProvider(false)
    window.location.reload()
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#e63329' }} className="animate-spin-slow" />
        </main>
      </>
    )
  }

  const providerTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id: 'listings', label: 'My Listings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { id: 'bookings', label: 'Bookings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id: 'messages', label: 'Messages', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: 'settings', label: 'Settings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
  ]

  const buyerTabs: { id: Tab; label: string }[] = [
    { id: 'bookings', label: 'My Bookings' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Profile Settings' },
  ]

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const completedCount = bookings.filter(b => b.status === 'completed').length
  const earned = bookings.filter(b => b.status === 'completed' && b.provider_id === user?.id).reduce((s, b) => s + b.total_price, 0)

  return (
    <>
      <Navbar />

      {/* Upgrade modal */}
      {showUpgrade && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '36px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(230,51,41,0.12)', border: '1px solid rgba(230,51,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e63329" strokeWidth={2}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 22, color: '#f0ede8', marginBottom: 10 }}>Become a Provider</h2>
            <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              Enable provider mode to list your skills and start earning from NIU students on Peerly.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowUpgrade(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#f0ede8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={enableProviderMode} disabled={upgradingToProvider} style={{ flex: 2, padding: '12px', borderRadius: 12, backgroundColor: '#e63329', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-syne)', border: 'none', cursor: upgradingToProvider ? 'not-allowed' : 'pointer' }}>
                {upgradingToProvider ? 'Enabling...' : 'Enable Provider Mode'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f', paddingTop: 68 }}>
        {/* Sidebar */}
        <aside
          className="hidden md:flex"
          style={{
            width: 220,
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: '32px 16px',
            position: 'sticky',
            top: 68,
            height: 'calc(100vh - 68px)',
            overflowY: 'auto',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ padding: '12px 12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ProviderAvatar name={profile?.name ?? 'U'} imageUrl={profile?.profile_image} size={36} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#f0ede8', lineHeight: 1.2 }}>{profile?.name?.split(' ')[0] ?? 'User'}</p>
                <p style={{ fontSize: 11, color: isProvider ? '#e63329' : 'rgba(240,237,232,0.4)' }}>{isProvider ? 'Provider' : 'Buyer'}</p>
              </div>
            </div>
          </div>

          {(isProvider ? providerTabs : buyerTabs).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: tab === t.id ? 'rgba(230,51,41,0.1)' : 'transparent',
                color: tab === t.id ? '#e63329' : 'rgba(240,237,232,0.55)',
                fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              {'icon' in t && t.icon}
              {t.label}
            </button>
          ))}

          {!isProvider && (
            <button
              onClick={() => setShowUpgrade(true)}
              style={{ marginTop: 'auto', padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(230,51,41,0.1)', border: '1px solid rgba(230,51,41,0.2)', color: '#e63329', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
            >
              + Become a Provider
            </button>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 28px', maxWidth: 1000 }}>
          {/* Overview tab */}
          {tab === 'overview' && isProvider && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 26, color: '#f0ede8', marginBottom: 6 }}>
                Welcome back, {profile?.name?.split(' ')[0] ?? 'there'}
              </h1>
              <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 14, marginBottom: 32 }}>Here&apos;s what&apos;s happening with your services.</p>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
                {[
                  { label: 'Earned This Month', value: `$${earned.toFixed(0)}` },
                  { label: 'Bookings Completed', value: completedCount },
                  { label: 'Pending Requests', value: pendingCount },
                  { label: 'Active Listings', value: listings.filter(l => l.active).length },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
                    <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{stat.label}</p>
                    <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 28, color: '#f0ede8' }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming bookings */}
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#f0ede8', marginBottom: 16 }}>Upcoming Bookings</h2>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 36 }}>
                {bookings.filter(b => b.status !== 'cancelled').slice(0, 5).map((b, i) => {
                  const buyer = b.buyer as { name: string; profile_image: string | null } | null
                  return (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <ProviderAvatar name={buyer?.name ?? 'U'} imageUrl={buyer?.profile_image} size={32} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#f0ede8' }}>{buyer?.name ?? 'Student'}</p>
                        <p style={{ fontSize: 11, color: 'rgba(240,237,232,0.4)' }}>{(b.listing as { title?: string } | null)?.title}</p>
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(240,237,232,0.4)' }}>{b.date}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  )
                })}
                {bookings.length === 0 && (
                  <p style={{ padding: '24px', color: 'rgba(240,237,232,0.3)', fontSize: 13, textAlign: 'center' }}>No bookings yet.</p>
                )}
              </div>

              {/* Active listings mini grid */}
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#f0ede8', marginBottom: 16 }}>My Active Listings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {listings.filter(l => l.active).slice(0, 4).map(l => (
                  <Link key={l.id} href={`/dashboard/listings/edit/${l.slug}`} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textDecoration: 'none' }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#f0ede8', marginBottom: 6 }}>{l.title}</p>
                    <p style={{ color: '#e63329', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16 }}>${l.price}/{l.price_unit}</p>
                    <p style={{ color: 'rgba(240,237,232,0.35)', fontSize: 11, marginTop: 4 }}>{l.views} views</p>
                  </Link>
                ))}
                <Link href="/dashboard/listings/new" style={{ padding: '16px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(240,237,232,0.35)', fontSize: 13 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e63329" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Listing
                </Link>
              </div>
            </div>
          )}

          {/* Listings tab */}
          {tab === 'listings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#f0ede8' }}>My Listings</h1>
                <Link href="/dashboard/listings/new" style={{ padding: '10px 20px', borderRadius: 10, backgroundColor: '#e63329', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  + New Listing
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
                {listings.map(l => {
                  const revs = (l.reviews ?? []) as { rating: number }[]
                  const avg = revs.length ? revs.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / revs.length : null
                  return (
                    <div key={l.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                      <div style={{ height: 140, background: 'linear-gradient(135deg, rgba(230,51,41,0.1), #0a0a0f)', position: 'relative' }}>
                        {l.images?.[0] && <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                          <button
                            onClick={() => toggleListingActive(l.id, l.active)}
                            style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', backgroundColor: l.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)', border: `1px solid ${l.active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.12)'}`, color: l.active ? '#10b981' : 'rgba(240,237,232,0.5)' }}
                          >
                            {l.active ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding: '14px' }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#f0ede8', marginBottom: 4 }}>{l.title}</p>
                        {avg && <StarRating rating={avg} count={revs.length} size="sm" />}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                          <span style={{ color: '#e63329', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16 }}>${l.price}/{l.price_unit}</span>
                          <Link href={`/dashboard/listings/edit/${l.slug}`} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', color: '#f0ede8', fontSize: 12, textDecoration: 'none' }}>Edit</Link>
                        </div>
                        <p style={{ color: 'rgba(240,237,232,0.3)', fontSize: 11, marginTop: 6 }}>{l.views} views</p>
                      </div>
                    </div>
                  )
                })}
                <Link href="/dashboard/listings/new" style={{ border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 20px', textDecoration: 'none', color: 'rgba(240,237,232,0.35)', fontSize: 13, minHeight: 200 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e63329" strokeWidth={1.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New Listing
                </Link>
              </div>
            </div>
          )}

          {/* Bookings tab */}
          {tab === 'bookings' && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#f0ede8', marginBottom: 24 }}>Bookings</h1>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                {bookings.map((b, i) => {
                  const buyer = b.buyer as { name: string; profile_image: string | null } | null
                  const isIncoming = b.provider_id === user?.id
                  return (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < bookings.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', flexWrap: 'wrap' }}>
                      <ProviderAvatar name={buyer?.name ?? 'U'} imageUrl={buyer?.profile_image} size={34} />
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#f0ede8' }}>{buyer?.name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(240,237,232,0.4)' }}>{(b.listing as { title?: string } | null)?.title}</p>
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(240,237,232,0.4)' }}>{b.date} · {b.time}</p>
                      <span style={{ color: '#e63329', fontWeight: 700, fontSize: 14 }}>${b.total_price}</span>
                      <StatusBadge status={b.status} />
                      {isIncoming && b.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => updateBookingStatus(b.id, 'confirmed')} style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Accept</button>
                          <button onClick={() => updateBookingStatus(b.id, 'cancelled')} style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Decline</button>
                        </div>
                      )}
                    </div>
                  )
                })}
                {bookings.length === 0 && (
                  <p style={{ padding: '32px', color: 'rgba(240,237,232,0.3)', fontSize: 13, textAlign: 'center' }}>No bookings yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Messages tab */}
          {tab === 'messages' && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#f0ede8', marginBottom: 24 }}>Messages</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, height: 520 }}>
                {/* Conversation list */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'auto' }}>
                  {conversations.map(conv => {
                    const other = conv.buyer?.id === user?.id ? conv.provider : conv.buyer
                    return (
                      <button key={conv.id} onClick={() => setActiveConvId(conv.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', border: 'none', background: activeConvId === conv.id ? 'rgba(230,51,41,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <ProviderAvatar name={other?.name ?? 'U'} imageUrl={other?.profile_image} size={34} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#f0ede8' }}>{other?.name}</p>
                          <p style={{ fontSize: 11, color: 'rgba(240,237,232,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.listing?.title}</p>
                        </div>
                      </button>
                    )
                  })}
                  {conversations.length === 0 && (
                    <p style={{ padding: '24px', color: 'rgba(240,237,232,0.3)', fontSize: 13, textAlign: 'center' }}>No conversations yet.</p>
                  )}
                </div>

                {/* Chat */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, display: 'flex', flexDirection: 'column' }}>
                  {activeConvId ? (
                    <>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {messages.map(m => (
                          <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === user?.id ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: 14, backgroundColor: m.sender_id === user?.id ? '#e63329' : 'rgba(255,255,255,0.07)', color: '#f0ede8', fontSize: 13 }}>
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
                        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0ede8', fontSize: 13, outline: 'none' }} />
                        <button onClick={sendMessage} style={{ padding: '10px 18px', borderRadius: 10, backgroundColor: '#e63329', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Send</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: 'rgba(240,237,232,0.25)', fontSize: 14 }}>Select a conversation</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings tab */}
          {tab === 'settings' && (
            <SettingsTab user={user} profile={profile} />
          )}

          {/* Buyer overview (non-provider) */}
          {tab === 'overview' && !isProvider && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 26, color: '#f0ede8', marginBottom: 6 }}>
                Welcome back, {profile?.name?.split(' ')[0] ?? 'there'}
              </h1>
              <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 14, marginBottom: 28 }}>
                Manage your bookings and messages.
              </p>
              {/* Become provider CTA */}
              <div style={{ background: 'rgba(230,51,41,0.07)', border: '1px solid rgba(230,51,41,0.2)', borderRadius: 16, padding: '24px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#f0ede8', marginBottom: 4 }}>Ready to earn on campus?</p>
                  <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: 13 }}>Enable provider mode to list your skills and get paid.</p>
                </div>
                <button onClick={() => setShowUpgrade(true)} style={{ padding: '10px 22px', borderRadius: 10, backgroundColor: '#e63329', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Become a Provider
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: 'rgba(10,10,15,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '8px 0 env(safe-area-inset-bottom, 8px)',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {(isProvider ? providerTabs : buyerTabs).slice(0, 5).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: tab === t.id ? '#e63329' : 'rgba(240,237,232,0.4)',
              fontSize: 10,
              fontWeight: tab === t.id ? 600 : 400,
            }}
          >
            {'icon' in t && t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Pending' },
    confirmed: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Confirmed' },
    completed: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', label: 'Completed' },
    cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', label: 'Cancelled' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function SettingsTab({ user, profile }: { user: any; profile: any }) {
  const [name, setName] = useState(profile?.name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [major, setMajor] = useState(profile?.major ?? '')
  const [year, setYear] = useState(profile?.year ?? '')
  const [saved, setSaved] = useState(false)

  async function save() {
    if (!user) return
    const supabase = createClient()
    await supabase.from('profiles').update({ name, bio, major, year }).eq('id', user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#f0ede8', marginBottom: 28 }}>Profile Settings</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label style={lbl}>Full Name</label><input value={name} onChange={e => setName(e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...inp, resize: 'none', fontFamily: 'var(--font-dm-sans)' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={lbl}>Major</label><input value={major} onChange={e => setMajor(e.target.value)} style={inp} /></div>
          <div>
            <label style={lbl}>Year</label>
            <select value={year} onChange={e => setYear(e.target.value)} style={{ ...inp, appearance: 'none' }}>
              <option value="">Select...</option>
              {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button onClick={save} style={{ padding: '13px', borderRadius: 12, backgroundColor: saved ? '#10b981' : '#e63329', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-syne)', border: 'none', cursor: 'pointer', transition: 'background 0.3s' }}>
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(240,237,232,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }
const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0ede8', fontSize: 14, outline: 'none', colorScheme: 'dark' }
