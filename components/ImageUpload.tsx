'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { uploadImage } from '@/lib/supabase/storage'

interface ImageUploadProps {
  onUpload: (urls: string[]) => void
  bucket: string
  path: string
  multiple?: boolean
  maxFiles?: number
  label?: string
  existingImages?: string[]
}

export default function ImageUpload({
  onUpload,
  bucket,
  path,
  multiple = false,
  maxFiles = 1,
  label = 'Upload Image',
  existingImages = [],
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files)
      if (arr.length + images.length > maxFiles) {
        setError(`Max ${maxFiles} image${maxFiles > 1 ? 's' : ''} allowed.`)
        return
      }

      const oversized = arr.find(f => f.size > 10 * 1024 * 1024)
      if (oversized) {
        setError('Max file size is 10 MB.')
        return
      }

      setError('')
      setUploading(true)
      setProgress(10)

      try {
        const urls: string[] = []
        for (let i = 0; i < arr.length; i++) {
          const url = await uploadImage(arr[i], bucket, path)
          urls.push(url)
          setProgress(10 + Math.round(((i + 1) / arr.length) * 85))
        }
        const next = [...images, ...urls]
        setImages(next)
        onUpload(next)
        setProgress(100)
        setTimeout(() => setProgress(0), 800)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setUploading(false)
      }
    },
    [images, bucket, path, maxFiles, onUpload]
  )

  function removeImage(url: string) {
    const next = images.filter(u => u !== url)
    setImages(next)
    onUpload(next)
  }

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(240,237,232,0.55)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>

      {/* Previews */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          {images.map(url => (
            <div
              key={url}
              style={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Image src={url} alt="Upload preview" fill className="object-cover" sizes="80px" />
              <button
                onClick={() => removeImage(url)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxFiles && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          style={{
            border: `2px dashed ${dragging ? '#e63329' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 14,
            padding: '32px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(230,51,41,0.05)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(240,237,232,0.3)" strokeWidth={1.5} style={{ margin: '0 auto 10px' }}>
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 13 }}>
            {uploading ? 'Uploading...' : 'Click or drag to upload'}
          </p>
          <p style={{ color: 'rgba(240,237,232,0.25)', fontSize: 11, marginTop: 4 }}>
            JPG, PNG, WEBP — max 10 MB
          </p>
        </div>
      )}

      {/* Progress */}
      {progress > 0 && (
        <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#e63329',
              borderRadius: 3,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {error && (
        <p style={{ color: '#ff6b6b', fontSize: 12, marginTop: 8 }}>{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  )
}
