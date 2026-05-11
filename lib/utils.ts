export function isValidNiuEmail(email: string): boolean {
  const lower = email.toLowerCase()
  return lower.endsWith('@students.niu.edu') || lower.endsWith('@niu.edu')
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function hashColor(name: string): string {
  const colors = [
    '#e63329', '#7c3aed', '#0ea5e9', '#10b981',
    '#f59e0b', '#ec4899', '#6366f1', '#14b8a6',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export const FALLBACK_CATEGORIES = [
  { slug: 'hair-beauty', name: 'Hair & Beauty', cover_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80' },
  { slug: 'nails-braiding', name: 'Nails & Braiding', cover_image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80' },
  { slug: 'barbering', name: 'Barbering', cover_image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80' },
  { slug: 'tutoring', name: 'Tutoring', cover_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80' },
  { slug: 'clothing-resale', name: 'Clothing & Resale', cover_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80' },
  { slug: 'rides', name: 'Rides', cover_image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80' },
  { slug: 'photography', name: 'Photography', cover_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
  { slug: 'graphic-design', name: 'Graphic Design', cover_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80' },
  { slug: 'tech-help', name: 'Tech Help', cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
  { slug: 'food-meals', name: 'Food & Meals', cover_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80' },
  { slug: 'fitness', name: 'Fitness', cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
  { slug: 'music-audio', name: 'Music & Audio', cover_image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80' },
]
