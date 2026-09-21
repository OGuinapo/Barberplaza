import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import CandidatarForm from '@/components/CandidatarForm';

async function getVaga(id: string) {
  const { data } = await supabase
    .from('vagas')
    .select('*, barbearias(nome, cidade, email)')
    .eq('id', id)
    .single();
  return data;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const vaga = await getVaga(params.id);
  if (!vaga) return { title: 'Vaga não encontrada — BarberPlaza' };
  return {
    title: `${vaga.titulo} — ${vaga.barbearias?.nome ?? 'Barbearia'} | BarberPlaza`,
    description: vaga.descricao?.slice(0, 160),
  };
}

const TIPO_SCHEMA: Record<string, string> = {
  'Tempo inteiro': 'FULL_TIME',
  'Meio-tempo': 'PART_TIME',
  'Cadeira livre (aluguer)': 'CONTRACTOR',
  'Freelancer / Recibos verdes': 'CONTRACTOR',
};

export default async function VagaPage({ params }: { params: { id: string } }) {
  const vaga = await getVaga(params.id);
  if (!vaga) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: vaga.titulo,
    description: vaga.descricao,
    datePosted: vaga.criado_em,
    employmentType: TIPO_SCHEMA[vaga.tipo] ?? 'OTHER',
    hiringOrganization: {
      '@type': 'Organization',
      name: vaga.barbearias?.nome ?? 'Barbearia',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: vaga.cidade,
        addressRegion: vaga.distrito ?? undefined,
        addressCountry: 'PT',
      },
    },
  };

  return (
    <div className="max-w-[700px] mx-auto px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/emprego" className="font-mono text-xs text-muted hover:text-ink">← Voltar a todas as vagas</Link>
      <span className="tag !bg-navy !text-white w-fit mt-4 inline-block">{vaga.tipo}</span>
      <h1 className="text-4xl mt-2 mb-1">{vaga.titulo}</h1>
      <p className="font-mono text-sm text-muted mb-6">
        {vaga.barbearias?.nome ?? 'Barbearia'} · {vaga.cidade}{vaga.distrito ? `, ${vaga.distrito}` : ''}
      </p>
      <p className="text-[15px] text-[#3a372f] whitespace-pre-line mb-8">{vaga.descricao}</p>
      <CandidatarForm
        vagaId={vaga.id}
        vagaTitulo={vaga.titulo}
        barbeariaEmail={vaga.barbearias?.email ?? null}
      />
    </div>
  );
}
