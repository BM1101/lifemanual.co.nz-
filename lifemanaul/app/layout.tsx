import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Life Manual — the guide school never gave you',
    template: '%s | Life Manual',
  },
  description:
    'Practical, plain-English guides for every stage of life — from your first bank account to planning your retirement.',
  openGraph: {
    siteName: 'Life Manual',
    locale: 'en_NZ',
    type: 'website',
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lifemanual.co.nz'
  ),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function SiteHeader() {
  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="text-[17px] font-medium tracking-tight">
          Life<span className="text-brand-600">Manual</span>
        </a>
        <nav className="hidden sm:flex items-center gap-6">
          <a href="/stage/mid-teens"   className="text-sm text-gray-500 hover:text-gray-900">Stages</a>
          <a href="/#topics"           className="text-sm text-gray-500 hover:text-gray-900">Topics</a>
          <a href="/about"             className="text-sm text-gray-500 hover:text-gray-900">About</a>
        </nav>
        <a
          href="/#find-your-stage"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-50 text-brand-800 border border-brand-100 hover:bg-brand-100 transition-colors"
        >
          Get started
        </a>
      </div>
    </header>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="text-sm font-medium mb-1">
            Life<span className="text-brand-600">Manual</span>
          </div>
          <p className="text-xs text-gray-400 max-w-xs">
            The guide school never gave you. Free, always. Built for New Zealand.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {['Privacy', 'About', 'Contact', 'Contribute'].map(link => (
            <a key={link} href={`/${link.toLowerCase()}`} className="text-xs text-gray-400 hover:text-gray-600">
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
