import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b1a17',
        paper: '#fefefc',
        paper2: '#f3f1ea',
        card: '#ffffff',
        red: '#a3392b',
        redDark: '#7e2a20',
        navy: '#2b3a4a',
        brass: '#8a6a28',
        muted: '#5b5648',
        line: 'rgba(27,26,23,0.12)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        // "mono" passa a usar a mesma fonte do corpo, para que ficheiros antigos
        // que ainda usem font-mono (entrar, registar) fiquem coerentes.
        mono: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
