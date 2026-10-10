'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';
import type { Barbearia } from '@/lib/types';
import { normalizarInstagram, pedirLogin, telemovelValido, emailValido } from '@/lib/utils';
import Modal from '@/components/Modal';
import PhotoUploader from '@/components/PhotoUploader';
import DistritoConcelhoPicker from '@/components/DistritoConcelhoPicker';
import { Lightbox, PhotoGrid } from '@/components/Gallery';
import { EmptyState, ErrorState, ResultsBar, SkeletonGrid } from '@/components/ListUI';

type Form = {
  nome: string;
  distrito: string;
  cidade: string;
  morada: string;
  telemovel: string;
  email: string;
  sobre: string;
  instagram: string;
  fotos: string[];
};

const FORM_VAZIO: Form = {
  nome: '', distrito: '', cidade: '', morada: '', telemovel: '', email: '', sobre: '', instagram: '', fotos: [],
};

export default function BarbeariasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [lista, setLista] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroLista, setErroLista] = useState(false);

  const [pesquisa, setPesquisa] = useState('');
  const [distrito, setDistrito] = useState('Todos');
  const [concelho, setConcelho] = useState('Todos');

  const [detalhe, setDetalhe] = useState<Barbearia | null>(null);
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
      .from('barbearias')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) setErroLista(true);
    else setLista((data ?? []) as Barbearia[]);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNova = useCallback(() => {
    setEditId(null);
    setForm(FORM_VAZIO);
    setErroForm('');
    setFormAberto(true);
  }, []);

  function abrirEdicao(b: Barbearia) {
    setDetalhe(null);
    setEditId(b.id);
    setForm({
      nome: b.nome,
      distrito: b.distrito ?? '',
      cidade: b.cidade,
      morada: b.morada ?? '',
      telemovel: b.telemovel,
      email: b.email ?? '',
      sobre: b.sobre,
      instagram: b.instagram ?? '',
      fotos: b.fotos ?? (b.foto_url ? [b.foto_url] : []),
    });
    setErroForm('');
    setFormAberto(true);
  }

  // ?registar=1 -> abre o formulário (ou pede login) quando já sabemos quem é o utilizador.
  useEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('registar') !== '1') return;
    window.history.replaceState(null, '', '/barbearias');
    if (!user) { router.push(pedirLogin('/barbearias?registar=1')); return; }
    abrirNova();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  function aoClicarRegistar() {
    if (!user) { router.push(pedirLogin('/barbearias?registar=1')); return; }
    abrirNova();
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user || aGuardar) return;
    setErroForm('');

    const nome = form.nome.trim();
    if (nome.length < 2) return setErroForm('Indica o nome da barbearia.');
    if (!form.distrito || !form.cidade) return setErroForm('Escolhe o distrito e o concelho.');
    if (!telemovelValido(form.telemovel)) return setErroForm('Indica um telemóvel português com 9 dígitos.');
    if (!emailValido(form.email)) return setErroForm('Indica um email válido.');
    if (form.sobre.trim().length < 10) return setErroForm('Escreve uma descrição com pelo menos 10 caracteres.');

    setAGuardar(true);
    const payload = {
      nome,
      distrito: form.distrito,
      cidade: form.cidade,
      morada: form.morada.trim() || null,
      telemovel: form.telemovel.trim(),
      email: form.email.trim(),
      sobre: form.sobre.trim(),
      instagram: normalizarInstagram(form.instagram),
      fotos: form.fotos,
      foto_url: form.fotos[0] ?? null,
    };

    const { error } = editId
      ? await supabase.from('barbearias').update(payload).eq('id', editId).eq('user_id', user.id)
      : await supabase.from('barbearias').insert({ ...payload, user_id: user.id });

    setAGuardar(false);
    if (error) { setErroForm('Não foi possível guardar: ' + error.message); return; }
    setFormAberto(false);
    carregar();
  }

  async function remover(b: Barbearia) {
    if (!user || b.user_id !== user.id) return;
    if (!window.confirm('Remover esta barbearia? As vagas associadas também podem deixar de aparecer.')) return;
    const { error } = await supabase.from('barbearias').delete().eq('id', b.id).eq('user_id', user.id);
    if (error) { window.alert('Não foi possível remover: ' + error.message); return; }
    setDetalhe(null);
    carregar();
  }

  const filtrada = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();
    return lista.filter((b) => {
      if (distrito !== 'Todos' && b.distrito !== distrito) return false;
      if (concelho !== 'Todos' && b.cidade !== concelho) return false;
      if (q && !`${b.nome} ${b.cidade} ${b.sobre}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [lista, pesquisa, distrito, concelho]);

  const filtrado = pesquisa !== '' || distrito !== 'Todos' || concelho !== 'Todos';
  function limpar() { setPesquisa(''); setDistrito('Todos'); setConcelho('Todos'); }

  const minhas = user ? lista.filter((b) => b.user_id === user.id).length : 0;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow">Diretório</span>
          <h1 className="text-3xl sm:text-4xl">Barbearias</h1>
          <p className="text-muted mt-2 max-w-xl">
            Encontra barbearias por zona. Se tens uma, regista-a para publicares vagas.
          </p>
        </div>
        <button type="button" onClick={aoClicarRegistar} className="btn btn-primary">
          {minhas > 0 ? 'Registar outra barbearia' : 'Registar a minha barbearia'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          type="search"
          aria-label="Pesquisar barbearias"
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
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : erroLista ? (
        <ErrorState onRetry={carregar} />
      ) : (
        <>
          <ResultsBar count={filtrada.length} singular="barbearia" plural="barbearias" filtrado={filtrado} onClear={limpar} />
          {filtrada.length === 0 ? (
            filtrado ? (
              <EmptyState
                title="Nenhuma barbearia com estes filtros."
                text="Experimenta alargar a zona ou limpar os filtros."
                action={<button type="button" onClick={limpar} className="btn btn-sm mt-1">Limpar filtros</button>}
              />
            ) : (
              <EmptyState
                title="Ainda não há barbearias registadas."
                text="Regista a tua para aparecer aqui e publicar vagas gratuitamente."
                action={<button type="button" onClick={aoClicarRegistar} className="btn btn-primary btn-sm mt-1">Registar a minha barbearia</button>}
              />
            )
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtrada.map((b) => {
                const capa = b.fotos?.[0] ?? b.foto_url;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setDetalhe(b)}
                    className="card text-left cursor-pointer p-0 overflow-hidden gap-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                  >
                    <div className="relative aspect-[16/9] w-full bg-paper2">
                      {capa ? (
                        <NextImage
                          src={capa}
                          alt={`Fotografia de ${b.nome}`}
                          fill
                          sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">Sem fotografia</div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-1.5">
                      <p className="font-display font-semibold text-lg leading-tight">{b.nome}</p>
                      <p className="meta">{b.cidade}{b.distrito ? `, ${b.distrito}` : ''}</p>
                      <p className="text-sm text-muted line-clamp-2">{b.sobre}</p>
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
            <h2 className="text-2xl leading-tight">{detalhe.nome}</h2>
            <p className="meta mt-1">
              {detalhe.morada ? `${detalhe.morada}, ` : ''}{detalhe.cidade}{detalhe.distrito ? `, ${detalhe.distrito}` : ''}
            </p>
          </div>

          <p className="text-sm whitespace-pre-line mb-5">{detalhe.sobre}</p>

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
            <Link className="btn btn-sm" href={`/emprego`} onClick={() => setDetalhe(null)}>Ver vagas</Link>
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
          alt={`Fotografia de ${lightbox.nome}`}
          onClose={() => setLightbox(null)}
          onIndex={(i) => setLightbox((l) => (l ? { ...l, i } : l))}
        />
      )}

      {formAberto && (
        <Modal onClose={() => setFormAberto(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <h2 className="text-2xl pr-8">{editId ? 'Editar barbearia' : 'Registar barbearia'}</h2>

            <div>
              <label htmlFor="bb-nome" className="field-label">Nome da barbearia</label>
              <input id="bb-nome" className="field-input" value={form.nome} maxLength={100}
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

            <div>
              <label htmlFor="bb-morada" className="field-label">Morada (opcional)</label>
              <input id="bb-morada" className="field-input" value={form.morada} maxLength={160}
                onChange={(e) => setForm({ ...form, morada: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bb-tel" className="field-label">Telemóvel</label>
                <input id="bb-tel" type="tel" className="field-input" value={form.telemovel} maxLength={20}
                  onChange={(e) => setForm({ ...form, telemovel: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="bb-email" className="field-label">Email</label>
                <input id="bb-email" type="email" className="field-input" value={form.email} maxLength={120}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label htmlFor="bb-ig" className="field-label">Instagram (opcional)</label>
              <input id="bb-ig" className="field-input" placeholder="@barbearia" value={form.instagram} maxLength={80}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            </div>

            <div>
              <label htmlFor="bb-sobre" className="field-label">Sobre a barbearia</label>
              <textarea id="bb-sobre" className="field-input min-h-[110px]" value={form.sobre} maxLength={1200}
                onChange={(e) => setForm({ ...form, sobre: e.target.value })} required
                placeholder="Ambiente, serviços, equipa, horário." />
            </div>

            <div>
              <span className="field-label">Fotografias</span>
              <PhotoUploader fotos={form.fotos} onChange={(fotos) => setForm((f) => ({ ...f, fotos }))} />
            </div>

            {erroForm && <p role="alert" className="text-sm text-red">{erroForm}</p>}

            <button type="submit" disabled={aGuardar} className="btn btn-primary w-full">
              {aGuardar ? 'A guardar...' : editId ? 'Guardar alterações' : 'Registar barbearia'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
