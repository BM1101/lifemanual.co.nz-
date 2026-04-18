import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { Guide, GuideMeta } from './stages'

const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides')

function getGuideFilePath(slug: string): string {
  return path.join(GUIDES_DIR, `${slug}.mdx`)
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '')
}

function parseDate(val: unknown): string {
  if (!val) return new Date().toISOString().split('T')[0]
  if (val instanceof Date) return val.toISOString().split('T')[0]
  return String(val)
}

function parseRaw(raw: string) {
  // Strip any leading whitespace/newlines before frontmatter
  const cleaned = raw.replace(/^\s+/, '')
  return matter(cleaned)
}

export function getAllGuides(): GuideMeta[] {
  if (!fs.existsSync(GUIDES_DIR)) return []

  const files = fs.readdirSync(GUIDES_DIR).filter(f => f.endsWith('.mdx') || f.endsWith('.md'))

  return files.map(filename => {
    const slug = slugFromFilename(filename)
    const raw = fs.readFileSync(getGuideFilePath(slug), 'utf-8')
    const { data, content } = parseRaw(raw)
    const rt = readingTime(content)

    return {
      slug,
      title: data.title ?? 'Untitled',
      description: data.description ?? '',
      stageId: data.stageId ?? '',
      categoryId: data.categoryId ?? '',
      readingTime: Math.ceil(rt.minutes),
      lastUpdated: parseDate(data.lastUpdated),
      keyTakeaways: data.keyTakeaways ?? [],
      relatedSlugs: data.relatedSlugs ?? [],
    }
  })
}

export function getGuidesByStage(stageId: string): GuideMeta[] {
  return getAllGuides().filter(g => g.stageId === stageId)
}

export function getGuidesByCategory(stageId: string, categoryId: string): GuideMeta[] {
  return getAllGuides().filter(g => g.stageId === stageId && g.categoryId === categoryId)
}

export function getGuide(slug: string): Guide | null {
  const filePath = getGuideFilePath(slug)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = parseRaw(raw)
  const rt = readingTime(content)

  return {
    slug,
    title: data.title ?? 'Untitled',
    description: data.description ?? '',
    stageId: data.stageId ?? '',
    categoryId: data.categoryId ?? '',
    readingTime: Math.ceil(rt.minutes),
    lastUpdated: parseDate(data.lastUpdated),
    keyTakeaways: data.keyTakeaways ?? [],
    relatedSlugs: data.relatedSlugs ?? [],
    content,
  }
}

export function getAllGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return []
  return fs
    .readdirSync(GUIDES_DIR)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(slugFromFilename)
}
