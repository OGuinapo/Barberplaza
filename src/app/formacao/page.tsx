'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';
import { TIPOS_FORMACAO, type Formacao } from '@/lib/types';
import { hojeISO, pedirLogin } from '@/lib/utils';
import Modal from '@/components/Modal';
import PhotoUploader from '@/components/PhotoUploader';
import DistritoConcelhoPicker from '@/components/DistritoConcelhoPicker';
import { Lightbox, PhotoGrid } from '@/components/Gallery';
import { EmptyState, ErrorState, ResultsBar, SkeletonGrid } from '@/components/ListUI';

type Form = {
  titulo: string;
  tipo: string;
  organizador: string;
  distrito: string;
  cidade: string;
  data: string;
  hora: string;
  preco: string;
  link: string;
  descricao: string;
  fotos: string[];
};

const FORM_VAZIO: Form = {
  titulo: '', tipo: TIPOS_FORMACAO[0], organizador: '', distrito: '', cidade: '',
  data: '', hora: '', preco: '', link: '', descricao: '', fotos: [],
};

function formatarData(d: string | null) {
  if (!d) return 'Data a anunciar';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
}

function linkSeguro(l: string | null): string | null {
  if (!l) return null;
  const s = l.trim();
  if (!s) return null;
  const comProtocolo = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(comProtocolo);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export default function FormacaoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [lista, setLista] = useState<Formacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroLista, setErroLista] = useState(false);

  const [pesquisa, setPesquisa] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [distrito, setDistrito] = useState('Todos');
  const [concelho, setConcelho] = useState('Todos');
  const [mostrarPassados, setMostrarPassados] = useState(false);

  const [detalhe, setDetalhe] = useState<Formacao | null>(null);
  const [lightbox, setLightbox] = useState<{ fotos: string[]; i: number; nome: string } | null>(null);

  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<Form>(FORM_VAZIO);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErroLista(false);
    const { data, error } = await supabase.from('formacoes').select('*').order('data', { ascending: true, nullsFirst: false });
    if (error) setErroLista(true);
    else setLista((data ?? []) as Formacao[]);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = useCallback(() => {
    setForm(FORM_VAZIO);
    setErroForm('');
    setFormAberto(true);
  }, []);

  function aoClicarPublicar() {
    if (!user) { router.push(pedirLogin('/formacao?publicar=1')); return; }
    abrirNovo();
  }

  useEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('publicar') !== '1') return;
    window.history.replaceState(null, '', '/formacao');
    if (!user) { router.push(pedirLogin('/formacao?publicar=1')); return; }
    abrirNovo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  async function publicar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user || aGuardar) return;
    setErroForm('');
    if (form.titulo.trim().length < 3) return setErroForm('Indica o título.');
    if (form.organizador.trim().length < 2) return setErroForm('Indica quem organiza.');
    if (!form.distrito || !form.cidade) return setErroForm('Escolhe o distrito e o concelho.');
    if (form.descricao.trim().length < 10) return setErroForm('Descreve a formação com pelo menos 10 caracteres.');
    if (form.link.trim() && !linkSeguro(form.link)) return setErroForm('O link de inscrição não é válido.');

    setAGuardar(true);
    const { error } = await supabase.from('formacoes').insert({
      user_id: user.id,
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      organizador: form.organizador.trim(),
      distrito: form.distrito,
      cidade: form.cidade,
      data: form.data || null,
      hora: form.hora || null,
      preco: form.preco.trim() || null,
      link: linkSeguro(form.link),
      descricao: form.descricao.trim(),
      fotos: form.fotos,
    });
    setAGuardar(false);
    if (error) { setErroForm('Não foi possível publicar: ' + error.message); return; }
    setFormAberto(false);
    carregar();
  }

  async function remover(f: Formacao) {
    if (!user || f.user_id !== user.id) return;
    if (!window.confirm('Remover esta formação?')) return;
    const { error } = await supabase.from('formacoes').delete().eq('id', f.id).eq('user_id', user.id);
    if (error) { window.alert('Não foi possível remover: ' + error.message); return; }
    setDetalhe(null);
    carregar();
  }

  const hoje = hojeISO();

  const filtrada = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();
    return lista
      .filter((f) => {
        if (!mostrarPassados && f.data && f.data < hoje) return false;
        if (tipo !== 'Todos' && f.tipo !== tipo) return false;
        if (distrito !== 'Todos' && f.distrito !== distrito) return false;
        if (concelho !== 'Todos' && f.cidade !== concelho) return false;
        if (q && !`${f.titulo} ${f.organizador} ${f.cidade} ${f.descricao}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        // próximas primeiro; sem data no fim
        if (!a.data && !b.data) return 0;
        if (!a.data) return 1;
        if (!b.data) return -1;
        return mostrarPassados ? b.data.localeCompare(a.data) : a.data.localeCompare(b.data);
      });
  }, [lista, pesquisa, tipo, distrito, concelho, mostrarPassados, hoje]);

  const nPassados = useMemo(() => lista.filter((f) => f.data && f.data < hoje).length, [lista, hoje]);
  const filtrado = pesquisa !== '' || tipo !== 'Todos' || distrito !== 'Todos' || concelho !== 'Todos';
  function limpar() { setPesquisa(''); setTipo('Todos'); setDistrito('Todos'); setConcelho('Todos'); }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl">Cursos, workshops e eventos</h1>
          <p className="text-muted mt-2 max-w-xl">
            Agenda para barbeiros que querem evoluir. Dás formação? Divulga aqui o teu próximo curso.
          </p>
        </div>
        <button type="button" onClick={aoClicarPublicar} className="btn btn-primary">Divulgar formação</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          aria-label="Pesquisar formações"
          placeholder="Pesquisar formações"
          className="field-input w-full sm:w-56"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
        <select aria-label="Tipo" className="field-input w-auto" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="Todos">Todos os tipos</option>
          {TIPOS_FORMACAO.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <DistritoConcelhoPicker
          allowTodos
          distrito={distrito}
          concelho={concelho}
          onDistritoChange={setDistrito}
          onConcelhoChange={setConcelho}
        />
      </div>

      {nPassados > 0 && (
        <label className="inline-flex items-center gap-2 text-sm text-muted mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={mostrarPassados}
            onChange={(e) => setMostrarPassados(e.target.checked)}
            className="w-4 h-4 accent-navy"
          />
          Mostrar eventos passados ({nPassados})
        </label>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : erroLista ? (
        <ErrorState onRetry={carregar} />
      ) : (
        <>
          <ResultsBar count={filtrada.length} singular="formação" plural="formações" filtrado={filtrado} onClear={limpar} />
          {filtrada.length === 0 ? (
            filtrado ? (
              <EmptyState
                title="Nenhuma formação com estes filtros."
                text="Experimenta alargar a zona ou limpar os filtros."
                action={<button type="button" onClick={limpar} className="btn btn-sm mt-1">Limpar filtros</button>}
              />
            ) : (
              <EmptyState
                title="Sem formações agendadas."
                text="Organizas cursos ou workshops? Divulga o próximo aqui."
                action={<button type="button" onClick={aoClicarPublicar} className="btn btn-primary btn-sm mt-1">Divulgar formação</button>}
              />
            )
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtrada.map((f) => {
                const capa = f.fotos?.[0];
                const passado = !!f.data && f.data < hoje;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setDetalhe(f)}
                    className={`card text-left cursor-pointer p-0 overflow-hidden gap-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${passado ? 'opacity-70' : ''}`}
                  >
                    {capa && (
                      <div className="relative aspect-[16/9] w-full bg-paper2">
                        <NextImage src={capa} alt={`Cartaz de ${f.titulo}`} fill sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="tag">{f.tipo}</span>
                        {passado && <span className="tag">Terminado</span>}
                      </div>
                      <p className="font-display font-bold text-lg leading-snug">{f.titulo}</p>
                      <p className="meta">{formatarData(f.data)}{f.hora ? ` · ${f.hora.slice(0, 5)}` : ''}</p>
                      <p className="meta">{f.cidade}{f.distrito ? `, ${f.distrito}` : ''} · {f.organizador}</p>
                      {f.preco && <p className="text-sm font-semibold">{f.preco}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {detalhe && (
        <Modal onClose={() => setDetalhe(null)}>
          <div className="mb-4 pr-8">
            <span className="tag mb-2">{detalhe.tipo}</span>
            <h2 className="text-2xl leading-tight">{detalhe.titulo}</h2>
            <p className="meta mt-1">Organização: {detalhe.organizador}</p>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm mb-5">
            <dt className="text-muted">Data</dt>
            <dd>{formatarData(detalhe.data)}{detalhe.hora ? ` às ${detalhe.hora.slice(0, 5)}` : ''}</dd>
            <dt className="text-muted">Local</dt>
            <dd>{detalhe.cidade}{detalhe.distrito ? `, ${detalhe.distrito}` : ''}</dd>
            {detalhe.preco && (<><dt className="text-muted">Preço</dt><dd>{detalhe.preco}</dd></>)}
          </dl>

          <p className="text-sm whitespace-pre-line mb-5">{detalhe.descricao}</p>

          {(detalhe.fotos?.length ?? 0) > 0 && (
            <div className="mb-5">
              <PhotoGrid
                fotos={detalhe.fotos ?? []}
                nome={detalhe.titulo}
                onOpen={(i) => setLightbox({ fotos: detalhe.fotos ?? [], i, nome: detalhe.titulo })}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {linkSeguro(detalhe.link) && (
              <a className="btn btn-primary" href={linkSeguro(detalhe.link)!} target="_blank" rel="noopener noreferrer nofollow">
                Inscrições e mais informação
              </a>
            )}
            {user && detalhe.user_id === user.id && (
              <button type="button" className="btn btn-danger" onClick={() => remover(detalhe)}>Remover</button>
            )}
          </div>
        </Modal>
      )}

      {lightbox && (
        <Lightbox
          fotos={lightbox.fotos}
          index={lightbox.i}
          alt={`Cartaz de ${lightbox.nome}`}
          onClose={() => setLightbox(null)}
          onIndex={(i) => setLightbox((l) => (l ? { ...l, i } : l))}
        />
      )}

      {formAberto && (
        <Modal onClose={() => setFormAberto(false)}>
          <form onSubmit={publicar} className="space-y-4">
            <h2 className="text-2xl pr-8">Divulgar formação</h2>

            <div>
              <label htmlFor="f-titulo" className="field-label">Título</label>
              <input id="f-titulo" className="field-input" value={form.titulo} maxLength={120}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-tipo" className="field-label">Tipo</label>
                <select id="f-tipo" className="field-input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS_FORMACAO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="f-org" className="field-label">Organizador</label>
                <input id="f-org" className="field-input" value={form.organizador} maxLength={100}
                  onChange={(e) => setForm({ ...form, organizador: e.target.value })} required />
              </div>
            </div>

            <div>
              <span className="field-label">Localização</span>
              <DistritoConcelhoPicker
                distrito={form.distrito}
                concelho={form.cidade}
                onDistritoChange={(v) => setForm((f) => ({ ...f, distrito: v }))}
                onConcelhoChange={(v) => setForm((f) => ({ ...f, cidade: v }))}
                className="field-input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="f-data" className="field-label">Data</label>
                <input id="f-data" type="date" className="field-input" value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })} />
              </div>
              <div>
                <label htmlFor="f-hora" className="field-label">Hora</label>
                <input id="f-hora" type="time" className="field-input" value={form.hora}
                  onChange={(e) => setForm({ ...form, hora: e.target.value })} />
              </div>
              <div>
                <label htmlFor="f-preco" className="field-label">Preço</label>
                <input id="f-preco" className="field-input" placeholder="Ex.: 90 EUR" value={form.preco} maxLength={40}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })} />
              </div>
            </div>

            <div>
              <label htmlFor="f-link" className="field-label">Link de inscrição (opcional)</label>
              <input id="f-link" className="field-input" placeholder="https://" value={form.link} maxLength={300}
                onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </div>

            <div>
              <label htmlFor="f-desc" className="field-label">Descrição</label>
              <textarea id="f-desc" className="field-input min-h-[120px]" value={form.descricao} maxLength={2000}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })} required
                placeholder="Programa, formador, vagas disponíveis, o que está incluído." />
            </div>

            <div>
              <span className="field-label">Cartaz ou fotografias</span>
              <PhotoUploader fotos={form.fotos} onChange={(fotos) => setForm((f) => ({ ...f, fotos }))} />
            </div>

            {erroForm && <p role="alert" className="text-sm text-red">{erroForm}</p>}

            <button type="submit" disabled={aGuardar} className="btn btn-primary w-full">
              {aGuardar ? 'A publicar...' : 'Publicar formação'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
