'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface AdminListing {
  id: string
  title: string
  price: number
  price_unit: string
  active: boolean
  created_at: string
  slug: string
  provider: { name: string; email: string } | null
  category: { name: string } | null
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('listings')
      .select('id, title, price, price_unit, active, created_at, slug, provider:profiles(name, email), category:categories(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setListings((data as unknown as AdminListing[]) ?? []); setLoading(false) })
  }, [])

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('listings').update({ active: !current }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, active: !current } : l))
  }

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.provider?.name.toLowerCase().includes(search.toLowerCase()) ||
    l.category?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <Link href="/" style={{ color: 'rgba(240,237,232,0.4)', fontSize: 13, textDecoration: 'none' }}>← Back to site</Link>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#f0ede8' }}>Admin — Listings</h1>
          <nav style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {[{ href: '/admin/categories', label: 'Categories' }, { href: '/admin/media', label: 'Site Media' }, { href: '/admin/listings', label: 'Listings' }].map(n => (
              <Link key={n.href} href={n.href} style={{ padding: '6px 14px', borderRadius: 8, background: n.href === '/admin/listings' ? 'rgba(230,51,41,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${n.href === '/admin/listings' ? 'rgba(230,51,41,0.3)' : 'rgba(255,255,255,0.08)'}`, color: n.href === '/admin/listings' ? '#e63329' : 'rgba(240,237,232,0.6)', fontSize: 13, textDecoration: 'none' }}>{n.label}</Link>
            ))}
          </nav>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search listings, providers, categories..."
          style={{ width: '100%', maxWidth: 400, padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0ede8', fontSize: 13, outline: 'none', colorScheme: 'dark', marginBottom: 24 }}
        />

        {loading ? (
          <p style={{ color: 'rgba(240,237,232,0.4)' }}>Loading...</p>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto auto', gap: 12, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              {['Title', 'Provider', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,237,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {filtered.map((l, i) => (
              <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto auto', gap: 12, padding: '14px 18px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#f0ede8' }}>{l.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(240,237,232,0.3)' }}>{new Date(l.created_at).toLocaleDateString()}</p>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(240,237,232,0.6)' }}>{l.provider?.name ?? '—'}</p>
                <p style={{ fontSize: 13, color: 'rgba(240,237,232,0.6)' }}>{l.category?.name ?? '—'}</p>
                <p style={{ fontSize: 13, color: '#e63329', fontWeight: 600 }}>${l.price}/{l.price_unit}</p>
                <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, backgroundColor: l.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: l.active ? '#10b981' : '#ef4444' }}>
                  {l.active ? 'Active' : 'Hidden'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => toggleActive(l.id, l.active)}
                    style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', backgroundColor: l.active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${l.active ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, color: l.active ? '#ef4444' : '#10b981' }}
                  >
                    {l.active ? 'Hide' : 'Show'}
                  </button>
                  <Link href={`/services/${l.slug}`} target="_blank" style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.5)', textDecoration: 'none' }}>
                    View
                  </Link>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: '32px', color: 'rgba(240,237,232,0.3)', fontSize: 13, textAlign: 'center' }}>No listings found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
