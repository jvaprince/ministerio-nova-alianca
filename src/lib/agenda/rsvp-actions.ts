'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function responderEvento(
  eventId: string,
  status: 'going' | 'not_going'
) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('event_rsvps')
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'event_id,user_id',
      }
    )

  if (error) {
    throw new Error('Erro ao responder presença.')
  }

  revalidatePath('/agenda')
  revalidatePath(`/agenda/${eventId}`)
}

export async function removerRespostaEvento(eventId: string) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id)

  revalidatePath('/agenda')
  revalidatePath(`/agenda/${eventId}`)
}