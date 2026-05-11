'use client'

import { useRef, type MouseEvent } from 'react'

export function use3DTilt(intensity = 10) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const dx = (x / rect.width - 0.5) * intensity
    const dy = (y / rect.height - 0.5) * -intensity
    ref.current.style.transform = `perspective(1000px) rotateX(${dy}deg) rotateY(${dx}deg) translateZ(8px)`
    ref.current.style.boxShadow = '0 24px 48px rgba(0,0,0,0.4)'
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
    ref.current.style.boxShadow = ''
  }

  return { ref, handleMouseMove, handleMouseLeave }
}
