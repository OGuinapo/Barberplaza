'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';
import type { Candidatura } from '@/lib/types';

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'agora mesmo';
  if (s < 3600) return `${Math.floor(s / 60)} min atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)} h atrás`;
  return `${Math.floor(s / 86400)} d atrás`;
}

export default function CandidaturasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/entrar?next=/emprego/candidaturas'); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('candidaturas')
        .select('*, vagas(titulo, cidade, distrito, tipo)')
        .order('criado_em', { ascending: false });
      setLista((data as any) ?? []);
      setLoading(false);
    })();
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return <p className="font-mono text-sm text-muted text-center py-16">A carregar…</p>;
  }
  if (!user) return null;

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <Link href="/emprego" className="font-mono text-xs text-muted hover:text-ink">← Voltar a emprego</Link>
      <h2 className="text-3xl mt-2 mb-6">Candidaturas recebidas</h2>

      {lista.length === 0 ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Ainda não há candidaturas</h3>
          <p className="text-sm text-muted">Quando alguém se candidatar a uma das tuas vagas, aparece aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map((c) => (
            <div key={c.id} className="card">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div>
                  <h4 className="font-bold text-base">{c.nome}</h4>
                  <div className="font-mono text-[11px] text-muted">
                    {c.vagas?.titulo ?? 'Vaga'} · {c.vagas?.cidade}{c.vagas?.distrito ? `, ${c.vagas.distrito}` : ''} · {timeAgo(c.criado_em)}
                  </div>
                </div>
                <span className="tag">{c.contacto}</span>
              </div>
              {c.mensagem && <p className="text-sm text-[#4a4536] mt-2">{c.mensagem}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
