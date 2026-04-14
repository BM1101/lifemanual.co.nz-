import { MetadataRoute } from 'next'
import { getAllStageSlugs } from '@/lib/stages'
import { getAllGuideSlugs } from '@/lib/guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lifemanual.co.nz'

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const stagePages: MetadataRoute.Sitemap = getAllStageSlugs().map(slug => ({
    url: `${base}/stage/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const guidePages: MetadataRoute.Sitemap = getAllGuideSlugs().map(slug => ({
    url: `${base}/guide/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...stagePages, ...guidePages]
}
