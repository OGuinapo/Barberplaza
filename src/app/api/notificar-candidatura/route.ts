import { NextResponse } from 'next/server';

// Rota antiga desativada: aceitava destinatários vindos do browser.
// As candidaturas passam agora por /api/candidatar.
export async function POST() {
  return NextResponse.json({ erro: 'Rota desativada.' }, { status: 410 });
}
