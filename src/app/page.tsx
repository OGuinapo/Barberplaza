import Link from 'next/link';

const PASSOS = [
  { n: '01', titulo: 'Cria o teu perfil', texto: 'Barbeiros criam um portefólio com fotos. Barbearias registam o espaço e a equipa.' },
  { n: '02', titulo: 'Encontra ou publica', texto: 'Filtra vagas por distrito e concelho, ou publica uma vaga em poucos minutos.' },
  { n: '03', titulo: 'Fala diretamente', texto: 'O contacto é feito fora da plataforma, por telemóvel ou email. Sem intermediários.' },
];

export default function Home() {
  return (
    <div className="max-w-[1100px] mx-auto px-6">
      {/* Hero */}
      <section className="py-16 md:py-24 flex flex-col md:flex-row md:items-center gap-10">
        <div className="pole-stripe pole-anim rounded-full shrink-0 w-full h-3.5 md:w-3.5 md:h-60 border border-ink/80" aria-hidden="true" />
        <div>
          <p className="inline-flex items-center gap-2 text-[13px] font-medium text-ink bg-white border border-line rounded-full px-3.5 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-red" aria-hidden="true" />
            Gratuito durante o beta
          </p>
          <h1 className="font-brand font-normal uppercase tracking-[0.02em] leading-[0.95] text-6xl md:text-8xl">
            O centro de emprego
            <br />
            <span className="text-red">dos barbeiros.</span>
          </h1>
          <p className="text-lg text-muted max-w-xl mt-6 leading-relaxed">
            Vagas, portefólios e formação para barbeiros e barbearias em Portugal. Sem comissões e sem subscrições.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/barbeiros?registar=1" className="btn btn-red">Sou barbeiro</Link>
            <Link href="/barbearias?registar=1" className="btn btn-primary">Sou barbearia</Link>
            <Link href="/emprego" className="btn">Ver vagas</Link>
          </div>
        </div>
      </section>

      {/* Como funciona: é mesmo uma sequência, por isso leva números */}
      <section className="py-14 border-t border-line">
        <h2 className="font-brand font-normal uppercase tracking-[0.02em] text-5xl mb-10">Como funciona</h2>
        <ol className="grid gap-10 md:grid-cols-3">
          {PASSOS.map((p) => (
            <li key={p.n}>
              <span className="font-brand text-5xl text-red leading-none">{p.n}</span>
              <h3 className="text-xl mt-3 mb-1.5">{p.titulo}</h3>
              <p className="text-[15px] text-muted leading-relaxed max-w-xs">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Escolhe o teu caminho */}
      <section className="py-14 border-t border-line">
        <h2 className="font-brand font-normal uppercase tracking-[0.02em] text-5xl mb-10">Escolhe o teu caminho</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="bg-white border border-line rounded-4xl p-7 flex flex-col gap-3">
            <div className="pole-stripe h-2 w-16 rounded-full border border-ink/70" aria-hidden="true" />
            <h3 className="font-brand font-normal uppercase tracking-[0.02em] text-4xl mt-2">Sou barbeiro</h3>
            <p className="text-[15px] text-muted flex-1 leading-relaxed">Mostra o teu trabalho e candidata-te a vagas em todo o país.</p>
            <Link href="/barbeiros?registar=1" className="btn btn-red self-start mt-2">Criar portefólio</Link>
          </div>
          <div className="bg-white border border-line rounded-4xl p-7 flex flex-col gap-3">
            <div className="pole-stripe h-2 w-16 rounded-full border border-ink/70" aria-hidden="true" />
            <h3 className="font-brand font-normal uppercase tracking-[0.02em] text-4xl mt-2">Sou barbearia</h3>
            <p className="text-[15px] text-muted flex-1 leading-relaxed">Regista o teu espaço, publica vagas e recebe candidaturas.</p>
            <Link href="/barbearias?registar=1" className="btn btn-primary self-start mt-2">Registar barbearia</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
