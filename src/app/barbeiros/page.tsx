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
            <p className="text-sm text-muted mb-5">Os teus dados ficam visíveis para todas as barbearias no BarberPlaza.</p>
            {msg && <div className="text-sm font-mono px-3 py-2.5 rounded-md mb-3 bg-[#f3d9d4] text-redDark">{msg.text}</div>}
            <label className="block mb-3.5">
              <span className="field-label">Nome completo</span>
              <input name="nome" className="field-input" placeholder="Ex: Rui Almeida" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Cidade</span>
                <select name="cidade" className="field-input">{CIDADES.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Anos de experiência</span>
                <input name="anos" className="field-input" placeholder="Ex: 5" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Telemóvel</span>
                <input name="telemovel" className="field-input" placeholder="9xx xxx xxx" />
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Email (opcional)</span>
                <input name="email" className="field-input" placeholder="tu@email.com" />
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
              <textarea name="bio" className="field-input min-h-[80px]" placeholder="Fala do teu percurso, estilo e o que procuras numa barbearia." />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Link de uma foto (opcional)</span>
              <input name="foto" className="field-input" placeholder="https://..." />
            </label>
            <button type="submit" className="btn btn-red w-full justify-center">Publicar portefólio</button>
          </form>
        </Modal>
      )}

      {verPerfil && (
        <Modal onClose={() => setVerPerfil(null)}>
          {verPerfil.foto_url ? (
            <div className="w-full h-40 rounded-xl bg-navy bg-cover bg-center mb-3.5" style={{ backgroundImage: `url('${verPerfil.foto_url}')` }} />
          ) : (
            <div className="w-[74px] h-[74px] rounded-full flex items-center justify-center font-display text-2xl text-white mb-3.5" style={{ background: colorFor(verPerfil.nome) }}>
              {initials(verPerfil.nome)}
            </div>
          )}
          <h2 className="text-3xl">{verPerfil.nome}</h2>
          <p className="text-sm text-muted mb-3">{verPerfil.cidade}{verPerfil.anos_experiencia ? ` · ${verPerfil.anos_experiencia} anos de experiência` : ''}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(verPerfil.especialidades ?? []).map((e) => <span key={e} className="tag">{e}</span>)}
          </div>
          <p className="text-sm text-[#3a372f]">{verPerfil.bio}</p>
          <div className="mt-4 pt-4 border-t border-line font-mono text-sm space-y-1">
            <div>📞 {verPerfil.telemovel}</div>
            {verPerfil.email && <div>✉️ {verPerfil.email}</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
