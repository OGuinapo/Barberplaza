import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b1a17',
        paper: '#f1ebdd',
        paper2: '#e7ddc8',
        card: '#faf7ef',
        red: '#a3392b',
        redDark: '#7e2a20',
        navy: '#2b3a4a',
        brass: '#8a6a28',
        muted: '#433e2e',
        line: 'rgba(27,26,23,0.16)',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
