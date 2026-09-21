import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { to, vagaTitulo, nome, contacto, mensagem } = await req.json();

    if (!to || !vagaTitulo || !nome || !contacto) {
      return NextResponse.json({ error: 'Dados em falta.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      // Sem chave configurada ainda — não bloqueia a candidatura, só não envia o email.
      return NextResponse.json({ ok: false, skipped: true });
    }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BarberPlaza <notificacoes@barberplaza.net>',
        to: [to],
        subject: `Nova candidatura: ${vagaTitulo}`,
        html: `
          <p><strong>${nome}</strong> candidatou-se à vaga <strong>${vagaTitulo}</strong> no BarberPlaza.</p>
          <p><strong>Contacto:</strong> ${contacto}</p>
          ${mensagem ? `<p><strong>Mensagem:</strong> ${mensagem}</p>` : ''}
          <p style="color:#888;font-size:12px;margin-top:24px;">Vê todas as candidaturas em barberplaza.net/emprego/candidaturas</p>
        `,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json({ ok: false, error: errText }, { status: 200 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
  }
}
