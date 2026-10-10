import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emprego de barbeiro em Portugal',
  description: 'Vagas para barbeiros em barbearias de todo o país: tempo inteiro, meio-tempo e cadeira livre. Candidata-te gratuitamente.',
  alternates: { canonical: '/emprego' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
