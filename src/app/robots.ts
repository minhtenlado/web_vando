import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Protect admin and API routes from being indexed
    },
    sitemap: 'https://phanhuynh.id.vn/sitemap.xml',
  }
}
