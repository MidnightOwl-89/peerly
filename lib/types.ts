export interface Profile {
  id: string
  name: string
  email: string
  profile_image: string | null
  bio: string | null
  major: string | null
  year: string | null
  is_provider: boolean
  onboarded: boolean
  role: 'user' | 'admin'
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  verification_note: string | null
  social_links: { linkedin?: string; instagram?: string; portfolio?: string } | null
  stripe_account_id: string | null
  stripe_payouts_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Package {
  id: string
  listing_id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number | null
  features: string[]
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string
  stripe_payment_intent_id: string
  amount: number
  type: 'deposit' | 'balance'
  status: 'pending' | 'captured' | 'refunded' | 'transferred'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'booking_request' | 'booking_confirmed' | 'new_message' | 'new_review' | 'payment_released' | 'dispute_filed'
  title: string
  body: string | null
  data: Record<string, string> | null
  read: boolean
  created_at: string
}

export interface Dispute {
  id: string
  booking_id: string
  filed_by: string
  reason: string
  description: string | null
  status: 'open' | 'resolved_buyer' | 'resolved_provider' | 'closed'
  admin_note: string | null
  resolved_at: string | null
  created_at: string
  booking?: Booking
  filer?: Profile
}

export interface Favorite {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listing?: Listing
}

export interface PromoCode {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  uses: number
  expires_at: string | null
  active: boolean
  created_at: string
}

export interface Category {
  id: string
  slug: string
  name: string
  cover_image: string | null
  description: string | null
  active: boolean
  display_order: number
}

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  price_unit: string
  images: string[]
  active: boolean
  provider_id: string
  category_id: string
  slug: string
  views: number
  deposit_percentage: number
  created_at: string
  updated_at: string
  provider?: Profile
  category?: Category
  reviews?: Review[]
  packages?: Package[]
}

export interface Booking {
  id: string
  listing_id: string
  buyer_id: string
  provider_id: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  date: string
  time: string
  duration: number
  notes: string | null
  total_price: number
  created_at: string
  listing?: Listing & { provider?: Profile }
  buyer?: Profile
  provider?: Profile
}

export interface Review {
  id: string
  listing_id: string
  booking_id: string
  author_id: string
  rating: number
  text: string
  images: string[]
  created_at: string
  author?: Profile
}

export interface Message {
  id: string
  booking_id: string
  sender_id: string
  text: string
  sent_at: string
  sender?: Profile
}

export interface SiteMedia {
  id: string
  key: string
  url: string
  alt_text: string | null
  updated_at: string
}
