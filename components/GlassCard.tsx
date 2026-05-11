'use client'

import { use3DTilt } from '@/hooks/use3DTilt'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  tilt?: boolean
}

export default function GlassCard({
  children,
  className = '',
  style,
  tilt = false,
}: GlassCardProps) {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt()

  const base: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    transformStyle: 'preserve-3d',
  }

  return (
    <div
      ref={tilt ? ref : undefined}
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
      className={className}
      style={{ ...base, ...style }}
    >
      {children}
    </div>
  )
}
