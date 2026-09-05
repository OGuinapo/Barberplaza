import type { Metadata } from 'next';
import { Bebas_Neue, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plexMono = IBM_Plex_Mono({
  weight: ['500', '600'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: 'Empregos de Barbeiro em Portugal | Vagas em Barbearias — BarberPlaza',
  description:
    'Bolsa de emprego para barbeiros em Portugal. Encontra vagas em barbearias, publica o teu portefólio, candidata-te a emprego de barbeiro por cidade, e descobre cursos, workshops e eventos de barbearia. Grátis.',
  keywords: [
    'emprego barbeiro', 'vagas barbeiro', 'trabalho barbeiro Portugal',
    'emprego barbearia', 'bolsa de emprego barbeiro', 'cadeira livre barbearia',
    'cursos de barbearia', 'workshops barbearia',
  ],
  openGraph: {
    title: 'Empregos de Barbeiro em Portugal — BarberPlaza',
    description: 'Vagas de emprego em barbearias portuguesas, portefólios de barbeiros e formação do setor.',
    type: 'website',
    locale: 'pt_PT',
    siteName: 'BarberPlaza',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${bebas.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-body">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
