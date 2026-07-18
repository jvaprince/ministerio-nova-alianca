'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PalavraDodia } from '@/types'
import { criarNotificacao } from '@/lib/notifications/actions'
import { claimAction } from '@/lib/actions/idempotency'

export async function getPalavraDodia(date?: string): Promise<PalavraDodia | null> {
  const supabase = (await createSupabaseServerClient()) as any
  const { data: { user } } = await supabase.auth.getUser()

  const targetDate = date ?? new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('palavra_do_dia')
    .select(`
      *,
      responsible:profiles!responsible_id (
        id, name, username, avatar_url, role
      )
    `)
    .eq('scheduled_date', targetDate)
    .eq('is_published', true)
    .single()

  const palavra = data as any
  if (!palavra) return null

  if (user) {
    const { data: interactionsData } = await supabase
      .from('palavra_interactions')
      .select('type')
      .eq('palavra_id', palavra.id)
      .eq('user_id', user.id)

    const interactions = (interactionsData ?? []) as any[]
    const types = new Set(interactions.map((i) => i.type))

    return {
      ...palavra,
      user_devotional: types.has('devotional'),
      user_praying: types.has('praying'),
      user_liked: types.has('like'),
    } as PalavraDodia
  }

  return palavra as PalavraDodia
}

export async function getUltimaPalavraPublicada(): Promise<PalavraDodia | null> {
  const supabase = (await createSupabaseServerClient()) as any
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('palavra_do_dia')
    .select(`
      *,
      responsible:profiles!responsible_id (
        id, name, username, avatar_url, role
      )
    `)
    .eq('is_published', true)
    .order('scheduled_date', { ascending: false })
    .limit(1)
    .single()

  const palavra = data as any
  if (!palavra) return null

  if (user) {
    const { data: interactionsData } = await supabase
      .from('palavra_interactions')
      .select('type')
      .eq('palavra_id', palavra.id)
      .eq('user_id', user.id)

    const interactions = (interactionsData ?? []) as any[]
    const types = new Set(interactions.map((i) => i.type))

    return {
      ...palavra,
      user_devotional: types.has('devotional'),
      user_liked: types.has('like'),
    } as PalavraDodia
  }

  return palavra as PalavraDodia
}

export async function getPalavrasHistorico(page = 0, limit = 10) {
  const supabase = (await createSupabaseServerClient()) as any
  const { data: { user } } = await supabase.auth.getUser()

  const from = page * limit
  const to = from + limit - 1

  const { data: palavrasData, count } = await supabase
    .from('palavra_do_dia')
    .select(`
      *,
      responsible:profiles!responsible_id (
        id, name, username, avatar_url, role
      )
    `, { count: 'exact' })
    .eq('is_published', true)
    .lte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: false })
    .range(from, to)

  const palavras = (palavrasData ?? []) as any[]

  if (palavras.length === 0) return { palavras: [], total: 0 }

  if (user) {
    const ids = palavras.map((p) => p.id)

    const { data: interactionsData } = await supabase
      .from('palavra_interactions')
      .select('palavra_id, type')
      .eq('user_id', user.id)
      .in('palavra_id', ids)

    const interactions = (interactionsData ?? []) as any[]
    const interMap = new Map<string, Set<string>>()

    interactions.forEach((i) => {
      if (!interMap.has(i.palavra_id)) interMap.set(i.palavra_id, new Set())
      interMap.get(i.palavra_id)!.add(i.type)
    })

    return {
      palavras: palavras.map((p) => ({
        ...p,
        user_devotional: interMap.get(p.id)?.has('devotional') ?? false,
        user_praying: interMap.get(p.id)?.has('praying') ?? false,
        user_liked: interMap.get(p.id)?.has('like') ?? false,
      })) as PalavraDodia[],
      total: count ?? 0,
    }
  }

  return { palavras: palavras as PalavraDodia[], total: count ?? 0 }
}

export async function getEscala(days = 30) {
  const supabase = (await createSupabaseServerClient()) as any

  const today = new Date().toISOString().split('T')[0]
  const future = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]

  const { data } = await supabase
    .from('palavra_scale')
    .select(`
      *,
      user:profiles!user_id (
        id, name, username, avatar_url, role
      ),
      pending_profile:pending_profiles!pending_profile_id (
        id, name, role, linked_user_id
      )
    `)
    .gte('scheduled_date', today)
    .lte('scheduled_date', future)
    .order('scheduled_date', { ascending: true })

  return (data ?? []) as any[]
}

export async function getResponsavelPalavraOLD(date: string) {
  const supabase = (await createSupabaseServerClient()) as any

  const { data } = await supabase
    .from('palavra_scale')
    .select(`
      *,
      user:profiles!user_id (
        id, name, username, avatar_url, role
      ),
      pending_profile:pending_profiles!pending_profile_id (
        id, name, role, linked_user_id
      )
    `)
    .eq('scheduled_date', date)
    .single()

  return data as any
}

export async function getResponsavelPalavra(date: string) {
  const supabase = (await createSupabaseServerClient()) as any

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

  const inicioEscala = new Date('2026-07-01T12:00:00')
  const dataAtual = new Date(`${date}T12:00:00`)

  const diasPassados = Math.floor(
    (dataAtual.getTime() - inicioEscala.getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const indice = ((diasPassados % ordem.length) + ordem.length) % ordem.length
  const nomeResponsavel = ordem[indice]

  const { data: overrideData } = await supabase
    .from('palavra_overrides')
    .select(`
      *,
      replacement:pending_profiles!replacement_profile_id (
        id,
        name,
        role,
        linked_user_id
      )
    `)
    .eq('target_date', date)
    .maybeSingle()

  const override = overrideData as any

  if (override?.action_type === 'skip_day') {
    return {
      skipped: true,
      user: null,
      pending_profile: null,
    }
  }

  if (override?.action_type === 'replace' && override.replacement) {
    const replacement = Array.isArray(override.replacement)
      ? override.replacement[0]
      : override.replacement

    const { data: userData } = replacement.linked_user_id
      ? await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, role')
          .eq('id', replacement.linked_user_id)
          .single()
      : { data: null }

    return {
      automatic: false,
      override: true,
      pending_profile: replacement,
      user: userData as any,
    }
  }

  const { data: userData } = await supabase
  .from('profiles')
  .select('id, name, username, avatar_url, role')
  .ilike('name', `%${nomeResponsavel}%`)
  .limit(1)
  .maybeSingle()

if (userData) {
  return {
    automatic: true,
    override: false,
    pending_profile: null,
    user: userData as any,
  }
}

const { data: pendingProfileData } = await supabase
  .from('pending_profiles')
  .select('id, name, role, linked_user_id')
  .ilike('name', `%${nomeResponsavel}%`)
  .limit(1)
  .maybeSingle()

const pendingProfile = pendingProfileData as any

const { data: linkedUserData } = pendingProfile?.linked_user_id
  ? await supabase
      .from('profiles')
      .select('id, name, username, avatar_url, role')
      .eq('id', pendingProfile.linked_user_id)
      .maybeSingle()
  : { data: null }

return {
  automatic: true,
  override: false,
  pending_profile: pendingProfile,
  user: linkedUserData as any,
}
}

export async function getComentariosPalavra(palavraId: string) {
  const supabase = (await createSupabaseServerClient()) as any

  const { data, error } = await supabase
    .from('palavra_comments')
    .select(`
      *,
      author:profiles!author_id (
        id, name, username, avatar_url, role
      )
    `)
    .eq('palavra_id', palavraId)
    .order('created_at', { ascending: true })

  console.log('GET COMENTARIOS PALAVRA ID:', palavraId)
  console.log('GET COMENTARIOS DATA:', data)
  console.log('GET COMENTARIOS ERROR:', error)

  return (data ?? []) as any[]
}

export async function togglePalavraInteraction(
  palavraId: string,
  type: 'devotional' | 'like'
) {
  const supabase = (await createSupabaseServerClient()) as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: existingData } = await supabase
    .from('palavra_interactions')
    .select('id')
    .eq('palavra_id', palavraId)
    .eq('user_id', user.id)
    .eq('type', type)
    .maybeSingle()

  const existing = existingData as any

  if (existing) {
    const { error } = await supabase
      .from('palavra_interactions')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: 'Erro ao remover interação.' }

    if (type === 'devotional') {
      await supabase.rpc('decrement_palavra_count', {
        p_id: palavraId,
        p_field: 'devotional_count',
      })
    }

    revalidatePath('/palavra')
    revalidatePath(`/palavra/${palavraId}`)

    return { active: false }
  }

  const { error } = await supabase
    .from('palavra_interactions')
    .insert({
      palavra_id: palavraId,
      user_id: user.id,
      type,
    })

  if (error) return { error: 'Erro ao salvar interação.' }

  if (type === 'like') {
    const { data: palavraData } = await supabase
      .from('palavra_do_dia')
      .select('responsible_id')
      .eq('id', palavraId)
      .single()

    const palavra = palavraData as any

    const { data: actorData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const actor = actorData as any

    if (palavra?.responsible_id) {
      await criarNotificacao({
        userId: palavra.responsible_id,
        actorId: user.id,
        type: 'palavra_like',
        title: 'Curtiram sua Palavra',
        message: `${actor?.name ?? 'Alguém'} curtiu sua Palavra do Dia.`,
        href: '/palavra',
      })
    }
  }

  if (type === 'devotional') {
    const { data: palavraData } = await supabase
      .from('palavra_do_dia')
      .select('responsible_id')
      .eq('id', palavraId)
      .single()

    const palavra = palavraData as any

    const { data: actorData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const actor = actorData as any

    if (palavra?.responsible_id) {
      await criarNotificacao({
        userId: palavra.responsible_id,
        actorId: user.id,
        type: 'palavra_devocional',
        title: 'Novo devocional',
        message: `${actor?.name ?? 'Alguém'} marcou que fez o devocional da sua Palavra.`,
        href: '/palavra',
      })
    }

    await supabase.rpc('increment_palavra_count', {
      p_id: palavraId,
      p_field: 'devotional_count',
    })
  }

  revalidatePath('/palavra')
  revalidatePath(`/palavra/${palavraId}`)

  return { active: true }
}

export async function adicionarComentario(palavraId: string, content: string) {
  if (!content.trim()) return { error: 'Comentário não pode ser vazio.' }

  const supabase = (await createSupabaseServerClient()) as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const allowed = await claimAction({
  supabase,
  userId: user.id,
  action: 'palavra-comentario',
  payload: {
    palavraId,
    content: content.trim(),
  },
  ttlSeconds: 10,
})

if (!allowed) {
  return { success: true }
}

  const { error } = await supabase
    .from('palavra_comments')
    .insert({
      palavra_id: palavraId,
      author_id: user.id,
      content: content.trim(),
    })

  if (error) return { error: 'Erro ao enviar comentário.' }

  const { data: palavraData } = await supabase
    .from('palavra_do_dia')
    .select('responsible_id')
    .eq('id', palavraId)
    .single()

  const palavra = palavraData as any

  const { data: actorData } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const actor = actorData as any

  if (palavra?.responsible_id) {
    await criarNotificacao({
      userId: palavra.responsible_id,
      actorId: user.id,
      type: 'palavra_comment',
      title: 'Novo comentário',
      message: `${actor?.name ?? 'Alguém'} comentou sua Palavra do Dia.`,
      href: '/palavra',
    })
  }

  revalidatePath(`/palavra/${palavraId}`)
  return { success: true }
}

export async function excluirComentario(formData: FormData) {
  const commentId = formData.get('commentId') as string

  if (!commentId) return { error: 'Comentário inválido.' }

  const supabase = (await createSupabaseServerClient()) as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: commentData } = await supabase
    .from('palavra_comments')
    .select('id, palavra_id, author_id')
    .eq('id', commentId)
    .single()

  const comment = commentData as any

  if (!comment) return { error: 'Comentário não encontrado.' }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as any

  const podeExcluir =
    comment.author_id === user.id ||
    ['admin', 'leader'].includes(profile?.role ?? '')

  if (!podeExcluir) return { error: 'Sem permissão para excluir.' }

  const { error } = await supabase
    .from('palavra_comments')
    .delete()
    .eq('id', commentId)

  if (error) return { error: 'Erro ao excluir comentário.' }

  revalidatePath('/palavra')
  revalidatePath(`/palavra/${comment.palavra_id}`)

  return { success: true }
}

export async function criarPalavra(formData: FormData) {
  const supabase = (await createSupabaseServerClient()) as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as any

  const scheduled_date = formData.get('scheduled_date') as string

const responsavel = await getResponsavelPalavra(scheduled_date)

const ehAdmin = profile?.role === 'admin'

const ehResponsavelDoDia =
  responsavel?.user?.id === user.id ||
  responsavel?.pending_profile?.linked_user_id === user.id

if (!ehAdmin && !ehResponsavelDoDia) {
  redirect(
    '/palavra?erro=Você não é o responsável pela Palavra deste dia.'
  )
}
  const verse = formData.get('verse') as string
  const verse_ref = formData.get('verse_ref') as string
  const verse_book = formData.get('verse_book') as string
  const verse_chapter = parseInt(formData.get('verse_chapter') as string) || null
  const verse_number = parseInt(formData.get('verse_number') as string) || null
  const reflection = formData.get('reflection') as string
  const is_published = formData.get('is_published') === 'true'

  const audioFile = formData.get('audio_file') as File | null
  const videoFile = formData.get('video_file') as File | null

  let audio_url: string | null = null
  let video_url: string | null = null
  let media_type: string | null = 'texto'

  if (!scheduled_date) {
    redirect('/palavra/criar?erro=Selecione uma data.')
  }

  const allowed = await claimAction({
  supabase,
  userId: user.id,
  action: 'criar-palavra',
  payload: {
    scheduled_date,
    verse_ref,
    reflection,
    media_type:
      audioFile?.size ? 'audio'
      : videoFile?.size ? 'video'
      : 'texto',
  },
  ttlSeconds: 30,
})

if (!allowed) {
  redirect('/palavra')
}

  if (audioFile && audioFile.size > 0) {
    const filePath = `${user.id}/audio-${Date.now()}-${audioFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('palavra-media')
      .upload(filePath, audioFile, {
        contentType: audioFile.type || 'audio/webm',
        upsert: false,
      })

    if (uploadError) {
      redirect(`/palavra/criar?erro=${encodeURIComponent(uploadError.message)}`)
    }

    audio_url = supabase.storage
      .from('palavra-media')
      .getPublicUrl(filePath).data.publicUrl

    media_type = 'audio'
  }

  if (videoFile && videoFile.size > 0) {
    const filePath = `${user.id}/video-${Date.now()}-${videoFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('palavra-media')
      .upload(filePath, videoFile, {
        contentType: videoFile.type || 'video/webm',
        upsert: false,
      })

    if (uploadError) {
      redirect(`/palavra/criar?erro=${encodeURIComponent(uploadError.message)}`)
    }

    video_url = supabase.storage
      .from('palavra-media')
      .getPublicUrl(filePath).data.publicUrl

    media_type = 'video'
  }

  if (audio_url && video_url) {
    media_type = 'audio_video'
  }

  const { data: createdData, error } = await supabase
    .from('palavra_do_dia')
    .insert({
      responsible_id: user.id,
      scheduled_date,
      verse: verse || null,
      verse_ref: verse_ref || null,
      verse_book: verse_book || null,
      verse_chapter,
      verse_number,
      reflection: reflection || null,
      audio_url,
      video_url,
      media_type,
      is_published,
    })
    .select('id')
    .single()

  const created = createdData as any

  if (error) {
    if (error.code === '23505') {
      redirect('/palavra/criar?erro=Já existe uma Palavra para esta data.')
    }

    redirect(`/palavra/criar?erro=${encodeURIComponent(error.message)}`)
  }

  await supabase
    .from('palavra_scale')
    .upsert({ user_id: user.id, scheduled_date })

  if (is_published) {
    const { data: membersData } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', user.id)

    const members = (membersData ?? []) as any[]

    if (members.length > 0) {
      await Promise.all(
        members.map((member) =>
          criarNotificacao({
            userId: member.id,
            actorId: user.id,
            type: 'palavra_publicada',
            title: 'Nova Palavra disponível',
            message: verse_ref
              ? `A Palavra do Dia em ${verse_ref} já está disponível.`
              : 'A Palavra do Dia já está disponível.',
            href: `/palavra/${created.id}`,
            channel: 'both',
            metadata: {
              palavra_id: created.id,
              scheduled_date,
            },
          })
        )
      )
    }
  }

  revalidatePath('/palavra')
  revalidatePath('/escala')
  redirect(`/palavra/${created.id}`)
}

export async function editarPalavra(id: string, formData: FormData) {
  const supabase = (await createSupabaseServerClient()) as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('palavra_do_dia')
    .update({
      verse: (formData.get('verse') as string) || null,
      verse_ref: (formData.get('verse_ref') as string) || null,
      verse_book: (formData.get('verse_book') as string) || null,
      verse_chapter: parseInt(formData.get('verse_chapter') as string) || null,
      verse_number: parseInt(formData.get('verse_number') as string) || null,
      reflection: (formData.get('reflection') as string) || null,
      video_url: (formData.get('video_url') as string) || null,
      is_published: formData.get('is_published') === 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('responsible_id', user.id)

  if (error) return { error: 'Erro ao salvar alterações.' }

  revalidatePath(`/palavra/${id}`)
  revalidatePath('/palavra')
  redirect(`/palavra/${id}`)
}

export async function togglePublicacao(id: string, isPublished: boolean) {
  const supabase = (await createSupabaseServerClient()) as any

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

  await supabase
    .from('palavra_do_dia')
    .update({ is_published: isPublished })
    .eq('id', id)

  if (isPublished) {
    const { data: palavraData } = await supabase
      .from('palavra_do_dia')
      .select('id, verse_ref, scheduled_date')
      .eq('id', id)
      .single()

    const palavra = palavraData as any

    const { data: membersData } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', user.id)

    const members = (membersData ?? []) as any[]

    if (members.length > 0) {
      await Promise.all(
        members.map((member) =>
          criarNotificacao({
            userId: member.id,
            actorId: user.id,
            type: 'palavra_publicada',
            title: 'Nova Palavra disponível',
            message: palavra?.verse_ref
              ? `A Palavra do Dia em ${palavra.verse_ref} já está disponível.`
              : 'A Palavra do Dia já está disponível.',
            href: `/palavra/${id}`,
            channel: 'both',
            metadata: {
              palavra_id: id,
              scheduled_date: palavra?.scheduled_date,
            },
          })
        )
      )
    }
  }

  revalidatePath('/palavra')
  revalidatePath(`/palavra/${id}`)

  return { success: true }
}

export async function gerarEscalaAutomatica(startDate: string, days: number) {
  const supabase = (await createSupabaseServerClient()) as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as any

  if (!profile || !['admin', 'leader'].includes(profile.role)) {
    return { error: 'Sem permissão para gerar escala.' }
  }

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

  const { data: pendingProfilesData, error: pendingError } = await supabase
    .from('pending_profiles')
    .select('id, name, linked_user_id')
    .order('created_at', { ascending: true })

  const pendingProfiles = (pendingProfilesData ?? []) as any[]

  if (pendingError || pendingProfiles.length === 0) {
    console.log('PENDING ERROR:', pendingError)
    console.log('PENDING PROFILES:', pendingProfiles)
    return { error: pendingError?.message ?? 'Não foi possível buscar os membros.' }
  }

  const profilesOrdenados = ordem
    .map((name) => pendingProfiles.find((p) => p.name === name))
    .filter(Boolean) as {
      id: string
      name: string
      linked_user_id: string | null
    }[]

  if (profilesOrdenados.length !== ordem.length) {
    return { error: 'Nem todos os membros da escala foram encontrados.' }
  }

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

  const { error } = await supabase
    .from('palavra_scale')
    .upsert(entries, { onConflict: 'scheduled_date' })

  if (error) return { error: 'Erro ao gerar escala.' }

  revalidatePath('/escala')
  revalidatePath('/inicio')

  return { success: true, count: entries.length }
}

export async function trocarResponsavelEscala(
  scaleId: string,
  newUserId: string
) {
  const supabase = (await createSupabaseServerClient()) as any

  const { error } = await supabase
    .from('palavra_scale')
    .update({ user_id: newUserId })
    .eq('id', scaleId)

  if (error) return { error: 'Erro ao trocar responsável.' }

  revalidatePath('/escala')
  return { success: true }
}

export async function getPalavraById(id: string): Promise<PalavraDodia | null> {
  const supabase = (await createSupabaseServerClient()) as any
  const { data: { user } } = await supabase.auth.getUser()

  

  const { data } = await supabase
    .from('palavra_do_dia')
    .select(`
      *,
      responsible:profiles!responsible_id (
        id, name, username, avatar_url, role
      )
    `)
    .eq('id', id)
    .single()

  const palavra = data as any

  if (!palavra) return null

  if (user) {
    const { data: interactionsData } = await supabase
      .from('palavra_interactions')
      .select('type')
      .eq('palavra_id', palavra.id)
      .eq('user_id', user.id)

    const interactions = (interactionsData ?? []) as any[]
    const types = new Set(interactions.map((i) => i.type))

    return {
      ...palavra,
      user_devotional: types.has('devotional'),
      user_praying: types.has('praying'),
      user_liked: types.has('like'),
    } as PalavraDodia
  }

  return palavra as PalavraDodia
}

export async function togglePalavraFavorite(palavraId: string) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

  const { data: existingData } = await supabase
    .from('palavra_favorites')
    .select('id')
    .eq('palavra_id', palavraId)
    .eq('user_id', user.id)
    .maybeSingle()

  const existing = existingData as any

  if (existing) {
    await supabase
      .from('palavra_favorites')
      .delete()
      .eq('id', existing.id)

    revalidatePath('/palavra')
    revalidatePath(`/palavra/${palavraId}`)

    return {
      active: false,
    }
  }

  await supabase
    .from('palavra_favorites')
    .insert({
      palavra_id: palavraId,
      user_id: user.id,
    })

  revalidatePath('/palavra')
  revalidatePath(`/palavra/${palavraId}`)

  return {
    active: true,
  }
}

export async function getPalavraFavoriteStatus(
  palavraId: string
): Promise<boolean> {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('palavra_favorites')
    .select('id')
    .eq('palavra_id', palavraId)
    .eq('user_id', user.id)
    .maybeSingle()

  return !!data
}

export async function getPalavrasFavoritas() {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('palavra_favorites')
    .select(`
      created_at,
      palavra:palavra_do_dia (
        *,
        responsible:profiles!responsible_id (
          id,
          name,
          username,
          avatar_url
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })

  return data ?? []
}