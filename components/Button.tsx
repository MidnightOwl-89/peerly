'use client'

import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'secondary'
  href?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const styles = {
  primary: {
    backgroundColor: '#e63329',
    color: '#fff',
    border: 'none',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#f0ede8',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#f0ede8',
    border: '1px solid rgba(255,255,255,0.1)',
  },
}

const sizes = {
  sm: { padding: '8px 18px', fontSize: 13, borderRadius: 10 },
  md: { padding: '12px 26px', fontSize: 14, borderRadius: 12 },
  lg: { padding: '16px 36px', fontSize: 15, borderRadius: 14 },
}

export default function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  disabled,
  className = '',
  type = 'button',
  size = 'md',
  fullWidth = false,
}: ButtonProps) {
  const style: React.CSSProperties = {
    ...styles[variant],
    ...sizes[size],
    fontFamily: 'var(--font-dm-sans), sans-serif',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'opacity 0.2s ease, transform 0.15s ease, background-color 0.2s ease',
    width: fullWidth ? '100%' : undefined,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  }

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        style={style}
        onMouseEnter={e => {
          if (variant === 'primary') e.currentTarget.style.backgroundColor = '#ff4438'
          if (variant === 'ghost') e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          if (variant === 'primary') e.currentTarget.style.backgroundColor = '#e63329'
          if (variant === 'ghost') e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      onMouseEnter={e => {
        if (disabled) return
        if (variant === 'primary') e.currentTarget.style.backgroundColor = '#ff4438'
        if (variant === 'ghost') e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        if (variant === 'primary') e.currentTarget.style.backgroundColor = '#e63329'
        if (variant === 'ghost') e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {children}
    </button>
  )
}
