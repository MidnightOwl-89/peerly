'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/ImageUpload'
import type { Category } from '@/lib/types'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .order('display_order')
      .then(({ data }) => { setCategories(data ?? []); setLoading(false) })
  }, [])

  async function updateCoverImage(id: string, url: string) {
    const supabase = createClient()
    await supabase.from('categories').update({ cover_image: url }).eq('id', id)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, cover_image: url } : c))
    setEditingId(null)
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('categories').update({ active: !current }).eq('id', id)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c))
  }

  return (
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <Link href="/" style={{ color: 'rgba(240,237,232,0.4)', fontSize: 13, textDecoration: 'none' }}>← Back to site</Link>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#f0ede8' }}>
            Admin — Categories
          </h1>
          <nav style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {[{ href: '/admin/categories', label: 'Categories' }, { href: '/admin/media', label: 'Site Media' }, { href: '/admin/listings', label: 'Listings' }].map(n => (
              <Link key={n.href} href={n.href} style={{ padding: '6px 14px', borderRadius: 8, background: n.href === '/admin/categories' ? 'rgba(230,51,41,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${n.href === '/admin/categories' ? 'rgba(230,51,41,0.3)' : 'rgba(255,255,255,0.08)'}`, color: n.href === '/admin/categories' ? '#e63329' : 'rgba(240,237,232,0.6)', fontSize: 13, textDecoration: 'none' }}>{n.label}</Link>
            ))}
          </nav>
        </div>

        {loading ? (
          <p style={{ color: 'rgba(240,237,232,0.4)' }}>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                {/* Cover image */}
                <div style={{ position: 'relative', height: 150 }}>
                  {cat.cover_image ? (
                    <Image src={cat.cover_image} alt={cat.name} fill className="object-cover" sizes="260px" />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a0a0a, #0a0a0f)' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                  <p style={{ position: 'absolute', bottom: 10, left: 12, fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{cat.name}</p>
                </div>

                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button
                      onClick={() => toggleActive(cat.id, cat.active)}
                      style={{ flex: 1, padding: '7px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', backgroundColor: cat.active ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${cat.active ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.1)'}`, color: cat.active ? '#10b981' : 'rgba(240,237,232,0.5)' }}
                    >
                      {cat.active ? 'Active' : 'Inactive'}
                    </button>
                    <Link href={`/services/${cat.slug}`} target="_blank" style={{ flex: 1, padding: '7px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.5)', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                      Preview
                    </Link>
                  </div>

                  {editingId === cat.id ? (
                    <div>
                      <ImageUpload
                        onUpload={urls => urls[0] && updateCoverImage(cat.id, urls[0])}
                        bucket="site-media"
                        path={`categories/${cat.slug}`}
                        maxFiles={1}
                        label="Replace cover image"
                      />
                      <button onClick={() => setEditingId(null)} style={{ marginTop: 8, width: '100%', padding: '7px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.5)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(cat.id)}
                      style={{ width: '100%', padding: '8px', borderRadius: 8, backgroundColor: '#e63329', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Replace Cover Photo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
