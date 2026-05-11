'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/ImageUpload'
import type { SiteMedia } from '@/lib/types'

const MEDIA_KEYS = [
  { key: 'homepage_hero_bg', label: 'Homepage Hero Background' },
  { key: 'homepage_cta_bg', label: 'Homepage CTA Background' },
  { key: 'signin_side_panel', label: 'Sign In / Sign Up Side Panel' },
]

export default function AdminMediaPage() {
  const [media, setMedia] = useState<SiteMedia[]>([])
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_media').select('*').then(({ data }) => {
      setMedia(data ?? [])
      setLoading(false)
    })
  }, [])

  function getMedia(key: string) {
    return media.find(m => m.key === key)
  }

  async function updateMedia(key: string, url: string) {
    const supabase = createClient()
    const existing = getMedia(key)
    if (existing) {
      await supabase.from('site_media').update({ url }).eq('key', key)
    } else {
      await supabase.from('site_media').insert({ key, url })
    }
    setMedia(prev => {
      const next = prev.filter(m => m.key !== key)
      return [...next, { id: key, key, url, alt_text: null, updated_at: new Date().toISOString() }]
    })
    setEditingKey(null)
  }

  return (
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <Link href="/" style={{ color: 'rgba(240,237,232,0.4)', fontSize: 13, textDecoration: 'none' }}>← Back to site</Link>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#f0ede8' }}>Admin — Site Media</h1>
          <nav style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {[{ href: '/admin/categories', label: 'Categories' }, { href: '/admin/media', label: 'Site Media' }, { href: '/admin/listings', label: 'Listings' }].map(n => (
              <Link key={n.href} href={n.href} style={{ padding: '6px 14px', borderRadius: 8, background: n.href === '/admin/media' ? 'rgba(230,51,41,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${n.href === '/admin/media' ? 'rgba(230,51,41,0.3)' : 'rgba(255,255,255,0.08)'}`, color: n.href === '/admin/media' ? '#e63329' : 'rgba(240,237,232,0.6)', fontSize: 13, textDecoration: 'none' }}>{n.label}</Link>
            ))}
          </nav>
        </div>

        <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 14, marginBottom: 28 }}>
          Update site-wide images without touching code. Changes are live instantly.
        </p>

        {loading ? (
          <p style={{ color: 'rgba(240,237,232,0.4)' }}>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {MEDIA_KEYS.map(({ key, label }) => {
              const m = getMedia(key)
              return (
                <div key={key} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ position: 'relative', height: 180 }}>
                    {m?.url ? (
                      <Image src={m.url} alt={label} fill className="object-cover" sizes="320px" />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: 'rgba(240,237,232,0.25)', fontSize: 13 }}>No image set</p>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#f0ede8', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(240,237,232,0.3)', fontFamily: 'monospace', marginBottom: 14 }}>{key}</p>

                    {editingKey === key ? (
                      <div>
                        <ImageUpload
                          onUpload={urls => urls[0] && updateMedia(key, urls[0])}
                          bucket="site-media"
                          path={`site/${key}`}
                          maxFiles={1}
                          label="Upload new image"
                        />
                        <button onClick={() => setEditingKey(null)} style={{ marginTop: 8, width: '100%', padding: '7px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.5)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingKey(key)} style={{ width: '100%', padding: '9px', borderRadius: 10, backgroundColor: '#e63329', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        {m?.url ? 'Replace Image' : 'Upload Image'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
