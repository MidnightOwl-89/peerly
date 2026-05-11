import Image from 'next/image'
import { getInitials, hashColor } from '@/lib/utils'

interface ProviderAvatarProps {
  name: string
  imageUrl?: string | null
  size?: number
}

export default function ProviderAvatar({
  name,
  imageUrl,
  size = 40,
}: ProviderAvatarProps) {
  if (imageUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: hashColor(name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-syne), sans-serif',
        fontWeight: 800,
        fontSize: size * 0.35,
        color: '#fff',
        letterSpacing: '0.02em',
      }}
    >
      {getInitials(name)}
    </div>
  )
}
