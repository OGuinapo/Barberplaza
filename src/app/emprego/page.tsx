'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TIPOS_VAGA, type Vaga, type Barbearia } from '@/lib/types';
import Modal from '@/components/Modal';
import DistritoConcelhoPicker from '@/components/DistritoConcelhoPicker';

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
  const [filtroDistrito, setFiltroDistrito] = useState('');
  const [filtroConcelho, setFiltroConcelho] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todas');
  const [modal, setModal] = useState<'post' | 'candidatar' | null>(null);

  const [formDistrito, setFormDistrito] = useState('');
  const [formConcelho, setFormConcelho] = useState('');

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
    const { error } = await supabase.from('vagas').delete().eq('id', id);
    if (error) { alert('Não foi possível remover: ' + error.message); return; }
    setVagas((cur) => cur.filter((x) => x.id !== id));
  }

  async function publicarVaga(form: FormData) {
    const barbearia_id = form.get('barbearia_id') as string;
    const titulo = (form.get('titulo') as string)?.trim();
    const tipo = form.get('tipo') as string;
    const distrito = form.get('distrito') as string;
    const cidade = form.get('cidade') as string;
    const descricao = (form.get('descricao') as string)?.trim();
    if (!barbearia_id || !titulo || !distrito || !cidade || !descricao) {
      setMsg({ text: 'Preenche todos os campos, incluindo a barbearia responsável.', ok: false });
      return;
    }
    const barbearia = barbearias.find((b) => b.id === barbearia_id);
    const { data, error } = await supabase.from('vagas').insert({ barbearia_id, titulo, tipo, cidade, distrito, descricao }).select().single();
    if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
    setVagas((cur) => [{ ...(data as Vaga), barbearias: { nome: barbearia?.nome ?? '' } }, ...cur]);
    setModal(null); setMsg(null); setFormDistrito(''); setFormConcelho('');
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

  const pesquisaAtiva = filtroDistrito !== '';
  const listaFiltrada = pesquisaAtiva ? vagas.filter(
    (v) => (filtroDistrito === 'Todos' || v.distrito === filtroDistrito) &&
           (filtroConcelho === 'Todos' || v.cidade === filtroConcelho) &&
           (filtroTipo === 'Todas' || v.tipo === filtroTipo)
  ) : [];

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
        <DistritoConcelhoPicker
          distrito={filtroDistrito}
          concelho={filtroConcelho}
          onDistritoChange={setFiltroDistrito}
          onConcelhoChange={setFiltroConcelho}
          allowTodos
        />
        <select className="field-input w-auto font-mono text-xs uppercase" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="Todas">Todos os tipos</option>
          {TIPOS_VAGA.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted text-center py-16">A carregar vagas…</p>
      ) : !pesquisaAtiva ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Escolhe uma localização</h3>
          <p className="text-sm text-muted">Seleciona o distrito acima — ou escolhe "Todos os distritos" para veres todas as vagas abertas.</p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Ainda não há vagas aqui</h3>
          <p className="text-sm text-muted mb-4">Sê a primeira barbearia a publicar uma oportunidade nesta zona.</p>
          <button className="btn btn-primary" onClick={() => setModal('post')}>Publicar vaga</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFiltrada.map((v) => (
            <div key={v.id} className="card border-l-4 border-l-red">
              <span className="tag !bg-navy !text-white w-fit">{v.tipo}</span>
              <h4 className="font-bold text-base">{v.titulo}</h4>
              <div className="font-mono text-[11px] text-muted">
                {v.barbearias?.nome ?? 'Barbearia'} · {v.cidade}{v.distrito ? `, ${v.distrito}` : ''} · {timeAgo(v.criado_em)}
              </div>
              <p className="text-sm text-[#4a4536] line-clamp-3">{v.descricao}</p>
              <div className="flex gap-2 mt-1">
                <button className="btn btn-red btn-sm" onClick={() => { setVagaAlvo(v); setModal('candidatar'); }}>Candidatar-me</button>
                <button className="btn btn-danger btn-sm" onClick={() => removerVaga(v.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'post' && (
        <Modal onClose={() => { setModal(null); setMsg(null); setFormDistrito(''); setFormConcelho(''); }}>
          {barbearias.length === 0 ? (
            <>
              <h2 className="text-3xl mb-1">Publicar vaga</h2>
              <p className="text-sm text-muted mb-5">Precisas de registar a tua barbearia primeiro, para os barbeiros saberem quem está a contratar.</p>
              <a href="/barbearias?registar=1" className="btn btn-primary w-full justify-center">Registar barbearia agora</a>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); publicarVaga(new FormData(e.currentTarget)); }}>
              <h2 className="text-3xl mb-1">Publicar vaga</h2>
              <p className="text-sm text-muted mb-5">A vaga aparece imediatamente para todos os barbeiros.</p>
              {msg && <div className={`text-sm font-mono px-3 py-2.5 rounded-md mb-3 ${msg.ok ? 'bg-[#dfe9df] text-[#2e5a2e]' : 'bg-[#f3d9d4] text-redDark'}`}>{msg.text}</div>}
              <label className="block mb-3.5">
                <span className="field-label">Barbearia responsável</span>
                <select name="barbearia_id" className="field-input">
                  {barbearias.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
                </select>
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Título da vaga</span>
                <input name="titulo" className="field-input" placeholder="Ex: Barbeiro para fins de semana" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block mb-3.5">
                  <span className="field-label">Tipo</span>
                  <select name="tipo" className="field-input">{TIPOS_VAGA.map((t) => <option key={t}>{t}</option>)}</select>
                </label>
                <label className="block mb-3.5">
                  <span className="field-label">Distrito</span>
                  <DistritoConcelhoPicker
                    distrito={formDistrito} concelho={formConcelho}
                    onDistritoChange={setFormDistrito} onConcelhoChange={setFormConcelho}
                    distritoName="distrito" concelhoName="cidade"
                    className="field-input"
                  />
                </label>
              </div>
              <label className="block mb-3.5">
                <span className="field-label">Descrição</span>
                <textarea name="descricao" className="field-input min-h-[90px]" placeholder="Horário, condições, o que procuras no candidato." />
              </label>
              <button type="submit" className="btn btn-red w-full justify-center">Publicar vaga</button>
            </form>
          )}
        </Modal>
      )}

      {modal === 'candidatar' && vagaAlvo && (
        <Modal onClose={() => { setModal(null); setMsg(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); enviarCandidatura(new FormData(e.currentTarget)); }}>
            <h2 className="text-3xl mb-1">Candidatar-me</h2>
            <p className="text-sm text-muted mb-5">{vagaAlvo.titulo} · {vagaAlvo.barbearias?.nome} · {vagaAlvo.cidade}</p>
            {msg && <div className={`text-sm font-mono px-3 py-2.5 rounded-md mb-3 ${msg.ok ? 'bg-[#dfe9df] text-[#2e5a2e]' : 'bg-[#f3d9d4] text-redDark'}`}>{msg.text}</div>}
            <label className="block mb-3.5">
              <span className="field-label">O teu nome</span>
              <input name="nome" className="field-input" placeholder="Nome completo" />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Contacto (telemóvel ou email)</span>
              <input name="contacto" className="field-input" placeholder="9xx xxx xxx ou email" />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Mensagem (opcional)</span>
              <textarea name="mensagem" className="field-input min-h-[80px]" placeholder="Uma breve apresentação para a barbearia." />
            </label>
            <button type="submit" className="btn btn-red w-full justify-center">Enviar candidatura</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
