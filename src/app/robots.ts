import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Protect admin routes from being indexed
    },
    sitemap: 'https://www.phanhuynh.id.vn/sitemap.xml',
  }
}
