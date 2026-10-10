'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';
import type { Candidatura } from '@/lib/types';
import { pedirLogin, tempoRelativo } from '@/lib/utils';
import { EmptyState, ErrorState, SkeletonGrid } from '@/components/ListUI';

export default function CandidaturasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(false);
    // O RLS garante que cada barbearia só vê as candidaturas das suas vagas.
    const { data, error } = await supabase
      .from('candidaturas')
      .select('*, vagas(titulo, cidade, distrito, tipo)')
      .order('criado_em', { ascending: false });
    if (error) setErro(true);
    else setLista((data ?? []) as unknown as Candidatura[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace(pedirLogin('/emprego/candidaturas')); return; }
    carregar();
  }, [authLoading, user, router, carregar]);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <Link href="/emprego" className="text-sm text-muted hover:text-ink">← Vagas</Link>
      <div className="mt-4 mb-8">
        <span className="eyebrow">Barbearias</span>
        <h1 className="text-3xl sm:text-4xl">Candidaturas recebidas</h1>
        <p className="text-muted mt-2">Respondes diretamente ao candidato, pelo contacto que ele deixou.</p>
      </div>

      {authLoading || loading ? (
        <SkeletonGrid n={3} />
      ) : erro ? (
        <ErrorState onRetry={carregar} />
      ) : lista.length === 0 ? (
        <EmptyState
          title="Ainda não recebeste candidaturas."
          text="Quando alguém se candidatar a uma das tuas vagas, aparece aqui."
        />
      ) : (
        <div className="space-y-4">
          {lista.map((c) => (
            <article key={c.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg leading-snug">{c.nome}</h2>
                  <p className="meta">
                    {c.vagas ? `Vaga: ${c.vagas.titulo} · ${c.vagas.cidade}` : 'Vaga removida'}
                  </p>
                </div>
                <span className="meta">{tempoRelativo(c.criado_em)}</span>
              </div>
              <p className="text-sm">
                <span className="text-muted">Contacto: </span>
                {c.contacto.includes('@') ? (
                  <a className="text-navy underline" href={`mailto:${c.contacto}`}>{c.contacto}</a>
                ) : (
                  <a className="text-navy underline" href={`tel:${c.contacto.replace(/\s/g, '')}`}>{c.contacto}</a>
                )}
              </p>
              {c.mensagem && <p className="text-sm whitespace-pre-line text-muted">{c.mensagem}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
