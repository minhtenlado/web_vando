import type { MetadataRoute } from 'next'
import { getSiteData } from '@/lib/cv/site-data-server'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://phanhuynh.id.vn'

  const data = await getSiteData('vi')
  const posts = [...new Map(data.posts.filter((post) => post.published).map((post) => [post.slug, post])).values()]
  const projects = [...new Map(data.projects.map((project) => [project.id, project])).values()]

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${encodeURIComponent(post.slug)}`,
    lastModified: post.updatedAt || post.createdAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const projectUrls: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${encodeURIComponent(project.id)}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/notes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...postUrls,
    ...projectUrls,
  ]
}
