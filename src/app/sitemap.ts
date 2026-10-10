import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 3600;

const BASE = 'https://barberplaza.net';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();
  const estaticas: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: agora, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/emprego`, lastModified: agora, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/barbeiros`, lastModified: agora, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/barbearias`, lastModified: agora, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/formacao`, lastModified: agora, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/termos`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  let vagas: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabase
      .from('vagas')
      .select('id, criado_em')
      .order('criado_em', { ascending: false })
      .limit(500);
    vagas = (data ?? []).map((v) => ({
      url: `${BASE}/emprego/${v.id}`,
      lastModified: new Date(v.criado_em),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // sem vagas no sitemap se a base de dados falhar
  }

  return [...estaticas, ...vagas];
}
