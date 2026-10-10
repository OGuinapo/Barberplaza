import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portefólios de barbeiros em Portugal',
  description: 'Descobre barbeiros por distrito e especialidade e vê o trabalho de cada um. Cria o teu portefólio gratuitamente.',
  alternates: { canonical: '/barbeiros' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
