'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';
import { ESPECIALIDADES, type Barbeiro } from '@/lib/types';
import { normalizarInstagram, pedirLogin, telemovelValido, emailValido } from '@/lib/utils';
import Modal from '@/components/Modal';
import PhotoUploader from '@/components/PhotoUploader';
import DistritoConcelhoPicker from '@/components/DistritoConcelhoPicker';
import { Avatar, Lightbox, PhotoGrid } from '@/components/Gallery';
import { EmptyState, ErrorState, ResultsBar, SkeletonGrid } from '@/components/ListUI';

type Form = {
  nome: string;
  distrito: string;
  cidade: string;
  telemovel: string;
  email: string;
  anos_experiencia: string;
  bio: string;
  instagram: string;
  especialidades: string[];
  fotos: string[];
};

const FORM_VAZIO: Form = {
  nome: '', distrito: '', cidade: '', telemovel: '', email: '',
  anos_experiencia: '', bio: '', instagram: '', especialidades: [], fotos: [],
};

// De 1 a 40 anos, guardados como texto ("1", "2", ...).
const ANOS = Array.from({ length: 40 }, (_, i) => String(i + 1));

// "1" -> "1 ano", "5" -> "5 anos". Valores antigos (ex.: "3 a 5 anos") ficam como estao.
function formatarAnos(v: string | null | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  if (/^\d+$/.test(t)) return t === '1' ? '1 ano' : `${t} anos`;
  return t;
}

export default function BarbeirosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [lista, setLista] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroLista, setErroLista] = useState(false);

  const [pesquisa, setPesquisa] = useState('');
  const [distrito, setDistrito] = useState('Todos');
  const [concelho, setConcelho] = useState('Todos');
  const [especialidade, setEspecialidade] = useState('Todas');

  const [detalhe, setDetalhe] = useState<Barbeiro | null>(null);
  const [lightbox, setLightbox] = useState<{ fotos: string[]; i: number; nome: string } | null>(null);

  const [formAberto, setFormAberto] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(FORM_VAZIO);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErroLista(false);
    const { data, error } = await supabase
      .from('barbeiros')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) setErroLista(true);
    else setLista((data ?? []) as Barbeiro[]);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const meuPerfil = useMemo(
    () => (user ? lista.find((b) => b.user_id === user.id) ?? null : null),
    [lista, user]
  );

  const abrirNovo = useCallback(() => {
    setEditId(null);
    setForm(FORM_VAZIO);
    setErroForm('');
    setFormAberto(true);
  }, []);

  function abrirEdicao(b: Barbeiro) {
    setDetalhe(null);
    setEditId(b.id);
    setForm({
      nome: b.nome,
      distrito: b.distrito ?? '',
      cidade: b.cidade,
      telemovel: b.telemovel,
      email: b.email ?? '',
      anos_experiencia: /^\d+$/.test(b.anos_experiencia ?? '') ? (b.anos_experiencia as string) : '',
      bio: b.bio,
      instagram: b.instagram ?? '',
      especialidades: b.especialidades ?? [],
      fotos: b.fotos ?? (b.foto_url ? [b.foto_url] : []),
    });
    setErroForm('');
    setFormAberto(true);
  }

  // ?registar=1 -> abre o formulário (ou pede login) quando já sabemos quem é o utilizador e a lista chegou.
  useEffect(() => {
    if (authLoading || loading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('registar') !== '1') return;
    window.history.replaceState(null, '', '/barbeiros');
    if (!user) { router.push(pedirLogin('/barbeiros?registar=1')); return; }
    if (meuPerfil) abrirEdicao(meuPerfil); else abrirNovo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, loading]);

  function aoClicarCriar() {
    if (!user) { router.push(pedirLogin('/barbeiros?registar=1')); return; }
    if (meuPerfil) abrirEdicao(meuPerfil); else abrirNovo();
  }

  function toggleEsp(e: string) {
    setForm((f) => ({
      ...f,
      especialidades: f.especialidades.includes(e)
        ? f.especialidades.filter((x) => x !== e)
        : [...f.especialidades, e],
    }));
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user || aGuardar) return;
    setErroForm('');

    const nome = form.nome.trim();
    if (nome.length < 2) return setErroForm('Indica o teu nome.');
    if (!form.distrito || !form.cidade) return setErroForm('Escolhe o distrito e o concelho.');
    if (!telemovelValido(form.telemovel)) return setErroForm('Indica um telemóvel português com 9 dígitos.');
    if (!emailValido(form.email)) return setErroForm('Indica um email válido.');
    if (form.bio.trim().length < 10) return setErroForm('Escreve uma apresentação com pelo menos 10 caracteres.');

    setAGuardar(true);
    const payload = {
      nome,
      distrito: form.distrito,
      cidade: form.cidade,
      telemovel: form.telemovel.trim(),
      email: form.email.trim(),
      anos_experiencia: form.anos_experiencia || null,
      bio: form.bio.trim(),
      instagram: normalizarInstagram(form.instagram),
      especialidades: form.especialidades,
      fotos: form.fotos,
      foto_url: form.fotos[0] ?? null,
    };

    const { error } = editId
      ? await supabase.from('barbeiros').update(payload).eq('id', editId).eq('user_id', user.id)
      : await supabase.from('barbeiros').insert({ ...payload, user_id: user.id });

    setAGuardar(false);
    if (error) { setErroForm('Não foi possível guardar: ' + error.message); return; }
    setFormAberto(false);
    carregar();
  }

  async function remover(b: Barbeiro) {
    if (!user || b.user_id !== user.id) return;
    if (!window.confirm('Remover o teu portefólio? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('barbeiros').delete().eq('id', b.id).eq('user_id', user.id);
    if (error) { window.alert('Não foi possível remover: ' + error.message); return; }
    setDetalhe(null);
    carregar();
  }

  const filtrada = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();
    return lista.filter((b) => {
      if (distrito !== 'Todos' && b.distrito !== distrito) return false;
      if (concelho !== 'Todos' && b.cidade !== concelho) return false;
      if (especialidade !== 'Todas' && !(b.especialidades ?? []).includes(especialidade)) return false;
      if (q && !`${b.nome} ${b.cidade} ${b.bio}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [lista, pesquisa, distrito, concelho, especialidade]);

  const filtrado = pesquisa !== '' || distrito !== 'Todos' || concelho !== 'Todos' || especialidade !== 'Todas';
  function limpar() {
    setPesquisa(''); setDistrito('Todos'); setConcelho('Todos'); setEspecialidade('Todas');
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl">Barbeiros</h1>
          <p className="text-muted mt-2 max-w-xl">
            Vê o trabalho de barbeiros de todo o país e contacta diretamente quem procuras.
          </p>
        </div>
        <button type="button" onClick={aoClicarCriar} className="btn btn-primary">
          {meuPerfil ? 'Editar o meu portefólio' : 'Criar o meu portefólio'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          type="search"
          aria-label="Pesquisar barbeiros"
          placeholder="Pesquisar por nome ou cidade"
          className="field-input w-full sm:w-64"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
        <DistritoConcelhoPicker
          allowTodos
          distrito={distrito}
          concelho={concelho}
          onDistritoChange={setDistrito}
          onConcelhoChange={setConcelho}
        />
        <select
          aria-label="Especialidade"
          className="field-input w-auto"
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
        >
          <option value="Todas">Todas as especialidades</option>
          {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : erroLista ? (
        <ErrorState onRetry={carregar} />
      ) : (
        <>
          <ResultsBar count={filtrada.length} singular="barbeiro" plural="barbeiros" filtrado={filtrado} onClear={limpar} />
          {filtrada.length === 0 ? (
            filtrado ? (
              <EmptyState
                title="Nenhum barbeiro com estes filtros."
                text="Experimenta alargar a zona ou limpar os filtros."
                action={<button type="button" onClick={limpar} className="btn btn-sm mt-1">Limpar filtros</button>}
              />
            ) : (
              <EmptyState
                title="Ainda não há portefólios."
                text="Sê o primeiro a criar o teu. É gratuito e demora poucos minutos."
                action={<button type="button" onClick={aoClicarCriar} className="btn btn-primary btn-sm mt-1">Criar o meu portefólio</button>}
              />
            )
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtrada.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setDetalhe(b)}
                  className="card text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                >
                  <div className="flex items-center gap-3">
                    <Avatar nome={b.nome} url={b.fotos?.[0] ?? b.foto_url} size={56} />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-lg leading-tight truncate">{b.nome}</p>
                      <p className="meta truncate">{b.cidade}{b.distrito ? `, ${b.distrito}` : ''}</p>
                    </div>
                  </div>
                  {formatarAnos(b.anos_experiencia) && <p className="meta">Experiência: {formatarAnos(b.anos_experiencia)}</p>}
                  {b.especialidades?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {b.especialidades.slice(0, 3).map((e) => <span key={e} className="tag">{e}</span>)}
                      {b.especialidades.length > 3 && <span className="tag">+{b.especialidades.length - 3}</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Detalhe */}
      {detalhe && (
        <Modal onClose={() => setDetalhe(null)}>
          <div className="flex items-center gap-4 mb-5 pr-8">
            <Avatar nome={detalhe.nome} url={detalhe.fotos?.[0] ?? detalhe.foto_url} size={72} />
            <div className="min-w-0">
              <h2 className="text-2xl leading-tight">{detalhe.nome}</h2>
              <p className="meta">{detalhe.cidade}{detalhe.distrito ? `, ${detalhe.distrito}` : ''}</p>
              {formatarAnos(detalhe.anos_experiencia) && <p className="meta">Experiência: {formatarAnos(detalhe.anos_experiencia)}</p>}
            </div>
          </div>

          {detalhe.especialidades?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {detalhe.especialidades.map((e) => <span key={e} className="tag">{e}</span>)}
            </div>
          )}

          <p className="text-sm whitespace-pre-line mb-5">{detalhe.bio}</p>

          {(detalhe.fotos?.length ?? 0) > 0 && (
            <div className="mb-5">
              <PhotoGrid
                fotos={detalhe.fotos ?? []}
                nome={detalhe.nome}
                onOpen={(i) => setLightbox({ fotos: detalhe.fotos ?? [], i, nome: detalhe.nome })}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <a className="btn btn-primary btn-sm" href={`tel:${detalhe.telemovel.replace(/\s/g, '')}`}>Ligar</a>
            {detalhe.email && <a className="btn btn-sm" href={`mailto:${detalhe.email}`}>Enviar email</a>}
            {detalhe.instagram && (
              <a className="btn btn-sm" href={`https://instagram.com/${detalhe.instagram}`} target="_blank" rel="noopener noreferrer">
                Instagram @{detalhe.instagram}
              </a>
            )}
          </div>
          <p className="meta mt-3">{detalhe.telemovel}{detalhe.email ? ` · ${detalhe.email}` : ''}</p>

          {user && detalhe.user_id === user.id && (
            <div className="flex gap-2 mt-5 pt-4 border-t border-line">
              <button type="button" className="btn btn-sm" onClick={() => abrirEdicao(detalhe)}>Editar</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => remover(detalhe)}>Remover</button>
            </div>
          )}
        </Modal>
      )}

      {lightbox && (
        <Lightbox
          fotos={lightbox.fotos}
          index={lightbox.i}
          alt={`Trabalho de ${lightbox.nome}`}
          onClose={() => setLightbox(null)}
          onIndex={(i) => setLightbox((l) => (l ? { ...l, i } : l))}
        />
      )}

      {/* Formulário */}
      {formAberto && (
        <Modal onClose={() => setFormAberto(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <h2 className="text-2xl pr-8">{editId ? 'Editar portefólio' : 'Criar portefólio'}</h2>

            <div>
              <label htmlFor="b-nome" className="field-label">Nome</label>
              <input id="b-nome" className="field-input" value={form.nome} maxLength={100}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="b-tel" className="field-label">Telemóvel</label>
                <input id="b-tel" type="tel" className="field-input" value={form.telemovel} maxLength={20}
                  onChange={(e) => setForm({ ...form, telemovel: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="b-email" className="field-label">Email</label>
                <input id="b-email" type="email" className="field-input" value={form.email} maxLength={120}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="b-anos" className="field-label">Experiência</label>
                <select id="b-anos" className="field-input" value={form.anos_experiencia}
                  onChange={(e) => setForm({ ...form, anos_experiencia: e.target.value })}>
                  <option value="">Não indicar</option>
                  {ANOS.map((a) => <option key={a} value={a}>{a === '1' ? '1 ano' : `${a} anos`}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="b-ig" className="field-label">Instagram (opcional)</label>
                <input id="b-ig" className="field-input" placeholder="@utilizador" value={form.instagram} maxLength={80}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
              </div>
            </div>

            <div>
              <span className="field-label">Especialidades</span>
              <div className="flex flex-wrap gap-2">
                {ESPECIALIDADES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    aria-pressed={form.especialidades.includes(e)}
                    onClick={() => toggleEsp(e)}
                    className={`chip ${form.especialidades.includes(e) ? 'on' : ''}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="b-bio" className="field-label">Apresentação</label>
              <textarea id="b-bio" className="field-input min-h-[110px]" value={form.bio} maxLength={1200}
                onChange={(e) => setForm({ ...form, bio: e.target.value })} required
                placeholder="Fala do teu percurso, do estilo de trabalho e do que procuras." />
            </div>

            <div>
              <span className="field-label">Fotografias do teu trabalho</span>
              <PhotoUploader fotos={form.fotos} onChange={(fotos) => setForm((f) => ({ ...f, fotos }))} />
            </div>

            {erroForm && <p role="alert" className="text-sm text-red">{erroForm}</p>}

            <button type="submit" disabled={aGuardar} className="btn btn-primary w-full">
              {aGuardar ? 'A guardar...' : editId ? 'Guardar alterações' : 'Publicar portefólio'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
