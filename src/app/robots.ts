import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/emprego/candidaturas'] }],
    sitemap: 'https://barberplaza.net/sitemap.xml',
  };
}
