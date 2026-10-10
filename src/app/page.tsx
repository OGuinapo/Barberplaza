import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 300;

type VagaResumo = {
  id: string;
  titulo: string;
  tipo: string;
  cidade: string;
  distrito: string | null;
  barbearias: { nome: string } | { nome: string }[] | null;
};

async function ultimasVagas(): Promise<VagaResumo[]> {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('id, titulo, tipo, cidade, distrito, barbearias(nome)')
      .order('criado_em', { ascending: false })
      .limit(3);
    if (error) return [];
    return (data ?? []) as unknown as VagaResumo[];
  } catch {
    return [];
  }
}

const PASSOS = [
  { n: '1', titulo: 'Cria o perfil', texto: 'Barbeiros criam o portefólio com fotos. Barbearias registam o espaço e a equipa.' },
  { n: '2', titulo: 'Encontra ou publica', texto: 'Filtra vagas por distrito e concelho, ou publica uma vaga em poucos minutos.' },
  { n: '3', titulo: 'Fala diretamente', texto: 'O contacto é feito fora da plataforma, por telemóvel ou email. Sem intermediários.' },
];

const CAMINHOS = [
  {
    titulo: 'Sou barbeiro',
    texto: 'Mostra o teu trabalho e candidata-te a vagas em todo o país.',
    href: '/barbeiros?registar=1',
    cta: 'Criar portefólio',
  },
  {
    titulo: 'Tenho uma barbearia',
    texto: 'Regista o teu espaço, publica vagas e recebe candidaturas.',
    href: '/barbearias?registar=1',
    cta: 'Registar barbearia',
  },
  {
    titulo: 'Dou formação',
    texto: 'Divulga cursos, workshops e eventos a quem quer evoluir.',
    href: '/formacao?publicar=1',
    cta: 'Divulgar formação',
  },
];

export default async function Home() {
  const vagas = await ultimasVagas();

  const siteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BarberPlaza',
    url: 'https://barberplaza.net',
    inLanguage: 'pt-PT',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />

      <section className="border-b border-line">
        <div className="max-w-[1100px] mx-auto px-6 py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-muted bg-white border border-line rounded-full px-3 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-red" aria-hidden="true" />
            Em beta · gratuito para barbeiros e barbearias
          </p>
          <h1 className="text-4xl sm:text-6xl max-w-3xl">
            Emprego e formação para barbeiros em Portugal
          </h1>
          <p className="text-lg text-muted mt-5 max-w-2xl">
            Encontra vaga, mostra o teu trabalho ou contrata o próximo barbeiro da tua equipa.
            Sem comissões, sem subscrições.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/emprego" className="btn btn-primary">Ver vagas</Link>
            <Link href="/barbeiros" className="btn">Descobrir barbeiros</Link>
          </div>
        </div>
      </section>

      {vagas.length > 0 && (
        <section className="max-w-[1100px] mx-auto px-6 pt-14">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <span className="eyebrow">Mais recentes</span>
              <h2 className="text-2xl sm:text-3xl">Últimas vagas</h2>
            </div>
            <Link href="/emprego" className="text-sm font-semibold text-red hover:underline">Ver todas</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {vagas.map((v) => {
              const b = Array.isArray(v.barbearias) ? v.barbearias[0] : v.barbearias;
              return (
                <Link key={v.id} href={`/emprego/${v.id}`} className="card">
                  <span className="tag self-start">{v.tipo}</span>
                  <p className="font-display font-semibold text-lg leading-snug">{v.titulo}</p>
                  <p className="meta">{b?.nome ?? 'Barbearia'} · {v.cidade}{v.distrito ? `, ${v.distrito}` : ''}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="max-w-[1100px] mx-auto px-6 pt-16">
        <span className="eyebrow">Como funciona</span>
        <h2 className="text-2xl sm:text-3xl mb-6">Simples, direto e gratuito</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {PASSOS.map((p) => (
            <li key={p.n} className="card">
              <span className="w-8 h-8 rounded-full bg-ink text-white text-sm font-semibold flex items-center justify-center" aria-hidden="true">{p.n}</span>
              <h3 className="text-lg">{p.titulo}</h3>
              <p className="text-sm text-muted">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 pt-16">
        <span className="eyebrow">Começa aqui</span>
        <h2 className="text-2xl sm:text-3xl mb-6">Qual é o teu caminho?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CAMINHOS.map((c) => (
            <div key={c.titulo} className="card">
              <h3 className="text-xl">{c.titulo}</h3>
              <p className="text-sm text-muted flex-1">{c.texto}</p>
              <Link href={c.href} className="btn btn-primary self-start mt-2">{c.cta}</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
