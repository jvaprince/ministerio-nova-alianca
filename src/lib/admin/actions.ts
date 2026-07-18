'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role?: string } | null

  if (profile?.role !== 'admin') redirect('/inicio')

  return supabase as any
}

export async function atualizarCargoMembro(formData: FormData) {
  const supabase = await assertAdmin()

  const userId = String(formData.get('user_id') ?? '')
  const role = String(formData.get('role') ?? '')

  if (!userId) {
    throw new Error('Usuário não informado.')
  }

  if (!['admin', 'leader', 'member'].includes(role)) {
    throw new Error('Cargo inválido.')
  }

  // TESTE: mostra qual ID o formulário está enviando
  console.log('userId recebido:', userId)

  // TESTE: verifica se esse ID existe na tabela profiles
  const { data: perfilEncontrado, error: erroBusca } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', userId)

  console.log('Perfil encontrado:', perfilEncontrado)
  console.log('Erro ao buscar perfil:', erroBusca)

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id, name, role')
    .maybeSingle()

  if (error) {
    console.error('Erro ao atualizar cargo do membro:', error)
    throw new Error(`Não foi possível atualizar o cargo: ${error.message}`)
  }

  if (!data) {
    throw new Error(
      'Nenhum perfil foi atualizado. O ID enviado pode estar incorreto ou a alteração foi bloqueada.'
    )
  }

  console.log('Cargo atualizado com sucesso:', data)

  revalidatePath('/admin/membros')
}

export async function atualizarCargoConvite(formData: FormData) {
  const supabase = await assertAdmin()

  const pendingId = String(formData.get('pending_id') ?? '')
  const role = String(formData.get('role') ?? '')

  if (!pendingId) {
    throw new Error('Convite não informado.')
  }

  if (!['admin', 'leader', 'member'].includes(role)) {
    throw new Error('Cargo inválido.')
  }

  const { data, error } = await supabase
    .from('pending_profiles')
    .update({ role })
    .eq('id', pendingId)
    .select('id, name, role')
    .single()

  if (error) {
    console.error('Erro ao atualizar cargo do convite:', error)
    throw new Error(`Não foi possível atualizar o cargo: ${error.message}`)
  }

  if (!data) {
    throw new Error('O convite não foi encontrado ou a alteração foi bloqueada.')
  }

  revalidatePath('/admin/membros')
}

export async function criarConvite(formData: FormData) {
  const supabase = await assertAdmin()

  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? 'member')

  if (!name || !['admin', 'leader', 'member'].includes(role)) return

  await supabase.from('pending_profiles').insert({
    name,
    role,
    is_linked: false,
  })

  revalidatePath('/admin/membros')
}

export async function excluirConvite(formData: FormData) {
  const supabase = await assertAdmin()

  const pendingId = String(formData.get('pending_id') ?? '')

  if (!pendingId) return

  await supabase
    .from('pending_profiles')
    .delete()
    .eq('id', pendingId)
    .eq('is_linked', false)

  revalidatePath('/admin/membros')
}

export async function excluirPostAdmin(formData: FormData) {
  const supabase = await assertAdmin()

  const postId = String(formData.get('post_id') ?? '')

  if (!postId) return

  await supabase.from('feed_posts').delete().eq('id', postId)

  revalidatePath('/admin/moderacao')
  revalidatePath('/feed')
}

export async function excluirPalavraAdmin(formData: FormData) {
  const supabase = await assertAdmin()

  const palavraId = String(formData.get('palavra_id') ?? '')

  if (!palavraId) return

  await supabase.from('daily_words').delete().eq('id', palavraId)

  revalidatePath('/admin/palavra')
  revalidatePath('/palavra')
}

export async function criarConquistaAdmin(formData: FormData) {
  const supabase = await assertAdmin()

  const title = String(formData.get('title') ?? '').trim()
  const code = String(formData.get('code') ?? '').trim()
  const icon = String(formData.get('icon') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const rarity = String(formData.get('rarity') ?? 'common')
  const isSuper = formData.get('is_super') === 'true'

  if (!title || !code || !description) return

  await supabase.from('achievements').insert({
    title,
    code,
    icon: icon || '🏆',
    description,
    rarity,
    is_super: isSuper,
    visibility: 'public',
  })

  revalidatePath('/admin/conquistas')
  revalidatePath('/perfil/conquistas')
}

export async function excluirConquistaAdmin(formData: FormData) {
  const supabase = await assertAdmin()

  const achievementId = String(formData.get('achievement_id') ?? '')

  if (!achievementId) return

  await supabase
    .from('user_achievements')
    .delete()
    .eq('achievement_id', achievementId)

  await supabase.from('achievements').delete().eq('id', achievementId)

  revalidatePath('/admin/conquistas')
  revalidatePath('/perfil/conquistas')
}

export async function gerarEscalaPalavraAdmin(formData: FormData) {
  const supabase = await assertAdmin()

  const startDate = String(formData.get('start_date') ?? '')
  const days = Number(formData.get('days') ?? 30)

  if (!startDate || !days) return

  const ordem = [
    'João Victor',
    'Millena',
    'Matheus',
    'Nathalia',
    'Mirella',
    'Kelvin',
    'Klara',
    'Mariana',
    'Arthur',
    'Enzo',
    'Giovana',
  ]

  const { data: pendingProfilesData } = await supabase
    .from('pending_profiles')
    .select('id, name, linked_user_id')
    .order('created_at', { ascending: true })

  const pendingProfiles = (pendingProfilesData ?? []) as any[]

  if (pendingProfiles.length === 0) return

  const profilesOrdenados = ordem
    .map((name) => pendingProfiles.find((p) => p.name === name))
    .filter(Boolean) as {
    id: string
    name: string
    linked_user_id: string | null
  }[]

  if (profilesOrdenados.length === 0) return

  const entries = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate + 'T12:00:00')
    date.setDate(date.getDate() + i)

    const member = profilesOrdenados[i % profilesOrdenados.length]

    entries.push({
      scheduled_date: date.toISOString().split('T')[0],
      pending_profile_id: member.id,
      user_id: member.linked_user_id,
      notified: false,
    })
  }

  await supabase
    .from('palavra_scale')
    .upsert(entries, { onConflict: 'scheduled_date' })

  revalidatePath('/admin/escala')
  revalidatePath('/palavra')
  revalidatePath('/inicio')
}

export async function trocarResponsavelEscalaAdmin(formData: FormData) {
  const supabase = await assertAdmin()

  const scaleId = String(formData.get('scale_id') ?? '')
  const pendingProfileId = String(formData.get('pending_profile_id') ?? '')

  if (!scaleId || !pendingProfileId) return

  const { data: pendingProfileData } = await supabase
    .from('pending_profiles')
    .select('id, linked_user_id')
    .eq('id', pendingProfileId)
    .single()

  const pendingProfile = pendingProfileData as {
    id: string
    linked_user_id: string | null
  } | null

  if (!pendingProfile) return

  await supabase
    .from('palavra_scale')
    .update({
      pending_profile_id: pendingProfile.id,
      user_id: pendingProfile.linked_user_id,
      notified: false,
    })
    .eq('id', scaleId)

  revalidatePath('/admin/escala')
  revalidatePath('/palavra')
  revalidatePath('/inicio')
}

export async function excluirEventoAdmin(formData: FormData) {
  const supabase = await assertAdmin()

  const eventId = String(formData.get('event_id') ?? '')

  if (!eventId) return

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error(error)
    throw new Error('Não foi possível excluir o evento.')
  }

  revalidatePath('/agenda')
  revalidatePath('/admin/agenda')
}