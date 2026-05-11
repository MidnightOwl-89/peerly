interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

const starSizes = { sm: 12, md: 15, lg: 18 }

export default function StarRating({
  rating,
  count,
  size = 'md',
  showCount = true,
}: StarRatingProps) {
  const px = starSizes[size]
  const fontSize = { sm: 11, md: 13, lg: 15 }[size]
  const filled = Math.round(rating)

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill={i < filled ? '#f59e0b' : 'none'}
            stroke={i < filled ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
            strokeWidth={2}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </span>
      <span
        style={{
          fontSize,
          color: '#f0ede8',
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span
          style={{
            fontSize,
            color: 'rgba(240,237,232,0.45)',
            lineHeight: 1,
          }}
        >
          ({count})
        </span>
      )}
    </span>
  )
}
