'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushToUser } from '@/lib/notifications/sendPush'

export async function criarNotificacao({
  userId,
  actorId,
  type,
  title,
  message,
  href,
  channel = 'in_app',
  scheduledFor,
  metadata,
}: {
  userId: string
  actorId?: string | null
  type: string
  title: string
  message?: string | null
  href?: string | null
  channel?: 'in_app' | 'push' | 'both'
  scheduledFor?: string | null
  metadata?: Record<string, any>
}) {
  if (!userId) return
  if (actorId && actorId === userId) return

  const supabase = (await createSupabaseServerClient()) as any

  await supabase.from('notifications').insert({
  user_id: userId,
  actor_id: actorId ?? null,
  type,
  title,
  message: message ?? null,
  href: href ?? null,
  channel,
  scheduled_for: scheduledFor ?? null,
  metadata: metadata ?? {},
})

console.log('CRIAR NOTIFICACAO:', {
  userId,
  actorId,
  type,
  channel,
  title,
})

if (channel === 'push' || channel === 'both') {
  await sendPushToUser({
    userId,
    title,
    message,
    href,
  })
}
}

export async function notificarTodosMembros({
  actorId,
  type,
  title,
  message,
  href,
  metadata,
}: {
  actorId?: string | null
  type: string
  title: string
  message?: string | null
  href?: string | null
  metadata?: Record<string, any>
}) {
  const supabase = (await createSupabaseServerClient()) as any

  const { data: membersData } = await supabase.from('profiles').select('id')

  const members = (membersData ?? []) as any[]

  if (members.length === 0) return

  for (const member of members) {
    await criarNotificacao({
      userId: member.id,
      actorId: actorId ?? null,
      type,
      title,
      message,
      href,
      channel: 'both',
      metadata,
    })
  }
}

export async function marcarNotificacaoComoLida(id: string) {
  const supabase = (await createSupabaseServerClient()) as any

  await supabase
    .from('notifications')
    .update({
      read_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/notificacoes')
}

export async function marcarTodasComoLidas() {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('notifications')
    .update({
      read_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .is('read_at', null)

  revalidatePath('/notificacoes')
}

export async function criarNotificacaoResponsavelPalavraHoje() {
  const supabase = (await createSupabaseServerClient()) as any

  const hoje = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const { data: escalaData } = await supabase
    .from('palavra_scale')
    .select(`
      id,
      scheduled_date,
      user_id,
      notified,
      pending_profile:pending_profiles!pending_profile_id (
        name,
        linked_user_id
      )
    `)
    .eq('scheduled_date', hoje)
    .maybeSingle()

  const escala = escalaData as any

  const responsibleUserId =
    escala?.pending_profile?.linked_user_id ?? escala?.user_id

  if (!escala || !responsibleUserId) return
  if (escala.notified) return

  const { data: existingData } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', responsibleUserId)
    .eq('type', 'palavra_responsavel')
    .eq('metadata->>scheduled_date', hoje)
    .maybeSingle()

  const existing = existingData as any

  if (existing) {
    await supabase
      .from('palavra_scale')
      .update({ notified: true })
      .eq('id', escala.id)

    return
  }

  await criarNotificacao({
    userId: responsibleUserId,
    actorId: null,
    type: 'palavra_responsavel',
    title: 'Hoje é sua vez',
    message: 'Hoje é sua vez de compartilhar a Palavra do Dia.',
    href: '/palavra/criar',
    channel: 'both',
    scheduledFor: new Date().toISOString(),
    metadata: {
      scheduled_date: hoje,
      scale_id: escala.id,
      source: 'palavra_scale',
    },
  })

  await supabase
    .from('palavra_scale')
    .update({ notified: true })
    .eq('id', escala.id)
}

export async function criarLembretesDeEventos() {
  const supabase = (await createSupabaseServerClient()) as any

  const hoje = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const amanhaDate = new Date(`${hoje}T12:00:00`)
  amanhaDate.setDate(amanhaDate.getDate() + 1)

  const amanha = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(amanhaDate)

  const { data: eventsData } = await supabase
    .from('events')
    .select('id, title, event_date, event_time, location')
    .in('event_date', [hoje, amanha])

  const events = (eventsData ?? []) as any[]

  if (events.length === 0) return

  const { data: membersData } = await supabase.from('profiles').select('id')

  const members = (membersData ?? []) as any[]

  if (members.length === 0) return

  for (const event of events) {
    const isToday = event.event_date === hoje
    const type = isToday ? 'event_today' : 'event_tomorrow'
    const title = isToday ? 'Evento hoje' : 'Lembrete de evento'

    const message = isToday
      ? `${event.title}${event.event_time ? ` será hoje às ${event.event_time.slice(0, 5)}` : ' será hoje'}.`
      : `${event.title}${event.event_time ? ` será amanhã às ${event.event_time.slice(0, 5)}` : ' será amanhã'}.`

    for (const member of members) {
      const inicioHoje = `${hoje}T00:00:00-03:00`
      const fimHoje = `${hoje}T23:59:59-03:00`

      const { data: existingData } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', member.id)
        .eq('type', type)
        .eq('metadata->>event_id', event.id)
        .gte('created_at', inicioHoje)
        .lte('created_at', fimHoje)
        .maybeSingle()

      const existing = existingData as any

      if (existing) continue

      await criarNotificacao({
        userId: member.id,
        actorId: null,
        type,
        title,
        message,
        href: `/agenda/${event.id}`,
        channel: 'both',
        metadata: {
          event_id: event.id,
          event_date: event.event_date,
          reminder_type: type,
        },
      })
    }
  }
}