'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CIDADES, TIPOS_FORMACAO, type Formacao } from '@/lib/types';
import Modal from '@/components/Modal';

function formatData(iso: string | null) {
  if (!iso) return 'Data a anunciar';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function FormacaoPage() {
  const [lista, setLista] = useState<Formacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('formacoes').select('*').order('data', { ascending: true, nullsFirst: false });
    setLista(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remover(id: string) {
    if (!confirm('Remover este curso/evento?')) return;
    await supabase.from('formacoes').delete().eq('id', id);
    setLista((cur) => cur.filter((x) => x.id !== id));
  }

  async function publicar(form: FormData) {
    const titulo = (form.get('titulo') as string)?.trim();
    const tipo = form.get('tipo') as string;
    const organizador = (form.get('organizador') as string)?.trim();
    const cidade = form.get('cidade') as string;
    const data = (form.get('data') as string) || null;
    const preco = (form.get('preco') as string)?.trim() || null;
    const link = (form.get('link') as string)?.trim() || null;
    const descricao = (form.get('descricao') as string)?.trim();

    if (!titulo || !organizador || !cidade || !descricao) {
      setMsg({ text: 'Preenche pelo menos o título, organizador, cidade e descrição.', ok: false });
      return;
    }
    const { error } = await supabase.from('formacoes').insert({ titulo, tipo, organizador, cidade, data, preco, link, descricao });
    if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
    setModalOpen(false); setMsg(null);
    load();
  }

  const listaFiltrada = lista.filter((f) => filtroTipo === 'Todos' || f.tipo === filtroTipo);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-6">
        <div>
          <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Aprender e crescer</span>
          <h2 className="text-3xl">Cursos, workshops e eventos</h2>
        </div>
        <button className="btn btn-red" onClick={() => setModalOpen(true)}>Publicar curso ou evento</button>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-6">
        <select className="field-input w-auto font-mono text-xs uppercase" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="Todos">Todos os tipos</option>
          {TIPOS_FORMACAO.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted text-center py-16">A carregar…</p>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Ainda não há formação marcada</h3>
          <p className="text-sm text-muted mb-4">Escolas, marcas ou barbearias podem anunciar aqui cursos, workshops e encontros do setor.</p>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Publicar curso ou evento</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFiltrada.map((f) => {
            const gratis = !f.preco || /gr[aá]tis|free|0€/i.test(f.preco);
            return (
              <div key={f.id} className="card border-l-4 border-l-brass">
                <span className="tag !bg-brass !text-white w-fit">{f.tipo}</span>
                <h4 className="font-bold text-base">{f.titulo}</h4>
                <div className="font-mono text-[11px] text-muted">{f.organizador} · {f.cidade}</div>
                <div className="font-mono text-xs font-semibold text-navy">📅 {formatData(f.data)}</div>
                <p className="text-sm text-[#4a4536] line-clamp-3">{f.descricao}</p>
                <span className={`tag w-fit ${gratis ? '!text-[#2e5a2e] font-bold' : ''}`}>{gratis ? 'Grátis' : f.preco}</span>
                <div className="flex gap-2 mt-1">
                  {f.link && <a href={f.link} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Inscrever-me</a>}
                  <button className="btn btn-danger btn-sm" onClick={() => remover(f.id)}>Remover</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); setMsg(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); publicar(new FormData(e.currentTarget)); }}>
            <h2 className="text-3xl mb-1">Publicar curso ou evento</h2>
            <p className="text-sm text-muted mb-5">Escolas, marcas ou barbearias podem anunciar aqui formação para a comunidade.</p>
            {msg && <div className="text-sm font-mono px-3 py-2.5 rounded-md mb-3 bg-[#f3d9d4] text-redDark">{msg.text}</div>}
            <label className="block mb-3.5">
              <span className="field-label">Título</span>
              <input name="titulo" className="field-input" placeholder="Ex: Workshop de Navalha Clássica" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Tipo</span>
                <select name="tipo" className="field-input">{TIPOS_FORMACAO.map((t) => <option key={t}>{t}</option>)}</select>
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Organizador</span>
                <input name="organizador" className="field-input" placeholder="Escola, marca ou barbearia" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Cidade</span>
                <select name="cidade" className="field-input">
                  <option value="Online">Online</option>
                  {CIDADES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Data</span>
                <input type="date" name="data" className="field-input" />
              </label>
            </div>
            <label className="block mb-3.5">
              <span className="field-label">Preço (deixa em branco se for grátis)</span>
              <input name="preco" className="field-input" placeholder="Ex: Grátis ou 35€" />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Link de inscrição (opcional)</span>
              <input name="link" className="field-input" placeholder="https://..." />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Descrição</span>
              <textarea name="descricao" className="field-input min-h-[80px]" placeholder="Conteúdo, formador, para quem é indicado." />
            </label>
            <button type="submit" className="btn btn-red w-full justify-center">Publicar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
