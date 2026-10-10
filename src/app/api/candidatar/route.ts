import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ipDe(req: Request) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'desconhecido';
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: 'Pedido inválido.' }, { status: 400 });
  }

  // Campo isco: os bots preenchem-no. Respondemos "ok" sem guardar nada.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const vagaId = typeof body.vagaId === 'string' ? body.vagaId : '';
  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const contacto = typeof body.contacto === 'string' ? body.contacto.trim() : '';
  const mensagem = typeof body.mensagem === 'string' ? body.mensagem.trim() : '';

  if (!UUID.test(vagaId)) return NextResponse.json({ erro: 'Vaga inválida.' }, { status: 400 });
  if (nome.length < 2 || nome.length > 100)
    return NextResponse.json({ erro: 'O nome deve ter entre 2 e 100 caracteres.' }, { status: 400 });
  if (contacto.length < 5 || contacto.length > 120)
    return NextResponse.json({ erro: 'Indica um telemóvel ou email válido.' }, { status: 400 });
  if (mensagem.length > 1000)
    return NextResponse.json({ erro: 'A mensagem pode ter no máximo 1000 caracteres.' }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ erro: 'Serviço indisponível.' }, { status: 500 });

  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  const salt = process.env.IP_HASH_SALT ?? 'barberplaza';
  const ipHash = createHash('sha256').update(`${salt}:${ipDe(req)}`).digest('hex');

  const { error } = await supabase.rpc('registar_candidatura', {
    p_vaga_id: vagaId,
    p_nome: nome,
    p_contacto: contacto,
    p_mensagem: mensagem,
    p_ip_hash: ipHash,
  });

  if (error) {
    const msg = error.message ?? '';
    if (msg.includes('limite_excedido'))
      return NextResponse.json({ erro: 'Enviaste muitas candidaturas. Tenta novamente daqui a uma hora.' }, { status: 429 });
    if (msg.includes('vaga_inexistente'))
      return NextResponse.json({ erro: 'Esta vaga já não está disponível.' }, { status: 404 });
    if (error.code === '23505')
      return NextResponse.json({ erro: 'Já te candidataste a esta vaga com este contacto.' }, { status: 409 });
    if (msg.includes('dados_invalidos'))
      return NextResponse.json({ erro: 'Verifica os dados e tenta novamente.' }, { status: 400 });
    return NextResponse.json({ erro: 'Não foi possível enviar a candidatura.' }, { status: 500 });
  }

  // Aviso por email: opcional e nunca bloqueia a candidatura.
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { data: vaga } = await supabase
        .from('vagas')
        .select('titulo, barbearias(nome, email)')
        .eq('id', vagaId)
        .maybeSingle();

      const barbearia = Array.isArray(vaga?.barbearias) ? vaga?.barbearias[0] : vaga?.barbearias;
      const destino = (barbearia as { email?: string | null } | null | undefined)?.email;

      if (vaga && destino) {
        const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto) ? contacto : undefined;
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.RESEND_FROM ?? 'BarberPlaza <avisos@barberplaza.net>',
            to: [destino],
            reply_to: replyTo,
            subject: `Nova candidatura: ${vaga.titulo}`.slice(0, 150),
            html: `<p>Recebeste uma nova candidatura para <strong>${esc(vaga.titulo)}</strong>.</p>
<p><strong>Nome:</strong> ${esc(nome)}<br><strong>Contacto:</strong> ${esc(contacto)}</p>
${mensagem ? `<p><strong>Mensagem:</strong><br>${esc(mensagem).replace(/\n/g, '<br>')}</p>` : ''}
<p style="color:#666;font-size:12px">Enviado pela BarberPlaza.</p>`,
          }),
        });
      }
    }
  } catch {
    // ignorado de propósito
  }

  return NextResponse.json({ ok: true });
}
