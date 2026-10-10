'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';
import { TIPOS_VAGA, type Barbearia, type Vaga } from '@/lib/types';
import { pedirLogin, tempoRelativo } from '@/lib/utils';
import Modal from '@/components/Modal';
import CandidatarForm from '@/components/CandidatarForm';
import DistritoConcelhoPicker from '@/components/DistritoConcelhoPicker';
import { EmptyState, ErrorState, ResultsBar, SkeletonGrid } from '@/components/ListUI';

type FormVaga = {
  barbearia_id: string;
  titulo: string;
  tipo: string;
  distrito: string;
  cidade: string;
  descricao: string;
};

const FORM_VAZIO: FormVaga = { barbearia_id: '', titulo: '', tipo: TIPOS_VAGA[0], distrito: '', cidade: '', descricao: '' };

export default function EmpregoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [minhasBarbearias, setMinhasBarbearias] = useState<Pick<Barbearia, 'id' | 'nome' | 'cidade' | 'distrito'>[]>([]);
  const [barbeariasProntas, setBarbeariasProntas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erroLista, setErroLista] = useState(false);

  const [pesquisa, setPesquisa] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [distrito, setDistrito] = useState('Todos');
  const [concelho, setConcelho] = useState('Todos');

  const [aCandidatar, setACandidatar] = useState<Vaga | null>(null);

  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormVaga>(FORM_VAZIO);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErroLista(false);
    const { data, error } = await supabase
      .from('vagas')
      .select('*, barbearias(nome, user_id)')
      .order('criado_em', { ascending: false });
    if (error) setErroLista(true);
    else setVagas((data ?? []) as unknown as Vaga[]);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // As barbearias do utilizador (para publicar vagas e para o link das candidaturas)
  useEffect(() => {
    if (!user) { setMinhasBarbearias([]); setBarbeariasProntas(true); return; }
    setBarbeariasProntas(false);
    supabase
      .from('barbearias')
      .select('id, nome, cidade, distrito')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setMinhasBarbearias(data ?? []);
        setBarbeariasProntas(true);
      });
  }, [user]);

  const abrirPublicar = useCallback(() => {
    setForm({ ...FORM_VAZIO, barbearia_id: minhasBarbearias[0]?.id ?? '', distrito: minhasBarbearias[0]?.distrito ?? '', cidade: minhasBarbearias[0]?.cidade ?? '' });
    setErroForm('');
    setFormAberto(true);
  }, [minhasBarbearias]);

  function aoClicarPublicar() {
    if (!user) { router.push(pedirLogin('/emprego?publicar=1')); return; }
    abrirPublicar();
  }

  // ?publicar=1 -> abre o formulário depois de sabermos quem é o utilizador e as suas barbearias.
  const [paramTratado, setParamTratado] = useState(false);
  useEffect(() => {
    if (paramTratado || authLoading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('publicar') !== '1') { setParamTratado(true); return; }
    if (!user) { setParamTratado(true); router.push(pedirLogin('/emprego?publicar=1')); return; }
    if (!barbeariasProntas) return;
    setParamTratado(true);
    window.history.replaceState(null, '', '/emprego');
    abrirPublicar();
  }, [authLoading, user, barbeariasProntas, paramTratado, abrirPublicar, router]);

  function escolherBarbearia(id: string) {
    const b = minhasBarbearias.find((x) => x.id === id);
    setForm((f) => ({ ...f, barbearia_id: id, distrito: b?.distrito ?? f.distrito, cidade: b?.cidade ?? f.cidade }));
  }

  async function publicar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user || aGuardar) return;
    setErroForm('');
    if (!form.barbearia_id) return setErroForm('Escolhe a barbearia.');
    if (form.titulo.trim().length < 3) return setErroForm('Indica o título da vaga.');
    if (!form.distrito || !form.cidade) return setErroForm('Escolhe o distrito e o concelho.');
    if (form.descricao.trim().length < 10) return setErroForm('Descreve a vaga com pelo menos 10 caracteres.');

    setAGuardar(true);
    const { error } = await supabase.from('vagas').insert({
      barbearia_id: form.barbearia_id,
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      distrito: form.distrito,
      cidade: form.cidade,
      descricao: form.descricao.trim(),
    });
    setAGuardar(false);
    if (error) { setErroForm('Não foi possível publicar: ' + error.message); return; }
    setFormAberto(false);
    carregar();
  }

  async function remover(v: Vaga) {
    if (!user || v.barbearias?.user_id !== user.id) return;
    if (!window.confirm('Remover esta vaga? As candidaturas recebidas também serão apagadas.')) return;
    const { error } = await supabase.from('vagas').delete().eq('id', v.id);
    if (error) { window.alert('Não foi possível remover: ' + error.message); return; }
    carregar();
  }

  const filtrada = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();
    return vagas.filter((v) => {
      if (tipo !== 'Todos' && v.tipo !== tipo) return false;
      if (distrito !== 'Todos' && v.distrito !== distrito) return false;
      if (concelho !== 'Todos' && v.cidade !== concelho) return false;
      if (q && !`${v.titulo} ${v.barbearias?.nome ?? ''} ${v.cidade} ${v.descricao}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [vagas, pesquisa, tipo, distrito, concelho]);

  const filtrado = pesquisa !== '' || tipo !== 'Todos' || distrito !== 'Todos' || concelho !== 'Todos';
  function limpar() { setPesquisa(''); setTipo('Todos'); setDistrito('Todos'); setConcelho('Todos'); }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl">Emprego para barbeiros</h1>
          <p className="text-muted mt-2 max-w-xl">
            Vagas publicadas por barbearias de todo o país. Candidata-te sem criar conta.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {minhasBarbearias.length > 0 && (
            <Link href="/emprego/candidaturas" className="btn">Candidaturas recebidas</Link>
          )}
          <button type="button" onClick={aoClicarPublicar} className="btn btn-primary">Publicar vaga</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          type="search"
          aria-label="Pesquisar vagas"
          placeholder="Pesquisar vagas"
          className="field-input w-full sm:w-56"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
        <select aria-label="Tipo de vaga" className="field-input w-auto" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="Todos">Todos os tipos</option>
          {TIPOS_VAGA.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <DistritoConcelhoPicker
          allowTodos
          distrito={distrito}
          concelho={concelho}
          onDistritoChange={setDistrito}
          onConcelhoChange={setConcelho}
        />
      </div>

      <p className="meta mb-5 max-w-2xl">
        <strong className="text-ink">Cadeira livre (aluguer):</strong> trabalhas por conta própria na barbearia e pagas
        um valor pela cadeira, ficando com os teus clientes e os teus ganhos.
      </p>

      {loading ? (
        <SkeletonGrid />
      ) : erroLista ? (
        <ErrorState onRetry={carregar} />
      ) : (
        <>
          <ResultsBar count={filtrada.length} singular="vaga" plural="vagas" filtrado={filtrado} onClear={limpar} />
          {filtrada.length === 0 ? (
            filtrado ? (
              <EmptyState
                title="Nenhuma vaga com estes filtros."
                text="Experimenta alargar a zona ou limpar os filtros."
                action={<button type="button" onClick={limpar} className="btn btn-sm mt-1">Limpar filtros</button>}
              />
            ) : (
              <EmptyState
                title="Ainda não há vagas publicadas."
                text="Tens uma barbearia? Publica a primeira vaga gratuitamente."
                action={<button type="button" onClick={aoClicarPublicar} className="btn btn-primary btn-sm mt-1">Publicar vaga</button>}
              />
            )
          ) : (
            <ul className="space-y-3">
              {filtrada.map((v) => (
                <li key={v.id}>
                  <article className="job">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="tag">{v.tipo}</span>
                        <span className="meta">{tempoRelativo(v.criado_em)}</span>
                      </div>
                      <h2 className="text-xl leading-snug">
                        <Link href={`/emprego/${v.id}`} className="hover:text-red transition-colors">{v.titulo}</Link>
                      </h2>
                      <p className="meta mt-0.5">
                        {v.barbearias?.nome ?? 'Barbearia'} · {v.cidade}{v.distrito ? `, ${v.distrito}` : ''}
                      </p>
                      <p className="text-sm text-muted line-clamp-2 mt-2 max-w-2xl">{v.descricao}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {user && v.barbearias?.user_id === user.id && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => remover(v)}>Remover</button>
                      )}
                      <Link href={`/emprego/${v.id}`} className="btn btn-sm">Ver vaga</Link>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setACandidatar(v)}>Candidatar</button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {aCandidatar && (
        <Modal onClose={() => setACandidatar(null)}>
          <CandidatarForm vagaId={aCandidatar.id} vagaTitulo={aCandidatar.titulo} />
        </Modal>
      )}

      {formAberto && (
        <Modal onClose={() => setFormAberto(false)}>
          {minhasBarbearias.length === 0 ? (
            <div className="py-2">
              <h2 className="text-2xl mb-2 pr-8">Primeiro, regista a tua barbearia</h2>
              <p className="text-sm text-muted mb-5">
                As vagas ficam associadas a uma barbearia. O registo é gratuito e demora um minuto.
              </p>
              <Link href="/barbearias?registar=1" className="btn btn-primary">Registar barbearia</Link>
            </div>
          ) : (
            <form onSubmit={publicar} className="space-y-4">
              <h2 className="text-2xl pr-8">Publicar vaga</h2>

              <div>
                <label htmlFor="v-barb" className="field-label">Barbearia</label>
                <select id="v-barb" className="field-input" value={form.barbearia_id} onChange={(e) => escolherBarbearia(e.target.value)} required>
                  {minhasBarbearias.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="v-titulo" className="field-label">Título</label>
                <input id="v-titulo" className="field-input" value={form.titulo} maxLength={120}
                  placeholder="Ex.: Barbeiro com experiência em degradê"
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              </div>

              <div>
                <label htmlFor="v-tipo" className="field-label">Tipo</label>
                <select id="v-tipo" className="field-input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS_VAGA.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {form.tipo.startsWith('Cadeira livre') && (
                  <p className="meta mt-1.5">O barbeiro trabalha por conta própria e paga um valor pela cadeira.</p>
                )}
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
                <label htmlFor="v-desc" className="field-label">Descrição</label>
                <textarea id="v-desc" className="field-input min-h-[130px]" value={form.descricao} maxLength={2000}
                  placeholder="Funções, horário, o que oferecem e o que procuram."
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
              </div>

              {erroForm && <p role="alert" className="text-sm text-red">{erroForm}</p>}

              <button type="submit" disabled={aGuardar} className="btn btn-primary w-full">
                {aGuardar ? 'A publicar...' : 'Publicar vaga'}
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
