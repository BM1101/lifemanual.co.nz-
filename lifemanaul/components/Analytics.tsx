'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Lightweight Fathom Analytics integration
// Sign up at https://usefathom.com and add your site ID to .env

declare global {
  interface Window {
    fathom?: {
      trackPageview: () => void
      trackGoal: (id: string, cents: number) => void
    }
  }
}

export function Analytics() {
  const siteId = process.env.NEXT_PUBLIC_FATHOM_SITE_ID
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!siteId) return

    // Load Fathom script once
    const existing = document.getElementById('fathom-script')
    if (!existing) {
      const script = document.createElement('script')
      script.id = 'fathom-script'
      script.src = 'https://cdn.usefathom.com/script.js'
      script.setAttribute('data-site', siteId)
      script.setAttribute('data-spa', 'auto')
      script.defer = true
      document.head.appendChild(script)
    }
  }, [siteId])

  // Track page views on route change
  useEffect(() => {
    if (!siteId || !window.fathom) return
    window.fathom.trackPageview()
  }, [pathname, searchParams, siteId])

  return null
}
