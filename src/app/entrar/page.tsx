'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setMsg({ text: 'Email ou password incorretos, ou conta ainda por confirmar.', ok: false }); return; }
    const next = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null;
    router.push(next || '/');
    router.refresh();
  }

  return (
    <div className="max-w-[420px] mx-auto px-6 py-16">
      <h1 className="text-4xl mb-2">Entrar</h1>
      <p className="text-sm text-muted mb-6">Entra na tua conta para geres o teu portefólio ou a tua barbearia.</p>
      {msg && <div className="text-sm font-mono px-3 py-2.5 rounded-md mb-3 bg-[#f3d9d4] text-redDark">{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-3.5">
          <span className="field-label">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
        </label>
        <label className="block mb-3.5">
          <span className="field-label">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" />
        </label>
        <button type="submit" disabled={loading} className="btn btn-red w-full justify-center">
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
      <p className="text-sm text-muted mt-5">
        Ainda não tens conta? <Link href="/registar" className="text-red font-semibold">Cria uma aqui</Link>.
      </p>
    </div>
  );
}
