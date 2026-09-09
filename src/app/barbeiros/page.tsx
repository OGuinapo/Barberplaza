'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';
import { ESPECIALIDADES, type Barbeiro } from '@/lib/types';
import Modal from '@/components/Modal';
import DistritoConcelhoPicker from '@/components/DistritoConcelhoPicker';
import PhotoUploader from '@/components/PhotoUploader';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
const AVATAR_COLORS = ['#a3392b', '#2b3a4a', '#8a6a28', '#5c6b4f', '#6d4a5c'];
function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function capa(b: Barbeiro) {
  return (b.fotos && b.fotos[0]) || b.foto_url || null;
}

export default function BarbeirosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [lista, setLista] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDistrito, setFiltroDistrito] = useState('Todos');
  const [filtroConcelho, setFiltroConcelho] = useState('Todos');
  const [filtroEsp, setFiltroEsp] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);

  const [formDistrito, setFormDistrito] = useState('');
  const [formConcelho, setFormConcelho] = useState('');
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [fotos, setFotos] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [verPerfil, setVerPerfil] = useState<Barbeiro | null>(null);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('barbeiros').select('*').order('criado_em', { ascending: false });
    setLista(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const meuPerfil = user ? lista.find((b) => b.user_id === user.id) ?? null : null;

  function abrirModal() {
    if (authLoading) return;
    if (!user) { router.push('/entrar?next=/barbeiros'); return; }
    if (meuPerfil) {
      setFormDistrito(meuPerfil.distrito ?? '');
      setFormConcelho(meuPerfil.cidade ?? '');
      setSelecionadas(meuPerfil.especialidades ?? []);
      setFotos(meuPerfil.fotos?.length ? meuPerfil.fotos : (meuPerfil.foto_url ? [meuPerfil.foto_url] : []));
    } else {
      setFormDistrito(''); setFormConcelho(''); setSelecionadas([]); setFotos([]);
    }
    setModalOpen(true);
  }

  async function remover(id: string) {
    if (!confirm('Remover este portefólio? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('barbeiros').delete().eq('id', id);
    if (error) { alert('Não foi possível remover: ' + error.message); return; }
    setLista((cur) => cur.filter((x) => x.id !== id));
  }

  async function guardar(form: FormData) {
    if (!user) return;
    const nome = (form.get('nome') as string)?.trim();
    const distrito = form.get('distrito') as string;
    const cidade = form.get('cidade') as string;
    const telemovel = (form.get('telemovel') as string)?.trim();
    const email = (form.get('email') as string)?.trim();
    const anos_experiencia = (form.get('anos') as string)?.trim() || null;
    const bio = (form.get('bio') as string)?.trim();
    let instagram = (form.get('instagram') as string)?.trim() || null;
    if (instagram) {
      instagram = instagram
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/^@/, '')
        .replace(/\/$/, '');
    }

    if (!nome || !distrito || !cidade || !telemovel || !email || !bio) {
      setMsg({ text: 'Preenche nome, distrito, concelho, telemóvel, email e uma breve descrição.', ok: false });
      return;
    }

    const payload = {
      nome, cidade, distrito, telemovel, email, anos_experiencia, bio, instagram,
      especialidades: selecionadas,
      fotos, foto_url: fotos[0] ?? null,
    };

    if (meuPerfil) {
      const { data, error } = await supabase.from('barbeiros').update(payload).eq('id', meuPerfil.id).select().single();
      if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
      setLista((cur) => cur.map((b) => (b.id === meuPerfil.id ? (data as Barbeiro) : b)));
    } else {
      const { data, error } = await supabase.from('barbeiros').insert({ ...payload, user_id: user.id }).select().single();
      if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
      setLista((cur) => [data as Barbeiro, ...cur]);
    }
    setModalOpen(false); setMsg(null);
  }

  const pesquisaAtiva = filtroDistrito !== 'Todos';
  const listaFiltrada = pesquisaAtiva ? lista.filter(
    (b) => (filtroDistrito === 'Todos' || b.distrito === filtroDistrito) &&
           (filtroConcelho === 'Todos' || b.cidade === filtroConcelho) &&
           (filtroEsp === 'Todas' || b.especialidades?.includes(filtroEsp))
  ) : [];

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-6">
        <div>
          <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Talento</span>
          <h2 className="text-3xl">Portefólios de barbeiros</h2>
        </div>
        <button className="btn btn-red" onClick={abrirModal}>
          {meuPerfil ? 'Editar o meu portefólio' : 'Criar o meu portefólio'}
        </button>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-6">
        <DistritoConcelhoPicker
          distrito={filtroDistrito}
          concelho={filtroConcelho}
          onDistritoChange={setFiltroDistrito}
          onConcelhoChange={setFiltroConcelho}
          allowTodos
        />
        <select className="field-input w-auto font-mono text-xs uppercase" value={filtroEsp} onChange={(e) => setFiltroEsp(e.target.value)}>
          <option value="Todas">Todas as especialidades</option>
          {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted text-center py-16">A carregar barbeiros…</p>
      ) : !pesquisaAtiva ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Escolhe uma localização</h3>
          <p className="text-sm text-muted">Seleciona o distrito acima (e opcionalmente o concelho) para veres os barbeiros dessa zona.</p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Ainda não há barbeiros aqui</h3>
          <p className="text-sm text-muted mb-4">Cria o primeiro portefólio e aparece para as barbearias desta zona.</p>
          <button className="btn btn-primary" onClick={abrirModal}>Criar portefólio</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFiltrada.map((b) => {
            const isMine = user && b.user_id === user.id;
            const foto = capa(b);
            return (
              <div key={b.id} className="card">
                <div className="flex gap-3 items-center">
                  <div
                    className="w-[54px] h-[54px] rounded-full shrink-0 flex items-center justify-center font-display text-xl text-white border-2 border-ink bg-cover bg-center"
                    style={foto ? { backgroundImage: `url('${foto}')`, color: 'transparent' } : { background: colorFor(b.nome) }}
                  >
                    {!foto && initials(b.nome)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{b.nome} {isMine && <span className="tag ml-1">Tu</span>}</h4>
                    <div className="font-mono text-[11px] text-muted">{b.cidade}{b.distrito ? `, ${b.distrito}` : ''}{b.anos_experiencia ? ` · ${b.anos_experiencia} anos exp.` : ''}</div>
                  </div>
                </div>
                <p className="text-sm text-[#4a4536] line-clamp-3">{b.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(b.especialidades ?? []).slice(0, 3).map((e) => <span key={e} className="tag">{e}</span>)}
                </div>
                <div className="flex gap-2 mt-1">
                  <button className="btn btn-primary btn-sm" onClick={() => setVerPerfil(b)}>Ver perfil</button>
                  {isMine && <button className="btn btn-sm" onClick={abrirModal}>Editar</button>}
                  {isMine && <button className="btn btn-danger btn-sm" onClick={() => remover(b.id)}>Remover</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); setMsg(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); guardar(new FormData(e.currentTarget)); }}>
            <h2 className="text-3xl mb-1">{meuPerfil ? 'Editar portefólio' : 'Criar portefólio'}</h2>
            <p className="text-sm text-muted mb-5">Os teus dados ficam visíveis para todas as barbearias no BarberPlaza.</p>
            {msg && <div className="text-sm font-mono px-3 py-2.5 rounded-md mb-3 bg-[#f3d9d4] text-redDark">{msg.text}</div>}
            <label className="block mb-3.5">
              <span className="field-label">Nome completo</span>
              <input name="nome" defaultValue={meuPerfil?.nome} className="field-input" placeholder="Ex: Rui Almeida" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Distrito</span>
                <DistritoConcelhoPicker
                  distrito={formDistrito} concelho={formConcelho}
                  onDistritoChange={setFormDistrito} onConcelhoChange={setFormConcelho}
                  distritoName="distrito" concelhoName="cidade"
                  className="field-input"
                />
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Anos de experiência</span>
                <input name="anos" defaultValue={meuPerfil?.anos_experiencia ?? ''} className="field-input" placeholder="Ex: 5" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Telemóvel</span>
                <input name="telemovel" defaultValue={meuPerfil?.telemovel} className="field-input" placeholder="9xx xxx xxx" />
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Email</span>
                <input name="email" type="email" defaultValue={meuPerfil?.email ?? user?.email ?? ''} className="field-input" placeholder="tu@email.com" />
              </label>
            </div>
            <label className="block mb-3.5">
              <span className="field-label">Especialidades</span>
              <div className="flex flex-wrap gap-2">
                {ESPECIALIDADES.map((e) => (
                  <span
                    key={e}
                    className={`chip ${selecionadas.includes(e) ? 'on' : ''}`}
                    onClick={() => setSelecionadas((cur) => cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e])}
                  >
                    {e}
                  </span>
                ))}
              </div>
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Sobre ti</span>
              <textarea name="bio" defaultValue={meuPerfil?.bio} className="field-input min-h-[80px]" placeholder="Fala do teu percurso, estilo e o que procuras numa barbearia." />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Instagram (opcional)</span>
              <input name="instagram" defaultValue={meuPerfil?.instagram ?? ''} className="field-input" placeholder="@teuhandle" />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Fotos do portefólio</span>
              <PhotoUploader fotos={fotos} onChange={setFotos} />
            </label>
            <button type="submit" className="btn btn-red w-full justify-center">
              {meuPerfil ? 'Guardar alterações' : 'Publicar portefólio'}
            </button>
          </form>
        </Modal>
      )}

      {verPerfil && (
        <Modal onClose={() => setVerPerfil(null)}>
          {verPerfil.fotos && verPerfil.fotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              {verPerfil.fotos.map((url) => (
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
          ) : (
            <div className="w-[74px] h-[74px] rounded-full flex items-center justify-center font-display text-2xl text-white mb-3.5" style={{ background: colorFor(verPerfil.nome) }}>
              {initials(verPerfil.nome)}
            </div>
          )}
          <h2 className="text-3xl">{verPerfil.nome}</h2>
          <p className="text-sm text-muted mb-3">{verPerfil.cidade}{verPerfil.distrito ? `, ${verPerfil.distrito}` : ''}{verPerfil.anos_experiencia ? ` · ${verPerfil.anos_experiencia} anos de experiência` : ''}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(verPerfil.especialidades ?? []).map((e) => <span key={e} className="tag">{e}</span>)}
          </div>
          <p className="text-sm text-[#3a372f]">{verPerfil.bio}</p>
          <div className="mt-4 pt-4 border-t border-line font-mono text-sm space-y-1">
            <div>📞 {verPerfil.telemovel}</div>
            {verPerfil.email && <div>✉️ {verPerfil.email}</div>}
            {verPerfil.instagram && (
              <div>
                📷 <a href={`https://instagram.com/${verPerfil.instagram}`} target="_blank" rel="noopener" className="text-red font-semibold">@{verPerfil.instagram}</a>
              </div>
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
