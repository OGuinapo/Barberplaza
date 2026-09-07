'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function RegistarPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aceite, setAceite] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setMsg({ text: 'A password deve ter pelo menos 6 caracteres.', ok: false });
      return;
    }
    if (!aceite) {
      setMsg({ text: 'Tens de aceitar os Termos e a Política de Privacidade para criar conta.', ok: false });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setMsg({ text: error.message, ok: false }); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-[420px] mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl mb-3">Confirma o teu email</h1>
        <p className="text-sm text-muted">
          Enviámos um link de confirmação para <b>{email}</b>. Depois de confirmares, já podes entrar
          e criar o teu portefólio de barbeiro ou o perfil da tua barbearia.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto px-6 py-16">
      <h1 className="text-4xl mb-2">Criar conta</h1>
      <p className="text-sm text-muted mb-6">Uma conta serve para geres o teu portefólio de barbeiro e/ou o perfil da tua barbearia.</p>
      {msg && <div className="text-sm font-mono px-3 py-2.5 rounded-md mb-3 bg-[#f3d9d4] text-redDark">{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-3.5">
          <span className="field-label">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
        </label>
        <label className="block mb-3.5">
          <span className="field-label">Password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" />
        </label>
        <label className="flex items-start gap-2 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={aceite}
            onChange={(e) => setAceite(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-[#3a372f]">
            Li e aceito os <Link href="/termos" target="_blank" className="text-red font-semibold">Termos de Utilização</Link> e a{' '}
            <Link href="/privacidade" target="_blank" className="text-red font-semibold">Política de Privacidade</Link>.
          </span>
        </label>
        <button type="submit" disabled={loading} className="btn btn-red w-full justify-center">
          {loading ? 'A criar…' : 'Criar conta'}
        </button>
      </form>
      <p className="text-sm text-muted mt-5">
        Já tens conta? <Link href="/entrar" className="text-red font-semibold">Entra aqui</Link>.
      </p>
    </div>
  );
}
