'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';

const TABS = [
  { href: '/', label: 'Início' },
  { href: '/emprego', label: 'Emprego' },
  { href: '/barbeiros', label: 'Barbeiros' },
  { href: '/barbearias', label: 'Barbearias' },
  { href: '/formacao', label: 'Formação' },
];

export default function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-line">
      <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-2xl tracking-wide">
          <div className="w-2.5 h-7 rounded-[5px] overflow-hidden border border-ink pole-stripe pole-anim shrink-0" />
          BARBERPLAZA
        </Link>

        {/* Navegação — visível só em ecrãs médios/grandes */}
        <nav className="hidden md:flex gap-1">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`font-mono text-xs tracking-wide uppercase font-semibold px-3 py-2.5 rounded-md ${
                pathname === t.href ? 'text-ink bg-paper2' : 'text-muted hover:text-ink hover:bg-paper2'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex gap-2 items-center">
          {loading ? null : user ? (
            <>
              <span className="font-mono text-[11px] text-muted">{user.email}</span>
              <button onClick={() => signOut()} className="btn btn-sm">Sair</button>
            </>
          ) : (
            <Link href="/entrar" className="btn btn-primary">Entrar / Registar</Link>
          )}
        </div>

        {/* Botão hambúrguer — visível só em telemóvel */}
        <button
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 shrink-0"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <span className={`block h-0.5 w-6 bg-ink rounded transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-ink rounded transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-ink rounded transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Painel do menu — só em telemóvel, quando aberto */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-paper px-6 py-4">
          <nav className="flex flex-col gap-1 mb-4">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`font-mono text-sm tracking-wide uppercase font-semibold px-3 py-3 rounded-md ${
                  pathname === t.href ? 'text-ink bg-paper2' : 'text-muted'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-line flex flex-col gap-2">
            {loading ? null : user ? (
              <>
                <span className="font-mono text-[11px] text-muted">{user.email}</span>
                <button onClick={() => signOut()} className="btn w-full justify-center">Sair</button>
              </>
            ) : (
              <Link href="/entrar" className="btn btn-primary w-full justify-center">Entrar / Registar</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
