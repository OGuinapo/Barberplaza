// Instagram: aceita @utilizador, utilizador ou um URL completo e devolve só o utilizador.
export function normalizarInstagram(v: string): string | null {
  let s = v.trim();
  if (!s) return null;
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  s = s.replace(/^@/, '');
  s = s.split(/[/?#]/)[0];
  s = s.replace(/[^a-zA-Z0-9._]/g, '');
  return s ? s.slice(0, 30) : null;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function emailValido(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// Telemóvel português: 9 dígitos (aceita +351 e espaços).
export function telemovelValido(v: string): boolean {
  const d = v.replace(/[\s.-]/g, '').replace(/^(\+|00)351/, '');
  return /^\d{9}$/.test(d);
}

export function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diff / 86_400_000);
  if (dias <= 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  if (dias < 7) return `Há ${dias} dias`;
  if (dias < 30) return `Há ${Math.floor(dias / 7)} sem.`;
  return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function hojeISO(): string {
  return new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD, no fuso local
}

export function pedirLogin(next: string): string {
  return `/entrar?next=${encodeURIComponent(next)}`;
}
