'use client'

// Supabase Auth does not require a root provider.
// Keep this file for future global context additions (toasts, theme, etc.).
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
