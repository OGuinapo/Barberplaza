import type { Metadata, Viewport } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/AuthProvider';

const poppins = Poppins({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const DESCRICAO =
  'Plataforma de emprego e formação para barbeiros e barbearias em Portugal. Encontra vagas, cria o teu portefólio e descobre cursos e workshops. Gratuita.';

export const metadata: Metadata = {
  metadataBase: new URL('https://barberplaza.net'),
  title: {
    default: 'BarberPlaza | Emprego e formação para barbeiros em Portugal',
    template: '%s | BarberPlaza',
  },
  description: DESCRICAO,
  openGraph: {
    title: 'BarberPlaza | Emprego e formação para barbeiros em Portugal',
    description: DESCRICAO,
    type: 'website',
    locale: 'pt_PT',
    siteName: 'BarberPlaza',
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: 'BarberPlaza',
    description: DESCRICAO,
  },
};

export const viewport: Viewport = {
  themeColor: '#fefefc',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-body min-h-screen flex flex-col">
        <AuthProvider>
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
          >
            Saltar para o conteúdo
          </a>
          <Header />
          <main id="conteudo" className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
