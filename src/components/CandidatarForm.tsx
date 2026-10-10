'use client';

import { useState } from 'react';

export default function CandidatarForm({
  vagaId,
  vagaTitulo,
  onSuccess,
}: {
  vagaId: string;
  vagaTitulo?: string;
  onSuccess?: () => void;
}) {
  const [nome, setNome] = useState('');
  const [contacto, setContacto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (aEnviar) return;
    setErro('');
    setAEnviar(true);
    try {
      const res = await fetch('/api/candidatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vagaId, nome, contacto, mensagem, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data?.erro ?? 'Não foi possível enviar a candidatura. Tenta novamente.');
        return;
      }
      setOk(true);
      onSuccess?.();
    } catch {
      setErro('Sem ligação. Verifica a internet e tenta novamente.');
    } finally {
      setAEnviar(false);
    }
  }

  if (ok) {
    return (
      <div className="py-4">
        <h3 className="text-xl mb-2">Candidatura enviada</h3>
        <p className="text-sm text-muted">
          A barbearia vai receber os teus dados e responde-te pelo contacto que indicaste.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <h3 className="text-xl">Candidatar</h3>
        {vagaTitulo && <p className="meta mt-1">{vagaTitulo}</p>}
      </div>

      <div>
        <label htmlFor="cand-nome" className="field-label">Nome</label>
        <input
          id="cand-nome"
          className="field-input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="cand-contacto" className="field-label">Telemóvel ou email</label>
        <input
          id="cand-contacto"
          className="field-input"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          required
          minLength={5}
          maxLength={120}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="cand-msg" className="field-label">Mensagem (opcional)</label>
        <textarea
          id="cand-msg"
          className="field-input min-h-[110px]"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          maxLength={1000}
          placeholder="Apresenta-te em poucas linhas: experiência, disponibilidade, link do portefólio."
        />
        <p className="meta mt-1 text-right">{mensagem.length}/1000</p>
      </div>

      {/* Campo isco para bots: escondido de pessoas */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-red">
          {erro}
        </p>
      )}

      <button type="submit" disabled={aEnviar} className="btn btn-primary w-full">
        {aEnviar ? 'A enviar...' : 'Enviar candidatura'}
      </button>
      <p className="meta">
        Os teus dados são partilhados apenas com a barbearia desta vaga.
      </p>
    </form>
  );
}
