import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { STAGES, getStage, getAllStageSlugs } from '@/lib/stages'
import { getGuidesByStage, getGuidesByCategory } from '@/lib/guides'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllStageSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stage = getStage(params.slug)
  if (!stage) return {}
  return {
    title: `${stage.name} (${stage.label})`,
    description: stage.description,
  }
}

export default function StagePage({ params }: Props) {
  const stage = getStage(params.slug)
  if (!stage) notFound()

  const allGuides = getGuidesByStage(stage.id)

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-8 flex items-center gap-2">
        <a href="/" className="hover:text-gray-600">Home</a>
        <span>/</span>
        <span className="text-gray-600">{stage.name}</span>
      </nav>

      {/* Stage header */}
      <div className="flex items-start gap-4 mb-10">
        <div className="w-12 h-12 rounded-xl flex-shrink-0 mt-1" style={{ background: stage.hex }} />
        <div>
          <p className="text-xs text-gray-400 mb-1">{stage.label}</p>
          <h1 className="text-3xl font-medium tracking-tight text-gray-900 mb-2">{stage.name}</h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl">{stage.description}</p>
        </div>
      </div>

      {/* Stage navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-12 -mx-6 px-6 sm:mx-0 sm:px-0 sm:flex-wrap">
        {STAGES.map(s => (
          <a
            key={s.id}
            href={`/stage/${s.slug}`}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              s.id === stage.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {s.name}
          </a>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {stage.categories.map(category => {
          const guides = getGuidesByCategory(stage.id, category.id)
          return (
            <section key={category.id}>
              <div className="flex items-center gap-3 mb-5">
                <span style={{ fontSize: 18 }}>{category.icon}</span>
                <div>
                  <h2 className="text-base font-medium text-gray-900">{category.name}</h2>
                  <p className="text-xs text-gray-400">{category.description}</p>
                </div>
              </div>

              {guides.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {guides.map(guide => (
                    <a
                      key={guide.slug}
                      href={`/guide/${guide.slug}`}
                      className="block border border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <div className="text-sm font-medium text-gray-900 leading-snug mb-1.5">
                        {guide.title}
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed mb-3">
                        {guide.description}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-brand-600">Read →</span>
                        <span className="text-xs text-gray-400">{guide.readingTime} min read</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                // Placeholder when no guides written yet
                <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-400">Guides coming soon</p>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
