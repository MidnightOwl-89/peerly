'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ImageUpload from '@/components/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { generateSlug } from '@/lib/utils'
import { FALLBACK_CATEGORIES } from '@/lib/utils'
import Link from 'next/link'

export default function NewListingPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [priceUnit, setPriceUnit] = useState('hr')
  const [categorySlug, setCategorySlug] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title || !description || !price || !categorySlug) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setLoading(true)

    const supabase = createClient()

    // Get category id from slug
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    const slug = generateSlug(title) + '-' + Date.now().toString(36)

    const { error: err } = await supabase.from('listings').insert({
      title,
      description,
      price: parseFloat(price),
      price_unit: priceUnit,
      category_id: cat?.id ?? null,
      provider_id: user.id,
      images,
      slug,
      active: true,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push('/dashboard?tab=listings')
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
          <Link
            href="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(240,237,232,0.45)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Dashboard
          </Link>

          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 28, color: '#f0ede8', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Create a Listing
          </h1>
          <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 14, marginBottom: 36 }}>
            Let NIU students know what you offer.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(230,51,41,0.1)', border: '1px solid rgba(230,51,41,0.25)', color: '#ff8080', fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label style={labelStyle}>Service Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Professional Portrait Photography"
                required
                style={inputStyle}
              />
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category *</label>
              <select
                value={categorySlug}
                onChange={e => setCategorySlug(e.target.value)}
                required
                style={{ ...inputStyle, appearance: 'none' }}
              >
                <option value="">Select a category...</option>
                {FALLBACK_CATEGORIES.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
              <div>
                <label style={labelStyle}>Price *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,237,232,0.4)', fontSize: 14 }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="25"
                    required
                    style={{ ...inputStyle, paddingLeft: 28 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Per</label>
                <select value={priceUnit} onChange={e => setPriceUnit(e.target.value)} style={{ ...inputStyle, width: 110, appearance: 'none' }}>
                  <option value="hr">hour</option>
                  <option value="session">session</option>
                  <option value="flat">flat</option>
                  <option value="item">item</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what you offer, your experience, what clients can expect..."
                rows={5}
                required
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.6 }}
              />
            </div>

            {/* Photos */}
            {user && (
              <ImageUpload
                onUpload={setImages}
                bucket="listings"
                path={`${user.id}/listings`}
                multiple
                maxFiles={8}
                label="Listing Photos (up to 8)"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '15px',
                borderRadius: 14,
                backgroundColor: loading ? '#8b1e1b' : '#e63329',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'var(--font-syne)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  color: 'rgba(240,237,232,0.45)',
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
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
}
