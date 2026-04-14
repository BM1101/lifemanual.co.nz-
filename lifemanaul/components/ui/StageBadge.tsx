import type { Stage } from '@/lib/stages'

interface StageBadgeProps {
  stage: Stage
  size?: 'sm' | 'md'
}

export function StageBadge({ stage, size = 'md' }: StageBadgeProps) {
  return (
    <a
      href={`/stage/${stage.slug}`}
      className="inline-flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
      style={{ background: stage.hex }}
    >
      <span
        className={
          size === 'sm'
            ? 'text-xs font-medium px-3 py-1 text-gray-800'
            : 'text-sm font-medium px-4 py-1.5 text-gray-800'
        }
      >
        {stage.name}
      </span>
    </a>
  )
}
