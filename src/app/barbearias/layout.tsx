import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Barbearias em Portugal',
  description: 'Encontra barbearias por distrito e concelho. Regista a tua e publica vagas gratuitamente.',
  alternates: { canonical: '/barbearias' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
