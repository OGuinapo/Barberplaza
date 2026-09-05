'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CIDADES, type Barbearia, type Vaga } from '@/lib/types';
import Modal from '@/components/Modal';

export default function BarbeariasPage() {
  const [lista, setLista] = useState<Barbearia[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCidade, setFiltroCidade] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registar')) {
      setModalOpen(true);
    }
  }, []);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [verPerfil, setVerPerfil] = useState<Barbearia | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: b }, { data: v }] = await Promise.all([
      supabase.from('barbearias').select('*').order('criado_em', { ascending: false }),
      supabase.from('vagas').select('id, barbearia_id, titulo, tipo'),
    ]);
    setLista(b ?? []);
    setVagas((v as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remover(id: string) {
    if (!confirm('Remover esta barbearia? As vagas associadas também serão removidas.')) return;
    await supabase.from('barbearias').delete().eq('id', id);
    setLista((cur) => cur.filter((x) => x.id !== id));
  }

  async function registar(form: FormData) {
    const nome = (form.get('nome') as string)?.trim();
    const cidade = form.get('cidade') as string;
    const morada = (form.get('morada') as string)?.trim() || null;
    const telemovel = (form.get('telemovel') as string)?.trim();
    const email = (form.get('email') as string)?.trim() || null;
    const sobre = (form.get('sobre') as string)?.trim();
    const foto_url = (form.get('foto') as string)?.trim() || null;

    if (!nome || !cidade || !telemovel || !sobre) {
      setMsg({ text: 'Preenche nome, cidade, telemóvel e uma breve descrição.', ok: false });
      return;
    }
    const { error } = await supabase.from('barbearias').insert({ nome, cidade, morada, telemovel, email, sobre, foto_url });
    if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }
    setModalOpen(false); setMsg(null);
    load();
  }

  const listaFiltrada = lista.filter((b) => filtroCidade === 'Todas' || b.cidade === filtroCidade);
  const vagasDe = (id: string) => vagas.filter((v) => v.barbearia_id === id);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-6">
        <div>
          <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Estabelecimentos</span>
          <h2 className="text-3xl">Barbearias em Portugal</h2>
        </div>
        <button className="btn btn-red" onClick={() => setModalOpen(true)}>Registar barbearia</button>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-6">
        <select className="field-input w-auto font-mono text-xs uppercase" value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)}>
          <option value="Todas">Todas as cidades</option>
          {CIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted text-center py-16">A carregar barbearias…</p>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-16 border-[1.5px] border-dashed border-line rounded-xl">
          <h3 className="text-2xl mb-2">Ainda não há barbearias aqui</h3>
          <p className="text-sm text-muted mb-4">Regista a tua barbearia e começa a publicar vagas.</p>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Registar barbearia</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFiltrada.map((b) => {
            const n = vagasDe(b.id).length;
            return (
              <div key={b.id} className="card">
                <div
                  className="h-[90px] rounded-lg bg-navy bg-cover bg-center"
                  style={b.foto_url ? { backgroundImage: `url('${b.foto_url}')` } : undefined}
                />
                <h4 className="font-bold text-base">{b.nome}</h4>
                <div className="font-mono text-[11px] text-muted">{b.cidade}{b.morada ? ` · ${b.morada}` : ''}</div>
                <p className="text-sm text-[#4a4536] line-clamp-3">{b.sobre}</p>
                <span className="tag w-fit">{n} vaga{n === 1 ? '' : 's'} aberta{n === 1 ? '' : 's'}</span>
                <div className="flex gap-2 mt-1">
                  <button className="btn btn-primary btn-sm" onClick={() => setVerPerfil(b)}>Ver perfil</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remover(b.id)}>Remover</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); setMsg(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); registar(new FormData(e.currentTarget)); }}>
            <h2 className="text-3xl mb-1">Registar barbearia</h2>
            <p className="text-sm text-muted mb-5">O teu perfil fica visível para todos os barbeiros no BarberPlaza.</p>
            {msg && <div className="text-sm font-mono px-3 py-2.5 rounded-md mb-3 bg-[#f3d9d4] text-redDark">{msg.text}</div>}
            <label className="block mb-3.5">
              <span className="field-label">Nome da barbearia</span>
              <input name="nome" className="field-input" placeholder="Ex: Barbearia Central" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Cidade</span>
                <select name="cidade" className="field-input">{CIDADES.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Morada (opcional)</span>
                <input name="morada" className="field-input" placeholder="Rua, nº" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block mb-3.5">
                <span className="field-label">Telemóvel</span>
                <input name="telemovel" className="field-input" placeholder="9xx xxx xxx" />
              </label>
              <label className="block mb-3.5">
                <span className="field-label">Email (opcional)</span>
                <input name="email" className="field-input" placeholder="geral@barbearia.pt" />
              </label>
            </div>
            <label className="block mb-3.5">
              <span className="field-label">Sobre a barbearia</span>
              <textarea name="sobre" className="field-input min-h-[80px]" placeholder="Ambiente, equipa, tipo de clientela, o que procuras num barbeiro." />
            </label>
            <label className="block mb-3.5">
              <span className="field-label">Link de uma foto de capa (opcional)</span>
              <input name="foto" className="field-input" placeholder="https://..." />
            </label>
            <button type="submit" className="btn btn-primary w-full justify-center">Publicar perfil</button>
          </form>
        </Modal>
      )}

      {verPerfil && (
        <Modal onClose={() => setVerPerfil(null)}>
          {verPerfil.foto_url && (
            <div className="w-full h-40 rounded-xl bg-navy bg-cover bg-center mb-3.5" style={{ backgroundImage: `url('${verPerfil.foto_url}')` }} />
          )}
          <h2 className="text-3xl">{verPerfil.nome}</h2>
          <p className="text-sm text-muted mb-3">{verPerfil.cidade}{verPerfil.morada ? ` · ${verPerfil.morada}` : ''}</p>
          <p className="text-sm text-[#3a372f]">{verPerfil.sobre}</p>
          <div className="mt-4 pt-4 border-t border-line font-mono text-sm space-y-1">
            <div>📞 {verPerfil.telemovel}</div>
            {verPerfil.email && <div>✉️ {verPerfil.email}</div>}
          </div>
          {vagasDe(verPerfil.id).length > 0 && (
            <div className="mt-4">
              <span className="field-label">Vagas abertas</span>
              <div className="flex flex-col gap-2">
                {vagasDe(verPerfil.id).map((v) => (
                  <div key={v.id} className="border border-line rounded-lg px-3 py-2.5">
                    <b className="text-sm">{v.titulo}</b><br />
                    <span className="font-mono text-[11px] text-muted">{v.tipo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
