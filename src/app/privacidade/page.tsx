import Link from 'next/link';

export const metadata = { title: 'Política de Privacidade — BarberPlaza' };

export default function PrivacidadePage() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-16">
      <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Legal</span>
      <h1 className="text-4xl mb-6">Política de Privacidade</h1>
      <p className="text-sm text-muted mb-8">Última atualização: 7 de setembro de 2026</p>

      <div className="space-y-6 text-sm text-[#3a372f] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-ink mb-2">1. Quem trata os teus dados</h2>
          <p>
            Para questões sobre privacidade e proteção de dados relacionadas com o BarberPlaza (barberplaza.net),
            contacta-nos através de barberplaza@outlook.pt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">2. Que dados recolhemos</h2>
          <p>Dependendo de como usas o BarberPlaza, podemos recolher:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><b>Conta:</b> email e password (a password é encriptada pelo Supabase, nunca a vemos em texto simples).</li>
            <li><b>Portefólio de barbeiro:</b> nome, telemóvel, email, distrito/concelho, anos de experiência, especialidades, biografia, e link de foto se fornecido.</li>
            <li><b>Perfil de barbearia:</b> nome, morada, telemóvel, email, distrito/concelho, descrição, e link de foto se fornecido.</li>
            <li><b>Candidaturas a vagas:</b> nome, contacto (telemóvel ou email) e mensagem que escreveres.</li>
            <li><b>Dados técnicos automáticos:</b> informação básica de acesso recolhida pela Vercel (hosting) para segurança e funcionamento do site.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">3. Para que usamos os teus dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Criar e gerir a tua conta e o teu perfil público (barbeiro ou barbearia).</li>
            <li>Permitir que barbearias e barbeiros encontrem e contactem uns aos outros.</li>
            <li>Processar candidaturas a vagas de emprego.</li>
            <li>Enviar emails de confirmação de conta e comunicações essenciais sobre o serviço.</li>
          </ul>
          <p className="mt-2">Não vendemos os teus dados a terceiros, nem os usamos para publicidade.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">4. Com quem partilhamos dados</h2>
          <p>Usamos dois fornecedores de tecnologia para operar o site, que têm acesso técnico aos dados enquanto os armazenam em nosso nome:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><b>Supabase</b> — base de dados e autenticação de contas.</li>
            <li><b>Vercel</b> — alojamento do site.</li>
          </ul>
          <p className="mt-2">
            O teu nome, especialidades, bio e (no caso de barbearias) descrição e vagas publicadas são visíveis
            publicamente a qualquer visitante do site, já que essa é a finalidade da plataforma. O teu email e
            password de login nunca são mostrados publicamente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">5. Quanto tempo guardamos os dados</h2>
          <p>
            Guardamos os teus dados enquanto a tua conta estiver ativa. Se pedires a eliminação da tua conta,
            removemos os teus dados pessoais dentro de um prazo razoável, exceto quando formos legalmente
            obrigados a conservar alguma informação por mais tempo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">6. Os teus direitos</h2>
          <p>Ao abrigo do RGPD, tens o direito de:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Aceder aos dados que temos sobre ti;</li>
            <li>Corrigir dados incorretos (podes editar o teu perfil diretamente, uma vez com sessão iniciada);</li>
            <li>Pedir a eliminação dos teus dados;</li>
            <li>Pedir a portabilidade dos teus dados;</li>
            <li>Opor-te a determinados tratamentos de dados;</li>
            <li>Apresentar queixa junto da CNPD (Comissão Nacional de Proteção de Dados), em www.cnpd.pt.</li>
          </ul>
          <p className="mt-2">
            Para exercer qualquer um destes direitos, contacta-nos em barberplaza@outlook.pt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">7. Cookies e armazenamento local</h2>
          <p>
            Usamos apenas o armazenamento essencial para manteres a sessão de login (gerido pelo Supabase).
            Não usamos cookies de publicidade nem de rastreio de terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">8. Alterações a esta política</h2>
          <p>
            Podemos atualizar esta política à medida que o BarberPlaza evolui. Publicaremos sempre a versão
            mais recente nesta página, com a data de atualização no topo.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-line">
        <Link href="/" className="text-red font-semibold text-sm">← Voltar ao início</Link>
      </div>
    </div>
  );
}
