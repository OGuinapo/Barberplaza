'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CIDADES, ESPECIALIDADES, type Barbeiro } from '@/lib/types';
import Modal from '@/components/Modal';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
const AVATAR_COLORS = ['#a3392b', '#2b3a4a', '#8a6a28', '#5c6b4f', '#6d4a5c'];
function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function BarbeirosPage() {
  const [lista, setLista] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCidade, setFiltroCidade] = useState('Todas');
  const [filtroEsp, setFiltroEsp] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registar')) {
      setModalOpen(true);
    }
  }, []);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [verPerfil, setVerPerfil] = useState<Barbeiro | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('barbeiros').select('*').order('criado_em', { ascending: false });
    setLista(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remover(id: string) {
    if (!confirm('Remover este portefólio?')) return;
    await supabase.from('barbeiros').delete().eq('id', id);
    setLista((cur) => cur.filter((x) => x.id !== id));
  }

  async function registar(form: FormData) {
    const nome = (form.get('nome') as string)?.trim();
    const cidade = form.get('cidade') as string;
    const telemovel = (form.get('telemovel') as string)?.trim();
    const email = (form.get('email') as string)?.trim() || null;
    const anos_experiencia = (form.get('anos') as string)?.trim() || null;
    const bio = (form.get('bio') as string)?.trim();
    const foto_url = (form.get('foto') as string)?.trim() || null;

    if (!nome || !cidade || !telemovel || !bio) {
      setMsg({ text: 'Preenche nome, cidade, telemóvel e uma breve descrição.', ok: false });
      return;
    }
    const { error } = await supabase.from('barbeiros').insert({
      nome, cidade, telemovel, email, anos_experiencia, bio, foto_url,
      especialidades: selecionadas,
    });
    if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
    setModalOpen(false); setMsg(null); setSelecionadas([]);
    load();
  }

  const listaFiltrada = lista.filter(
    (b) => (filtroCidade === 'Todas' || b.cidade === filtroCidade) &&
           (filtroEsp === 'Todas' || b.especialidades?.includes(filtroEsp))
  );

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-6">
        <div>
          <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Talento</span>
          <h2 className="text-3xl">Portefólios de barbeiros</h2>
        </div>
        <button className="btn btn-red" onClick={() => setModalOpen(true)}>Criar o meu portefólio</button>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-6">
        <select className="field-input w-auto font-mono text-xs uppercase" value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)}>
          <option value="Todas">Todas as cidades</option>
          {CIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="field-input w-auto font-mono text-xs uppercase" value={filtroEsp} onChange={(e) => setFiltroEsp(e.target.value)}>
          <option value="Todas">Todas as especialidades</option>
          {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted text-center py-16">A carregar barbeiros…</p>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Ainda não há barbeiros aqui</h3>
          <p className="text-sm text-muted mb-4">Cria o primeiro portefólio e aparece para as barbearias desta cidade.</p>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Criar portefólio</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFiltrada.map((b) => (
            <div key={b.id} className="card">
              <div className="flex gap-3 items-center">
                <div
                  className="w-[54px] h-[54px] rounded-full shrink-0 flex items-center justify-center font-display text-xl text-white border-2 border-ink bg-cover bg-center"
                  style={b.foto_url ? { backgroundImage: `url('${b.foto_url}')`, color: 'transparent' } : { background: colorFor(b.nome) }}
                >
                  {!b.foto_url && initials(b.nome)}
                </div>
                <div>
                  <h4 className="font-bold text-base">{b.nome}</h4>
                  <div className="font-mono text-[11px] text-muted">{b.cidade}{b.anos_experiencia ? ` · ${b.anos_experiencia} anos exp.` : ''}</div>
                </div>
              </div>
              <p className="text-sm text-[#4a4536] line-clamp-3">{b.bio}</p>
              <div className="flex flex-wrap gap-1.5">
                {(b.especialidades ?? []).slice(0, 3).map((e) => <span key={e} className="tag">{e}</span>)}
              </div>
              <div className="flex gap-2 mt-1">
                <button className="btn btn-primary btn-sm" onClick={() => setVerPerfil(b)}>Ver perfil</button>
                <button className="btn btn-danger btn-sm" onClick={() => remover(b.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); setMsg(null); setSelecionadas([]); }}>
          <form onSubmit={(e) => { e.preventDefault(); registar(new FormData(e.currentTarget)); }}>
            <h2 className="text-3xl mb-1">Criar portefólio</h2>
            
