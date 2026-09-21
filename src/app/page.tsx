import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6">
      {/* HERO */}
      <section className="py-16 flex flex-col md:flex-row gap-10 items-center">
        <div className="w-full md:w-3.5 h-3.5 md:h-56 rounded-md pole-stripe pole-anim shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wide bg-red text-white px-2.5 py-1 rounded-full mb-4">
            GRÁTIS ENQUANTO ESTAMOS EM BETA
          </span>
          <h1 className="text-5xl md:text-7xl mb-4">
            A cadeira certa.<br /><span className="text-red">O barbeiro certo.</span>
          </h1>
          <p className="text-[17px] max-w-lg text-[#3a372f] mb-7">
            BarberPlaza junta barbeiros e barbearias de Portugal num só mural: cria o teu
            portefólio, publica vagas e encontra a tua próxima cadeira — sem intermediários.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/barbeiros?registar=1" className="btn btn-red">Criar portefólio de barbeiro</Link>
            <Link href="/barbearias?registar=1" className="btn btn-primary">Registar a minha barbearia</Link>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-14">
        <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Como funciona</span>
        <h2 className="text-3xl mb-6">Três passos, sem burocracia</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            ['01', 'Cria o teu perfil', 'Barbeiros montam o portefólio com fotos, experiência e especialidades. Barbearias apresentam o espaço e a equipa.'],
            ['02', 'Publica ou procura', 'Barbearias publicam vagas — tempo inteiro, part-time ou cadeira livre. Barbeiros exploram por cidade e especialidade.'],
            ['03', 'Entram em contacto', 'Candidata-te diretamente. Os teus dados de contacto seguem para a barbearia, sem passos extra.'],
          ].map(([num, title, desc]) => (
            <div key={num} className="card">
              <div className="font-display text-4xl text-red leading-none">{num}</div>
              <h3 className="text-xl font-body normal-case tracking-normal font-bold">{title}</h3>
              <p className="text-sm text-[#4a4536]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CAMINHOS */}
      <section className="py-14">
        <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Comunidade</span>
        <h2 className="text-3xl mb-6">Escolhe o teu caminho</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-card border-[1.5px] border-ink rounded-2xl p-7">
            <h3 className="text-2xl mb-2 font-body normal-case tracking-normal font-bold">Sou barbeiro</h3>
            <p className="text-sm text-[#4a4536] mb-4">
              Mostra o teu trabalho, define a tua cidade e especialidades, e aparece para barbearias à procura de talento.
            </p>
            <Link href="/barbeiros?registar=1" className="btn btn-red">Criar o meu portefólio</Link>
          </div>
          <div className="bg-card border-[1.5px] border-ink rounded-2xl p-7">
            <h3 className="text-2xl mb-2 font-body normal-case tracking-normal font-bold">Sou barbearia</h3>
            <p className="text-sm text-[#4a4536] mb-4">
              Apresenta o teu espaço e publica as vagas em aberto — tempo inteiro, part-time ou aluguer de cadeira.
            </p>
            <Link href="/barbearias?registar=1" className="btn btn-primary">Registar barbearia</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
