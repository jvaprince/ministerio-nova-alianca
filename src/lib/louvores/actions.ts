'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notificarTodosMembros } from '@/lib/notifications/actions'

function getYoutubeId(url: string) {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/
  return url.match(regex)?.[1] ?? null
}

async function getCurrentUserAndProfile() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { supabase, user, profile }
}

function canManage(role?: string | null) {
  return ['admin', 'leader'].includes(role ?? '')
}

export async function criarRepertorio(formData: FormData) {
  const { supabase, user, profile } = await getCurrentUserAndProfile()

  if (!canManage(profile?.role)) redirect('/louvores')

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const eventId = String(formData.get('event_id') ?? '').trim()
  const worshipDate = String(formData.get('worship_date') ?? '').trim()

  const songTitles = formData.getAll('song_title')
  const youtubeUrls = formData.getAll('youtube_url')
  const songDescriptions = formData.getAll('song_description')

  if (!title) redirect('/louvores/criar?error=missing_title')

  if (!eventId && !worshipDate) {
    redirect('/louvores/criar?error=missing_date')
  }

  const songs = songTitles
    .map((item, index) => {
      const songTitle = String(item ?? '').trim()
      const youtubeUrl = String(youtubeUrls[index] ?? '').trim()
      const songDescription = String(songDescriptions[index] ?? '').trim()

      if (!songTitle || !youtubeUrl) return null

      return {
        title: songTitle,
        youtube_url: youtubeUrl,
        description: songDescription || null,
        position: index + 1,
      }
    })
    .filter(Boolean) as {
    title: string
    youtube_url: string
    description: string | null
    position: number
  }[]

  if (songs.length === 0) redirect('/louvores/criar?error=missing_song')

  const { data: set, error } = await supabase
    .from('worship_sets')
    .insert({
      title,
      description: description || null,
      event_id: eventId || null,
      worship_date: eventId ? null : worshipDate,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !set) {
    console.error('Erro ao criar repertório:', error)
    redirect('/louvores/criar?error=create_set')
  }

  const { error: songsError } = await supabase.from('worship_songs').insert(
    songs.map((song) => ({
      ...song,
      set_id: set.id,
    }))
  )

  if (songsError) {
    console.error('Erro ao criar louvores:', songsError)
    redirect('/louvores/criar?error=create_songs')
  }

  await notificarTodosMembros({
  actorId: user.id,
  type: 'worship_set_created',
  title: 'Novo repertório disponível',
  message: `${title} — ${songs.length} louvor${songs.length === 1 ? '' : 'es'} preparado${songs.length === 1 ? '' : 's'}.`,
  href: `/louvores/${set.id}`,
  metadata: {
    worship_set_id: set.id,
    event_id: eventId || null,
    worship_date: eventId ? null : worshipDate,
  },
})

revalidatePath('/louvores')
redirect(`/louvores/${set.id}`)
}

export async function editarRepertorio(setId: string, formData: FormData) {
  const { supabase, profile } = await getCurrentUserAndProfile()

  if (!canManage(profile?.role)) redirect(`/louvores/${setId}`)

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const eventId = String(formData.get('event_id') ?? '').trim()
  const worshipDate = String(formData.get('worship_date') ?? '').trim()

  const songIds = formData.getAll('song_id')
  const songTitles = formData.getAll('song_title')
  const youtubeUrls = formData.getAll('youtube_url')
  const songDescriptions = formData.getAll('song_description')

  if (!title) redirect(`/louvores/${setId}/editar?error=missing_title`)

  if (!eventId && !worshipDate) {
    redirect(`/louvores/${setId}/editar?error=missing_date`)
  }

  const songs = songTitles
    .map((item, index) => {
      const id = String(songIds[index] ?? '').trim()
      const songTitle = String(item ?? '').trim()
      const youtubeUrl = String(youtubeUrls[index] ?? '').trim()
      const songDescription = String(songDescriptions[index] ?? '').trim()

      if (!songTitle || !youtubeUrl) return null

      return {
        id: id || null,
        set_id: setId,
        title: songTitle,
        youtube_url: youtubeUrl,
        description: songDescription || null,
        position: index + 1,
      }
    })
    .filter(Boolean) as {
    id: string | null
    set_id: string
    title: string
    youtube_url: string
    description: string | null
    position: number
  }[]

  if (songs.length === 0) {
    redirect(`/louvores/${setId}/editar?error=missing_song`)
  }

  const { error: setError } = await supabase
    .from('worship_sets')
    .update({
      title,
      description: description || null,
      event_id: eventId || null,
      worship_date: eventId ? null : worshipDate,
    })
    .eq('id', setId)

  if (setError) {
    console.error('Erro ao editar repertório:', setError)
    redirect(`/louvores/${setId}/editar?error=update_set`)
  }

  const keptIds = songs.map((song) => song.id).filter(Boolean)

  let deleteQuery = supabase
    .from('worship_songs')
    .delete()
    .eq('set_id', setId)

  if (keptIds.length > 0) {
    deleteQuery = deleteQuery.not('id', 'in', `(${keptIds.join(',')})`)
  }

  const { error: deleteError } = await deleteQuery

  if (deleteError) {
    console.error('Erro ao remover louvores antigos:', deleteError)
    redirect(`/louvores/${setId}/editar?error=delete_old_songs`)
  }

  for (const song of songs) {
    if (song.id) {
      const { error } = await supabase
        .from('worship_songs')
        .update({
          title: song.title,
          youtube_url: song.youtube_url,
          description: song.description,
          position: song.position,
        })
        .eq('id', song.id)
        .eq('set_id', setId)

      if (error) {
        console.error('Erro ao atualizar louvor:', error)
        redirect(`/louvores/${setId}/editar?error=update_song`)
      }
    } else {
      const { error } = await supabase.from('worship_songs').insert({
        set_id: setId,
        title: song.title,
        youtube_url: song.youtube_url,
        description: song.description,
        position: song.position,
      })

      if (error) {
        console.error('Erro ao adicionar louvor:', error)
        redirect(`/louvores/${setId}/editar?error=create_song`)
      }
    }
  }

  revalidatePath('/louvores')
  revalidatePath(`/louvores/${setId}`)

  redirect(`/louvores/${setId}`)
}

export async function excluirRepertorio(setId: string) {
  const { supabase, profile } = await getCurrentUserAndProfile()

  if (!canManage(profile?.role)) redirect(`/louvores/${setId}`)

  const { error } = await supabase
    .from('worship_sets')
    .delete()
    .eq('id', setId)

  if (error) {
    console.error('Erro ao excluir repertório:', error)
    redirect(`/louvores/${setId}?error=delete_set`)
  }

  revalidatePath('/louvores')
  redirect('/louvores')
}

export async function alternarLouvorVisto(songId: string) {
  const { supabase, user } = await getCurrentUserAndProfile()

  const { data: existing } = await supabase
    .from('worship_song_views')
    .select('id')
    .eq('song_id', songId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('worship_song_views')
      .delete()
      .eq('song_id', songId)
      .eq('user_id', user.id)
  } else {
    await supabase.from('worship_song_views').insert({
      song_id: songId,
      user_id: user.id,
      status: 'seen',
    })
  }

  revalidatePath('/louvores')
  revalidatePath('/louvores/[id]', 'page')
}

export { getYoutubeId }