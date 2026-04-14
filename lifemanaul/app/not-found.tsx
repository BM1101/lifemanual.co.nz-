export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <div className="text-5xl font-medium text-gray-200 mb-6">404</div>
      <h1 className="text-2xl font-medium text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8 leading-relaxed">
        This guide doesn't exist yet — but it probably should.
      </p>
      <a
        href="/"
        className="inline-block px-5 py-2.5 rounded-xl bg-brand-50 text-brand-800 border border-brand-100 text-sm font-medium hover:bg-brand-100 transition-colors"
      >
        Back to Life Manual
      </a>
    </div>
  )
}
