'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Início' },
  { href: '/emprego', label: 'Emprego' },
  { href: '/barbeiros', label: 'Barbeiros' },
  { href: '/barbearias', label: 'Barbearias' },
  { href: '/formacao', label: 'Formação' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-line">
      <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2.5 font-display text-2xl tracking-wide">
          <div className="w-2.5 h-8 rounded-[5px] overflow-hidden border border-ink pole-stripe pole-anim" />
          <div>
            BARBERPLAZA
            <small className="block font-mono text-[9px] tracking-[0.14em] text-red font-semibold -mt-0.5">
              PORTUGAL · BETA
            </small>
          </div>
        </Link>

        <nav className="flex gap-1 flex-wrap">
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

        <div className="flex gap-2">
          <Link href="/barbeiros?registar=1" className="btn">Sou barbeiro</Link>
          <Link href="/barbearias?registar=1" className="btn btn-primary">Sou barbearia</Link>
        </div>
      </div>
    </header>
  );
}
