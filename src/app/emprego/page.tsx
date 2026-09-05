'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CIDADES, TIPOS_VAGA, type Vaga, type Barbearia } from '@/lib/types';
import Modal from '@/components/Modal';

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'agora mesmo';
  if (s < 3600) return `${Math.floor(s / 60)} min atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)} h atrás`;
  return `${Math.floor(s / 86400)} d atrás`;
}

export default function EmpregoPage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCidade, setFiltroCidade] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('Todas');
  const [modal, setModal] = useState<'post' | 'candidatar' | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('publicar')) {
      setModal('post');
    }
  }, []);
  const [vagaAlvo, setVagaAlvo] = useState<Vaga | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: v }, { data: b }] = await Promise.all([
      supabase.from('vagas').select('*, barbearias(nome)').order('criado_em', { ascending: false }),
      supabase.from('barbearias').select('*').order('nome'),
    ]);
    setVagas((v as any) ?? []);
    setBarbearias(b ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function removerVaga(id: string) {
    if (!confirm('Remover esta vaga?')) return;
    await supabase.from('vagas').delete().eq('id', id);
    setVagas((cur) => cur.filter((x) => x.id !== id));
  }

  async function publicarVaga(form: FormData) {
    const barbearia_id = form.get('barbearia_id') as string;
    const titulo = (form.get('titulo') as string)?.trim();
    const tipo = form.get('tipo') as string;
    const cidade = form.get('cidade') as string;
    const descricao = (form.get('descricao') as string)?.trim();
    if (!barbearia_id || !titulo || !cidade || !descricao) {
      setMsg({ text: 'Preenche todos os campos, incluindo a barbearia responsável.', ok: false });
      return;
    }
    const { error } = await supabase.from('vagas').insert({ barbearia_id, titulo, tipo, cidade, descricao });
    if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
    setModal(null); setMsg(null);
    load();
  }

  async function enviarCandidatura(form: FormData) {
    if (!vagaAlvo) return;
    const nome = (form.get('nome') as string)?.trim();
    const contacto = (form.get('contacto') as string)?.trim();
    const mensagem = (form.get('mensagem') as string)?.trim();
    if (!nome || !contacto) {
      setMsg({ text: 'Indica o teu nome e um contacto (telemóvel ou email).', ok: false });
      return;
    }
    const { error } = await supabase.from('candidaturas').insert({ vaga_id: vagaAlvo.id, nome, contacto, mensagem });
    if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
    setMsg({ text: 'Candidatura enviada! A barbearia vai poder ver os teus dados.', ok: true });
    setTimeout(() => { setModal(null); setMsg(null); }, 1200);
  }

  const listaFiltrada = vagas.filter(
    (v) => (filtroCidade === 'Todas' || v.cidade === filtroCidade) &&
           (filtroTipo === 'Todas' || v.tipo === filtroTipo)
  );

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-6">
        <div>
          <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Bolsa de emprego</span>
          <h2 className="text-3xl">Emprego de barbeiro em Portugal</h2>
        </div>
        <button className="btn btn-red" onClick={() => setModal('post')}>Publicar vaga</button>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-6">
        <select className="field-input w-auto font-mono text-xs uppercase" value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)}>
          <option value="Todas">Todas as cidades</option>
          {CIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="field-input w-auto font-mono text-xs uppercase" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="Todas">Todos os tipos</option>
          {TIPOS_VAGA.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted text-center py-16">A carregar vagas…</p>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Ainda não há vagas aqui</h3>
          <p className="text-sm text-muted mb-4">Sê a primeira barbearia a publicar uma oportunidade nesta cidade.</p>
          <button className="btn btn-primary" onClick={() => setModal('post')}>Publicar vaga</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFiltrada.map((v) => (
            <div key={v.id} className="card border-l-4 border-l-red">
              
