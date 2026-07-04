import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { criarNotificacao } from '@/lib/notifications/actions'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const hoje = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const { data: palavra } = await supabase
    .from('palavra_do_dia')
    .select('id, scheduled_date')
    .eq('scheduled_date', hoje)
    .eq('is_published', true)
    .maybeSingle()

  if (!palavra) {
    return NextResponse.json({ ok: true, message: 'Sem palavra publicada hoje' })
  }

  const { data: members } = await supabase
    .from('profiles')
    .select('id')

  const { data: devocionais } = await supabase
    .from('palavra_interactions')
    .select('user_id')
    .eq('palavra_id', palavra.id)
    .eq('type', 'devotional')

  const jaFizeram = new Set((devocionais ?? []).map((item: any) => item.user_id))

  let enviados = 0

  for (const member of members ?? []) {
    if (jaFizeram.has(member.id)) continue

    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', member.id)
      .eq('type', 'devocional_pendente')
      .eq('metadata->>palavra_id', palavra.id)
      .maybeSingle()

    if (existing) continue

    await criarNotificacao({
      userId: member.id,
      type: 'devocional_pendente',
      title: 'Devocional pendente',
      message: 'Você ainda não marcou o devocional da Palavra de hoje.',
      href: `/palavra/${palavra.id}`,
      channel: 'both',
      metadata: {
        palavra_id: palavra.id,
        scheduled_date: hoje,
      },
    })

    enviados++
  }

  return NextResponse.json({
    ok: true,
    enviados,
  })
}