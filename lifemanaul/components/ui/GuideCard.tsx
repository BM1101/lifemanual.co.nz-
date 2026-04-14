import clsx from 'clsx'
import type { GuideMeta } from '@/lib/guides'

interface GuideCardProps {
  guide: GuideMeta
  stageHex: string
  className?: string
}

export function GuideCard({ guide, stageHex, className }: GuideCardProps) {
  return (
    <a
      href={`/guide/${guide.slug}`}
      className={clsx(
        'group block border border-gray-100 rounded-2xl p-4',
        'hover:border-gray-200 hover:bg-gray-50 transition-all',
        className
      )}
    >
      <div className="w-7 h-7 rounded-lg mb-3" style={{ background: stageHex }} />
      <div className="text-sm font-medium text-gray-900 leading-snug mb-1.5">
        {guide.title}
      </div>
      <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {guide.description}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-brand-600 group-hover:underline">Read →</span>
        <span className="text-xs text-gray-400">{guide.readingTime} min read</span>
      </div>
    </a>
  )
}
