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

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-brand text-2xl tracking-[0.06em]">
          <span className="w-2.5 h-7 rounded-[5px] overflow-hidden border border-ink pole-stripe pole-anim shrink-0" aria-hidden="true" />
          BARBERPLAZA
        </Link>

        {/* Navegação: ecrãs médios e grandes */}
        <nav className="hidden md:flex gap-1" aria-label="Principal">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={isActive(pathname, t.href) ? 'page' : undefined}
              className={`font-display text-[15px] font-medium px-3.5 py-2 rounded-full transition-colors ${
                isActive(pathname, t.href) ? 'text-ink bg-paper2' : 'text-muted hover:text-ink hover:bg-paper2'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex gap-2 items-center min-w-[150px] justify-end">
          {loading ? (
            <span className="block h-9 w-[150px]" aria-hidden="true" />
          ) : user ? (
            <>
              <span className="text-[13px] text-muted max-w-[170px] truncate" title={user.email ?? ''}>{user.email}</span>
              <button onClick={() => signOut()} className="btn btn-sm">Sair</button>
            </>
          ) : (
            <Link href="/entrar" className="btn btn-primary btn-sm">Entrar / Registar</Link>
          )}
        </div>

        {/* Botão hambúrguer: só telemóvel */}
        <button
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 shrink-0 rounded-lg hover:bg-paper2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          <span className={`block h-0.5 w-6 bg-ink rounded transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-ink rounded transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-ink rounded transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Painel do menu: só telemóvel, quando aberto */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-paper px-6 py-4">
          <nav className="flex flex-col gap-1 mb-4" aria-label="Principal">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-current={isActive(pathname, t.href) ? 'page' : undefined}
                className={`font-display text-base font-medium px-4 py-3 rounded-2xl ${
                  isActive(pathname, t.href) ? 'text-ink bg-paper2' : 'text-muted'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-line flex flex-col gap-2">
            {loading ? null : user ? (
              <>
                <span className="text-[13px] text-muted truncate">{user.email}</span>
                <button onClick={() => signOut()} className="btn w-full">Sair</button>
              </>
            ) : (
              <Link href="/entrar" className="btn btn-primary w-full">Entrar / Registar</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
