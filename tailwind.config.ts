import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1e1c18',
        paper: '#fdfcf9',
        paper2: '#f4f1e8',
        card: '#ffffff',
        red: '#a3392b',
        redDark: '#7e2a20',
        navy: '#2b3a4a',
        brass: '#8a6a28',
        muted: '#5e594c',
        line: 'rgba(30,28,24,0.13)',
      },
      fontFamily: {
        // Bebas Neue: só o letreiro (logótipo e página inicial)
        brand: ['var(--font-brand)', 'sans-serif'],
        // Bricolage Grotesque: títulos e interface
        display: ['var(--font-heading)', 'sans-serif'],
        // Inter: texto corrido
        body: ['var(--font-inter)', 'sans-serif'],
        // Páginas antigas (entrar, registar) que ainda usam font-mono ficam coerentes
        mono: ['var(--font-inter)', 'sans-serif'],
      },
      // Pesos mais leves: "semibold" fica a 500 e "bold" a 600.
      fontWeight: {
        semibold: '500',
        bold: '600',
      },
      borderRadius: {
        '4xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
