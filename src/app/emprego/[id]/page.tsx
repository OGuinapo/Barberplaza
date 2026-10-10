import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import VagaCandidatar from '@/components/VagaCandidatar';

export const revalidate = 300;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type VagaPagina = {
  id: string;
  titulo: string;
  tipo: string;
  cidade: string;
  distrito: string | null;
  descricao: string;
  criado_em: string;
  barbearias: { nome: string; cidade: string; distrito: string | null } | { nome: string; cidade: string; distrito: string | null }[] | null;
};

async function obterVaga(id: string): Promise<VagaPagina | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await supabase
    .from('vagas')
    .select('id, titulo, tipo, cidade, distrito, descricao, criado_em, barbearias(nome, cidade, distrito)')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as VagaPagina;
}

function nomeBarbearia(v: VagaPagina): string {
  const b = Array.isArray(v.barbearias) ? v.barbearias[0] : v.barbearias;
  return b?.nome ?? 'Barbearia';
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const v = await obterVaga(params.id);
  if (!v) return { title: 'Vaga não encontrada', robots: { index: false } };
  const titulo = `${v.titulo} em ${v.cidade}`;
  const descricao = `${nomeBarbearia(v)} procura barbeiro em ${v.cidade}. ${v.descricao}`.replace(/\s+/g, ' ').slice(0, 155);
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/emprego/${v.id}` },
    openGraph: { title: titulo, description: descricao, type: 'article', locale: 'pt_PT' },
  };
}

export default async function VagaPage({ params }: { params: { id: string } }) {
  const v = await obterVaga(params.id);
  if (!v) notFound();

  const empregador = nomeBarbearia(v);
  const emprego = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: v.titulo,
    description: v.descricao,
    datePosted: v.criado_em,
    employmentType: v.tipo.startsWith('Tempo inteiro')
      ? 'FULL_TIME'
      : v.tipo.startsWith('Meio')
      ? 'PART_TIME'
      : 'CONTRACTOR',
    hiringOrganization: { '@type': 'Organization', name: empregador },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: v.cidade,
        addressRegion: v.distrito ?? undefined,
        addressCountry: 'PT',
      },
    },
  };
  // Escapar "<" impede que texto dos utilizadores feche a tag <script>.
  const jsonLd = JSON.stringify(emprego).replace(/</g, '\\u003c');

  return (
    <div className="max-w-[760px] mx-auto px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <Link href="/emprego" className="text-sm text-muted hover:text-ink">← Todas as vagas</Link>

      <article className="mt-6">
        <span className="tag mb-3">{v.tipo}</span>
        <h1 className="text-3xl sm:text-4xl">{v.titulo}</h1>
        <p className="text-muted mt-2">
          {empregador} · {v.cidade}{v.distrito ? `, ${v.distrito}` : ''}
        </p>
        <p className="meta mt-1">
          Publicada a {new Date(v.criado_em).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="card mt-8">
          <h2 className="text-lg">Sobre a vaga</h2>
          <p className="text-sm whitespace-pre-line leading-relaxed">{v.descricao}</p>
        </div>

        {v.tipo.startsWith('Cadeira livre') && (
          <p className="meta mt-4">
            Cadeira livre: trabalhas por conta própria na barbearia e pagas um valor pela cadeira.
          </p>
        )}

        <div className="mt-8">
          <VagaCandidatar vagaId={v.id} vagaTitulo={v.titulo} />
        </div>
      </article>
    </div>
  );
}
