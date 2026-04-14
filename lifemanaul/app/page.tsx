import { STAGES } from '@/lib/stages'
import { getAllGuides } from '@/lib/guides'
import type { GuideMeta, Stage } from '@/lib/stages'

export default function HomePage() {
  const guides = getAllGuides()

  return (
    <>
      <Hero />
      <StageSection guides={guides} />
      <WhySection />
      <CtaSection />
    </>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="border-b border-gray-100 py-20 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="inline-block text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 mb-6">
          The guide school never gave you
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-[1.1] mb-5">
          Everything life expects you to know,{' '}
          <span className="text-brand-600">when you need it</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">
          Practical, plain-English guides for every stage of life — from your
          first bank account to planning your retirement.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="#find-your-stage"
            className="px-6 py-3 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 text-sm font-medium hover:bg-brand-100 transition-colors"
          >
            Find your stage
          </a>
          <a
            href="/stage/mid-teens"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Browse all topics
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Stage section ───────────────────────────────────────────────────────────

function StageSection({ guides }: { guides: GuideMeta[] }) {
  return (
    <section id="find-your-stage" className="py-16 px-6 border-b border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-xl font-medium text-gray-900">Browse by life stage</h2>
          <span className="text-sm text-gray-400">{STAGES.length} stages</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {STAGES.map(stage => {
            const count = guides.filter(g => g.stageId === stage.id).length
            return (
              <a
                key={stage.id}
                href={`/stage/${stage.slug}`}
                className="group border border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:bg-gray-50 transition-all"
              >
                <div
                  className="w-8 h-8 rounded-lg mb-3"
                  style={{ background: stage.hex }}
                />
                <div className="text-xs text-gray-400 mb-0.5">{stage.label}</div>
                <div className="text-sm font-medium text-gray-900 leading-tight">
                  {stage.name}
                </div>
                <div className="text-xs text-gray-400 mt-1.5">
                  {count > 0 ? `${count} guide${count !== 1 ? 's' : ''}` : `${stage.categories.length} categories`}
                </div>
              </a>
            )
          })}
        </div>

        {/* Featured stage: mid teens */}
        <FeaturedStage stage={STAGES[1]} guides={guides.filter(g => g.stageId === 'mid-teens')} />
      </div>
    </section>
  )
}

function FeaturedStage({ stage, guides }: { stage: Stage; guides: GuideMeta[] }) {
  // Show up to 6 guides; fall back to category previews if no guides written yet
  const display = guides.slice(0, 6)
  const hasFallback = display.length === 0

  const fallbackTopics = [
    { slug: 'how-to-open-a-bank-account',   title: 'How to open a bank account',      desc: 'Step-by-step, age 16+' },
    { slug: 'getting-your-learners-licence', title: "Getting your learner's licence",   desc: 'What to study and expect' },
    { slug: 'budgeting-your-first-income',   title: 'Budgeting your first income',      desc: 'Before bad habits form' },
    { slug: 'basic-cooking',                 title: '10 meals everyone should know',    desc: 'No experience needed' },
    { slug: 'what-is-consent',               title: 'Consent — a clear guide',          desc: 'What it means, why it matters' },
    { slug: 'table-manners',                 title: 'Table manners and etiquette',       desc: 'Casual to formal' },
  ]

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-base font-medium text-gray-900">
          Popular in{' '}
          <a href={`/stage/${stage.slug}`} className="text-brand-600 hover:underline">
            {stage.name.toLowerCase()}
          </a>
        </h3>
        <a href={`/stage/${stage.slug}`} className="text-sm text-brand-600 hover:underline">
          See all →
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {hasFallback
          ? fallbackTopics.map(t => (
              <GuideCard
                key={t.slug}
                href={`/guide/${t.slug}`}
                title={t.title}
                description={t.desc}
                stageHex={stage.hex}
                readingTime={undefined}
              />
            ))
          : display.map(g => (
              <GuideCard
                key={g.slug}
                href={`/guide/${g.slug}`}
                title={g.title}
                description={g.description}
                stageHex={stage.hex}
                readingTime={g.readingTime}
              />
            ))}
      </div>
    </div>
  )
}

function GuideCard({
  href, title, description, stageHex, readingTime,
}: {
  href: string
  title: string
  description: string
  stageHex: string
  readingTime?: number
}) {
  return (
    <a
      href={href}
      className="group border border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:bg-gray-50 transition-all block"
    >
      <div className="w-7 h-7 rounded-lg mb-3" style={{ background: stageHex }} />
      <div className="text-sm font-medium text-gray-900 leading-snug mb-1.5">{title}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{description}</div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-brand-600">Read →</span>
        {readingTime && (
          <span className="text-xs text-gray-400">{readingTime} min read</span>
        )}
      </div>
    </a>
  )
}

// ─── Why section ──────────────────────────────────────────────────────────────

function WhySection() {
  const stats = [
    { num: '100+', label: 'Practical guides across every life stage' },
    { num: 'Free', label: 'No paywalls, no subscriptions, ever' },
    { num: 'NZ', label: 'Built for New Zealand, usable anywhere' },
  ]
  return (
    <section className="py-16 px-6 bg-gray-50 border-b border-gray-100">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-medium text-gray-900 mb-8">Why Life Manual?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(s => (
            <div key={s.num} className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="text-3xl font-medium text-brand-600 mb-2">{s.num}</div>
              <p className="text-sm text-gray-500 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA section ─────────────────────────────────────────────────────────────

function CtaSection() {
  const ages = ['13', '16', '18', '22', '28', '35', '45', '55', '65']
  const stageForAge: Record<string, string> = {
    '13': 'early-teens', '16': 'mid-teens', '18': 'young-adult',
    '22': 'young-adult', '28': 'establishing', '35': 'establishing',
    '45': 'mid-life', '55': 'pre-retirement', '65': 'pre-retirement',
  }

  return (
    <section className="py-20 px-6 text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="text-3xl font-medium tracking-tight text-gray-900 mb-4">
          Your life stage is waiting
        </h2>
        <p className="text-base text-gray-500 leading-relaxed mb-8">
          Pick your age and go straight to the guides that matter most right now.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {ages.map(age => (
            <a
              key={age}
              href={`/stage/${stageForAge[age]}`}
              className="text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-800 transition-all"
            >
              {age}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
