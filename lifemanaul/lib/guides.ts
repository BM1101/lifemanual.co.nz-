import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { Guide, GuideMeta } from './stages'

const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides')

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

// Recursively walk GUIDES_DIR (and every subfolder) and return absolute
// paths to every .mdx/.md file found, at any depth.
function findAllMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []

  let results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(findAllMdxFiles(fullPath))
    } else if (entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md'))) {
      results.push(fullPath)
    }
  }

  return results
}

// Look up the full path for a given slug, wherever it lives in the tree.
function getGuideFilePath(slug: string): string | null {
  const match = findAllMdxFiles(GUIDES_DIR).find(
    f => slugFromFilename(path.basename(f)) === slug
  )
  return match ?? null
}

export function getAllGuides(): GuideMeta[] {
  const files = findAllMdxFiles(GUIDES_DIR)

  return files.map(filePath => {
    const slug = slugFromFilename(path.basename(filePath))
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
  if (!filePath) return null

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
  return findAllMdxFiles(GUIDES_DIR).map(f => slugFromFilename(path.basename(f)))
}
