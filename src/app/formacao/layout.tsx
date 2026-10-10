import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cursos, workshops e eventos de barbearia',
  description: 'Agenda de cursos, workshops e eventos para barbeiros em Portugal. Divulga a tua formação.',
  alternates: { canonical: '/formacao' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
