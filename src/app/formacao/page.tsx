'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TIPOS_FORMACAO, type Formacao } from '@/lib/types';
import Modal from '@/components/Modal';
import DistritoConcelhoPicker from '@/components/DistritoConcelhoPicker';
import PhotoUploader from '@/components/PhotoUploader';

function formatData(iso: string | null) {
  if (!iso) return 'Data a anunciar';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}
function capa(f: Formacao) {
  return (f.fotos && f.fotos[0]) || null;
}

export default function FormacaoPage() {
  const [lista, setLista] = useState<Formacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [verFormacao, setVerFormacao] = useState<Formacao | null>(null);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  const [ehOnline, setEhOnline] = useState(false);
  const [ehGratuito, setEhGratuito] = useState(false);
  const [formDistrito, setFormDistrito] = useState('');
  const [formConcelho, setFormConcelho] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);

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
    const online = form.get('online') === 'on';
    const distrito = online ? null : (form.get('distrito') as string);
    const cidade = online ? 'Online' : (form.get('cidade') as string);
    const data = (form.get('data') as string) || null;
    const hora = (form.get('hora') as string) || null;
    const gratuito = form.get('gratuito') === 'on';
    const valor = (form.get('valor') as string)?.trim();
    const preco = gratuito ? 'Grátis' : (valor ? `${valor}€` : null);
    const link = (form.get('link') as string)?.trim() || null;
    const descricao = (form.get('descricao') as string)?.trim();

    if (!titulo || !organizador || !cidade || !descricao) {
      setMsg({ text: 'Preenche pelo menos o título, organizador, localização e descrição.', ok: false });
      return;
    }
    const { data: novo, error } = await supabase.from('formacoes').insert({
      titulo, tipo, organizador, cidade, distrito, data, hora, preco, link, descricao, fotos,
    }).select().single();
    if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
    setLista((cur) => [...cur, novo as Formacao].sort((a, b) => new Date(a.data || 0).getTime() - new Date(b.data || 0).getTime()));
    setModalOpen(false); setMsg(null); setEhOnline(false); setEhGratuito(false); setFormDistrito(''); setFormConcelho(''); setFotos([]);
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
            const foto = capa(f);
            return (
              <div key={f.id} className="card border-l-4 border-l-brass">
                {foto && (
                  <div className="aspect-[4/3] rounded-lg bg-navy bg-cover bg-center" style={{ backgroundImage: `url('${foto}')` }} />
                )}
                <span className="tag !bg-brass !text-white w-fit">{f.tipo}</span>
                <h4 className="font-bold text-base">{f.titulo}</h4>
                <div className="font-mono text-[11px] text-muted">{f.organizador} · {f.cidade}{f.distrito ? `, ${f.distrito}` : ''}</div>
                <div className="font-mono text-xs font-semibold text-navy">
                  📅 {formatData(f.data)}{f.hora ? ` · ${f.hora}` : ''}
                </div>
                <p className="text-sm text-[#4a4536] line-clamp-3">{f.descricao}</p>
                <span className={`tag w-fit ${gratis ? '!text-[#2e5a2e] font-bold' : ''}`}>{gratis ? 'Grátis' : f.preco}</span>
                <div className="flex gap-2 mt-1">
                  <button className="btn btn-primary btn-sm" onClick={() => setVerFormacao(f)}>Ver detalhes</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remover(f.id)}>Remover</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); setMsg(null); setEhOnline(false); setEhGratuito(false); setFormDistrito(''); setFormConcelho(''); setFotos([]); }}>
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

            <label className="flex items-center gap-2 mb-3.5 cursor-pointer">
              <input type="checkbox" name="online" checked={ehOnline} onChange={(e) => setEhOnline(e.target.checked)} />
              <span className="field-label !mb-0">Este curso/evento é online</span>
            </label>

            {!ehOnline && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block mb-3.5 col-span-2">
                  <span className="field-label">Distrito e concelho</span>
                  <div className="grid grid-cols-2 gap-3">
                    <DistritoConcelhoPicker
                      distrito={formDistrito} concelho={formConcelho}
                      onDistritoChange={setFormDistrito} onConcelhoChange={setFormConcelho}
                      distritoName="distrito" concelhoName="cidade"
                      className="field-input"
                    />
                  </div>
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Data</span>
                <input type="date" name="data" className="field-input" />
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Hora (opcional)</span>
                <input type="time" name="hora" className="field-input" />
              </label>
            </div>

            <label className="flex items-center gap-2 mb-3.5 cursor-pointer">
              <input type="checkbox" name="gratuito" checked={ehGratuito} onChange={(e) => setEhGratuito(e.target.checked)} />
              <span className="field-label !mb-0">Este curso/evento é grátis</span>
            </label>

            {!ehGratuito && (
              <label className="block mb-3.5">
                <span className="field-label">Preço</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="valor"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="field-input"
                    placeholder="Ex: 35"
                  />
                  <span className="font-mono text-lg font-semibold text-muted">€</span>
                </div>
              </label>
            )}

            <label className="block mb-3.5">
              <span className="field-label">Link de inscrição (opcional)</span>
              <input name="link" className="field-input" placeholder="https://..." />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Descrição</span>
              <textarea name="descricao" className="field-input min-h-[80px]" placeholder="Conteúdo, formador, para quem é indicado." />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Cartaz ou fotos do evento (opcional)</span>
              <PhotoUploader fotos={fotos} onChange={setFotos} />
            </label>
            <button type="submit" className="btn btn-red w-full justify-center">Publicar</button>
          </form>
        </Modal>
      )}

      {verFormacao && (
        <Modal onClose={() => setVerFormacao(null)}>
          {verFormacao.fotos && verFormacao.fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              {verFormacao.fotos.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setFotoAmpliada(url)}
                  className="aspect-square rounded-lg overflow-hidden bg-navy cursor-zoom-in"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <span className="tag !bg-brass !text-white w-fit mb-2 inline-block">{verFormacao.tipo}</span>
          <h2 className="text-3xl">{verFormacao.titulo}</h2>
          <p className="text-sm text-muted mb-3">
            {verFormacao.organizador} · {verFormacao.cidade}{verFormacao.distrito ? `, ${verFormacao.distrito}` : ''}
          </p>
          <div className="font-mono text-sm font-semibold text-navy mb-3">
            📅 {formatData(verFormacao.data)}{verFormacao.hora ? ` às ${verFormacao.hora}` : ''}
          </div>
          <p className="text-sm text-[#3a372f] mb-4">{verFormacao.descricao}</p>
          <div className="flex items-center gap-3 pt-4 border-t border-line">
            <span className="tag">{(!verFormacao.preco || /gr[aá]tis|free|0€/i.test(verFormacao.preco)) ? 'Grátis' : verFormacao.preco}</span>
            {verFormacao.link && (
              <a href={verFormacao.link} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Inscrever-me</a>
            )}
          </div>
        </Modal>
      )}

      {fotoAmpliada && (
        <div
          className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <img src={fotoAmpliada} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
          <button
            onClick={() => setFotoAmpliada(null)}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
