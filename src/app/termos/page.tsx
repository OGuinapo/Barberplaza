import Link from 'next/link';

export const metadata = { title: 'Termos de Utilização — BarberPlaza' };

export default function TermosPage() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-16">
      <span className="font-mono text-[11px] tracking-wide text-red font-semibold block mb-1">Legal</span>
      <h1 className="text-4xl mb-6">Termos de Utilização</h1>
      <p className="text-sm text-muted mb-8">Última atualização: [PREENCHER DATA]</p>

      <div className="space-y-6 text-sm text-[#3a372f] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-ink mb-2">1. O que é o BarberPlaza</h2>
          <p>
            O BarberPlaza (barberplaza.net) é uma plataforma que liga barbeiros e barbearias em Portugal:
            portefólios profissionais, perfis de barbearias, vagas de emprego, e divulgação de cursos,
            workshops e eventos do setor. O serviço está atualmente em fase beta e é gratuito.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">2. Aceitação destes termos</h2>
          <p>
            Ao criares uma conta ou usares o BarberPlaza, aceitas estes Termos de Utilização e a nossa
            Política de Privacidade. Se não concordares, por favor não uses o site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">3. As tuas responsabilidades</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fornecer informação verdadeira e atualizada no teu perfil, portefólio ou vagas publicadas.</li>
            <li>Manter a confidencialidade da tua password e ser responsável pela atividade na tua conta.</li>
            <li>Não publicar conteúdo falso, enganador, ofensivo, ou que viole direitos de terceiros.</li>
            <li>Não usar o site para fins ilegais ou para assediar outros utilizadores.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">4. O papel do BarberPlaza</h2>
          <p>
            O BarberPlaza é um espaço de divulgação e contacto — não somos parte em nenhuma relação de
            trabalho, contrato, ou acordo comercial estabelecido entre barbeiros e barbearias através da
            plataforma. Não verificamos de forma independente todas as informações publicadas por
            utilizadores (ex: veracidade de uma vaga ou de um portefólio), e não nos responsabilizamos por
            disputas, danos, ou prejuízos resultantes de interações entre utilizadores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">5. Conteúdo que publicas</h2>
          <p>
            Manténs os direitos sobre o conteúdo que publicas (fotos, biografia, descrições). Ao publicá-lo
            no BarberPlaza, autorizas-nos a mostrá-lo publicamente na plataforma, para o propósito de
            operar o serviço.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">6. Remoção de conteúdo ou contas</h2>
          <p>
            Reservamo-nos o direito de remover conteúdo ou suspender contas que violem estes termos, sem
            aviso prévio, especialmente em casos de informação falsa, abuso, ou uso indevido da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">7. Disponibilidade do serviço</h2>
          <p>
            O BarberPlaza está em fase beta e pode sofrer alterações, interrupções, ou instabilidade
            ocasional. Não garantimos disponibilidade contínua nem ausência de erros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">8. Alterações a estes termos</h2>
          <p>
            Podemos atualizar estes termos à medida que o serviço evolui. A versão mais recente estará
            sempre disponível nesta página.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">9. Lei aplicável</h2>
          <p>Estes termos regem-se pela lei portuguesa.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-2">10. Contacto</h2>
          <p>Para questões sobre estes termos, contacta-nos em [O TEU EMAIL DE CONTACTO].</p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-line">
        <Link href="/" className="text-red font-semibold text-sm">← Voltar ao início</Link>
      </div>
    </div>
  );
}
