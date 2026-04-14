import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Why Life Manual exists and who it\'s for.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-medium tracking-tight text-gray-900 mb-6">About Life Manual</h1>

      <div className="prose-life">
        <p>
          Life Manual exists because there's a huge amount of practical knowledge that life expects
          you to have — and almost nobody teaches it. How do taxes work? What is compound interest?
          What are your rights as a tenant? When should you get a prostate check?
        </p>
        <p>
          This information isn't secret. It's just scattered, often buried in jargon, and rarely
          explained at the moment you actually need it.
        </p>
        <p>
          Life Manual collects it, writes it in plain English, and organises it by life stage —
          so you get the right information at the right time, not all at once and not years too late.
        </p>

        <h2>Our principles</h2>
        <ul>
          <li><strong>Always free.</strong> Every guide, every tool, every calculator — free forever.</li>
          <li><strong>No ads.</strong> We don't sell your attention or your data.</li>
          <li><strong>NZ-first.</strong> Our content is written for New Zealand — specific laws, specific systems, specific resources.</li>
          <li><strong>Editorially independent.</strong> Any commercial relationships we have are clearly disclosed and never influence what we write.</li>
        </ul>

        <h2>Built for New Zealand</h2>
        <p>
          Life Manual is designed for New Zealanders. That means NZ-specific content: KiwiSaver,
          IRD numbers, tenancy law, NZ Super, ACC, and the specific steps for things like getting
          your learner's licence in NZ. The broad concepts apply anywhere, but the details are ours.
        </p>
      </div>
    </div>
  )
}
