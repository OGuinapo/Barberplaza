import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-line py-8 mt-8">
      <div className="max-w-[1100px] mx-auto px-6 flex justify-between items-center flex-wrap gap-3">
        <p className="font-mono text-[11px] text-muted">
          BARBERPLAZA — feito para a comunidade de barbeiros portugueses. Grátis durante a fase beta.
        </p>
        <div className="flex gap-4">
          <Link href="/privacidade" className="font-mono text-[11px] text-muted hover:text-ink">Privacidade</Link>
          <Link href="/termos" className="font-mono text-[11px] text-muted hover:text-ink">Termos</Link>
        </div>
      </div>
    </footer>
  );
}
