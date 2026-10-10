import Link from 'next/link';

const EMAIL = 'barberplaza@outlook.pt';

export default function Footer() {
  return (
    <footer className="mt-20 bg-white">
      <div className="checker" aria-hidden="true" />
      <div className="max-w-[1100px] mx-auto px-6 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-brand text-2xl tracking-wide mb-2">BARBERPLAZA</p>
          <p className="text-sm text-muted max-w-sm">
            Plataforma de emprego e formação para barbeiros e barbearias em Portugal.
            Gratuita para barbeiros e barbearias.
          </p>
        </div>

        <nav aria-label="Plataforma">
          <p className="font-display text-sm font-semibold text-ink mb-3">Plataforma</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/emprego" className="text-ink hover:text-red">Emprego</Link></li>
            <li><Link href="/barbeiros" className="text-ink hover:text-red">Barbeiros</Link></li>
            <li><Link href="/barbearias" className="text-ink hover:text-red">Barbearias</Link></li>
            <li><Link href="/formacao" className="text-ink hover:text-red">Formação</Link></li>
          </ul>
        </nav>

        <div>
          <p className="font-display text-sm font-semibold text-ink mb-3">Contacto e legal</p>
          <ul className="space-y-2 text-sm">
            <li><a href={`mailto:${EMAIL}`} className="text-ink hover:text-red">{EMAIL}</a></li>
            <li><Link href="/termos" className="text-ink hover:text-red">Termos de utilização</Link></li>
            <li><Link href="/privacidade" className="text-ink hover:text-red">Política de privacidade</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="max-w-[1100px] mx-auto px-6 py-4 text-xs text-muted">
          © {new Date().getFullYear()} BarberPlaza. Feito em Portugal para a comunidade de barbeiros.
        </p>
      </div>
    </footer>
  );
}
