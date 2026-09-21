'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CandidatarForm({
  vagaId,
  vagaTitulo,
  barbeariaEmail,
}: {
  vagaId: string;
  vagaTitulo: string;
  barbeariaEmail: string | null;
}) {
  const [enviado, setEnviado] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function enviar(form: FormData) {
    const nome = (form.get('nome') as string)?.trim();
    const contacto = (form.get('contacto') as string)?.trim();
    const mensagem = (form.get('mensagem') as string)?.trim();
    if (!nome || !contacto) {
      setMsg({ text: 'Indica o teu nome e um contacto (telemóvel ou email).', ok: false });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('candidaturas').insert({ vaga_id: vagaId, nome, contacto, mensagem });
    setLoading(false);
    if (error) { setMsg({ text: 'Algo correu mal: ' + error.message, ok: false }); return; }

    if (barbeariaEmail) {
      try {
        await fetch('/api/notificar-candidatura', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: barbeariaEmail, vagaTitulo, nome, contacto, mensagem }),
        });
      } catch {
        // notificação é best-effort — não bloqueia a candidatura
      }
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="bg-[#dfe9df] text-[#2e5a2e] text-sm font-mono px-4 py-3 rounded-md">
        Candidatura enviada! A barbearia vai poder ver os teus dados.
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); enviar(new FormData(e.currentTarget)); }} className="border-t border-line pt-6">
      <h2 className="text-xl font-body normal-case tracking-normal font-bold mb-3">Candidatar-me a esta vaga</h2>
      {msg && <div className="text-sm font-mono px-3 py-2.5 rounded-md mb-3 bg-[#f3d9d4] text-redDark">{msg.text}</div>}
      <label className="block mb-3.5">
        <span className="field-label">O teu nome</span>
        <input name="nome" className="field-input" placeholder="Nome completo" />
      </label>
      <label className="block mb-3.5">
        <span className="field-label">Contacto (telemóvel ou email)</span>
        <input name="contacto" className="field-input" placeholder="9xx xxx xxx ou email" />
      </label>
      <label className="block mb-3.5">
        <span className="field-label">Mensagem (opcional)</span>
        <textarea name="mensagem" className="field-input min-h-[80px]" placeholder="Uma breve apresentação para a barbearia." />
      </label>
      <button type="submit" disabled={loading} className="btn btn-red w-full justify-center">
        {loading ? 'A enviar…' : 'Enviar candidatura'}
      </button>
    </form>
  );
}
