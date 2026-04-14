import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { Guide, GuideMeta } from './stages'

const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides')

// ─── File helpers ─────────────────────────────────────────────────────────────

function getGuideFilePath(slug: string): string {
  return path.join(GUIDES_DIR, `${slug}.mdx`)
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '')
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Load all guide metadata (no content) — used for listing pages */
export function getAllGuides(): GuideMeta[] {
  if (!fs.existsSync(GUIDES_DIR)) return []

  const files = fs.readdirSync(GUIDES_DIR).filter(f => f.endsWith('.mdx') || f.endsWith('.md'))

  return files.map(filename => {
    const slug = slugFromFilename(filename)
    const raw = fs.readFileSync(getGuideFilePath(slug), 'utf-8')
    const { data, content } = matter(raw)
    const rt = readingTime(content)

    return {
      slug,
      title: data.title ?? 'Untitled',
      description: data.description ?? '',
      stageId: data.stageId ?? '',
      categoryId: data.categoryId ?? '',
      readingTime: Math.ceil(rt.minutes),
      lastUpdated: data.lastUpdated ?? new Date().toISOString().split('T')[0],
      keyTakeaways: data.keyTakeaways ?? [],
      relatedSlugs: data.relatedSlugs ?? [],
    }
  })
}

/** Load guides for a specific stage */
export function getGuidesByStage(stageId: string): GuideMeta[] {
  return getAllGuides().filter(g => g.stageId === stageId)
}

/** Load guides for a specific stage + category */
export function getGuidesByCategory(stageId: string, categoryId: string): GuideMeta[] {
  return getAllGuides().filter(g => g.stageId === stageId && g.categoryId === categoryId)
}

/** Load a single guide including its MDX content */
export function getGuide(slug: string): Guide | null {
  const filePath = getGuideFilePath(slug)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const rt = readingTime(content)

  return {
    slug,
    title: data.title ?? 'Untitled',
    description: data.description ?? '',
    stageId: data.stageId ?? '',
    categoryId: data.categoryId ?? '',
    readingTime: Math.ceil(rt.minutes),
    lastUpdated: data.lastUpdated ?? new Date().toISOString().split('T')[0],
    keyTakeaways: data.keyTakeaways ?? [],
    relatedSlugs: data.relatedSlugs ?? [],
    content,
  }
}

/** All guide slugs — used for generateStaticParams */
export function getAllGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return []
  return fs
    .readdirSync(GUIDES_DIR)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(slugFromFilename)
}
