'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function toggleFollowProfile(profileId: string, username: string) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  if (user.id === profileId) return

  const { data: existingFollowData } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', profileId)
    .maybeSingle()

  const existingFollow = existingFollowData as any

  if (existingFollow) {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('id', existingFollow.id)

    if (error) {
      console.error('ERRO AO DEIXAR DE SEGUIR:', error)
      throw new Error('Erro ao deixar de seguir usuário.')
    }
  } else {
    const { error: followError } = await supabase
      .from('followers')
      .insert({
        follower_id: user.id,
        following_id: profileId,
      })

    if (followError) {
      console.error('ERRO AO SEGUIR:', followError)
      throw new Error('Erro ao seguir usuário.')
    }

    const { data: actorData } = await supabase
      .from('profiles')
      .select('name, username')
      .eq('id', user.id)
      .single()

    const actor = actorData as any

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: profileId,
        actor_id: user.id,
        type: 'new_follower',
        title: 'Novo seguidor',
        message: `${actor?.name ?? 'Alguém'} começou a seguir você.`,
        href: `/perfil/${actor?.username ?? ''}`,
        channel: 'in_app',
        metadata: {
          follower_id: user.id,
        },
      })

    if (notificationError) {
      console.error('ERRO AO CRIAR NOTIFICAÇÃO DE SEGUIDOR:', notificationError)
      throw new Error(`Erro ao criar notificação: ${notificationError.message}`)
    }
  }

  revalidatePath(`/perfil/${username}`)
  revalidatePath(`/perfil/${username}/seguidores`)
  revalidatePath(`/perfil/${username}/seguindo`)
  revalidatePath('/notificacoes')
}