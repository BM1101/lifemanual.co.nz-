import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getGuide, getAllGuideSlugs, getAllGuides } from '@/lib/guides'
import { getStage, getCategory } from '@/lib/stages'
import { InvestmentCalculator } from '@/components/ui/InvestmentCalculator'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllGuideSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide(params.slug)
  if (!guide) return {}
  return {
    title: guide.title,
    description: guide.description,
  }
}

// MDX components — override default HTML elements with styled versions
const components = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-medium text-gray-900 mt-10 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-medium text-gray-900 mt-8 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-600 leading-relaxed mb-5 text-base" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside ml-5 mb-5 space-y-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside ml-5 mb-5 space-y-2" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-gray-600 leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-brand-600 underline underline-offset-2 hover:text-brand-800" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-medium text-gray-900" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className="border-l-2 border-brand-200 pl-4 my-6 italic text-gray-500" {...props} />
  ),
  hr: () => <hr className="border-gray-100 my-8" />,
  // Custom callout component — use in MDX as <Callout>text</Callout>
  Callout: ({ children }: { children: React.ReactNode }) => (
    <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 my-6">
      <div className="text-brand-800 text-sm leading-relaxed">{children}</div>
    </div>
  ),
  // Interactive calculators — drop into any MDX guide with <InvestmentCalculator />
  InvestmentCalculator: () => <InvestmentCalculator />,
}

export default function GuidePage({ params }: Props) {
  const guide = getGuide(params.slug)
  if (!guide) notFound()

  const stage = getStage(guide.stageId)
  const category = getCategory(guide.stageId, guide.categoryId)
  const allGuides = getAllGuides()
  const related = guide.relatedSlugs
    ?.map(s => allGuides.find(g => g.slug === s))
    .filter(Boolean) ?? []

  const updatedDate = new Date(guide.lastUpdated).toLocaleDateString('en-NZ', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-8 flex items-center gap-2 flex-wrap">
        <a href="/" className="hover:text-gray-600">Home</a>
        <span>/</span>
        {stage && (
          <>
            <a href={`/stage/${stage.slug}`} className="hover:text-gray-600">{stage.name}</a>
            <span>/</span>
          </>
        )}
        <span className="text-gray-600">{guide.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
        {/* Main content */}
        <article>
          {/* Header */}
          <header className="mb-10">
            {stage && category && (
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: stage.hex, color: '#044' }}
                >
                  {stage.name}
                </span>
                <span className="text-xs text-gray-400">{category.name}</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 leading-tight mb-4">
              {guide.title}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-5">{guide.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
              <span>{guide.readingTime} min read</span>
              <span>·</span>
              <span>Updated {updatedDate}</span>
            </div>
          </header>

          {/* Key takeaways */}
          {guide.keyTakeaways && guide.keyTakeaways.length > 0 && (
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mb-8">
              <h2 className="text-sm font-medium text-brand-800 mb-3">Key takeaways</h2>
              <ul className="space-y-2">
                {guide.keyTakeaways.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-brand-700">
                    <span className="text-brand-400 mt-0.5 flex-shrink-0">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* MDX content */}
          <div className="prose-life">
            <MDXRemote source={guide.content} components={components} />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* In this guide */}
          <div className="border border-gray-100 rounded-2xl p-5 sticky top-20">
            <h3 className="text-sm font-medium text-gray-900 mb-4">In this guide</h3>
            <div className="space-y-2">
              <div className="text-xs text-gray-400 leading-relaxed">
                {guide.readingTime} min read · Updated {updatedDate}
              </div>
            </div>

            {stage && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 mb-3">Stage</h4>
                <a
                  href={`/stage/${stage.slug}`}
                  className="flex items-center gap-2.5 group"
                >
                  <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: stage.hex }} />
                  <span className="text-sm text-gray-700 group-hover:text-brand-600">
                    {stage.name} ({stage.label})
                  </span>
                </a>
              </div>
            )}

            {related.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 mb-3">Related guides</h4>
                <div className="space-y-2">
                  {related.map(r => r && (
                    <a
                      key={r.slug}
                      href={`/guide/${r.slug}`}
                      className="block text-sm text-gray-600 hover:text-brand-600 leading-snug py-1"
                    >
                      {r.title} →
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
