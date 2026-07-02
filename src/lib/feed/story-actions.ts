'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function criarFeedStory(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const rawMedia = formData.get('media')
const content = String(formData.get('content') ?? '').trim()

const media =
  rawMedia instanceof File && rawMedia.size > 0
    ? rawMedia
    : null

if (!media && !content) {
  redirect('/feed/stories/criar?erro=vazio')
}

  let image_url: string | null = null
  let video_url: string | null = null

  if (media) {
    const isImage = media.type.startsWith('image/')
    const isVideo = media.type.startsWith('video/')

    if (!isImage && !isVideo) {
      throw new Error('Arquivo inválido. Envie uma imagem ou vídeo.')
    }

    const fileExt = media.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('feed-stories')
      .upload(fileName, media, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Erro ao enviar story: ${uploadError.message}`)
    }

    const { data } = supabase.storage
      .from('feed-stories')
      .getPublicUrl(fileName)

    if (isImage) image_url = data.publicUrl
    if (isVideo) video_url = data.publicUrl
  }

  const { error } = await supabase.from('feed_stories').insert({
    author_id: user.id,
    image_url,
    video_url,
    content: content || null,
  })

  if (error) {
    throw new Error(`Erro ao criar story: ${error.message}`)
  }

  revalidatePath('/feed')
  redirect('/feed')
}

export async function excluirFeedStory(storyId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: story } = await supabase
    .from('feed_stories')
    .select('id, author_id')
    .eq('id', storyId)
    .single()

  if (!story) {
    throw new Error('Story não encontrado.')
  }

  if (story.author_id !== user.id) {
    throw new Error('Você não tem permissão para excluir este story.')
  }

  const { error } = await supabase
    .from('feed_stories')
    .delete()
    .eq('id', storyId)

  if (error) {
    throw new Error('Erro ao excluir story.')
  }

  revalidatePath('/feed')
}

export async function registrarVisualizacaoStory(storyId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: story } = await supabase
    .from('feed_stories')
    .select('author_id')
    .eq('id', storyId)
    .single()

  if (!story) return

  if (story.author_id === user.id) {
    return
  }

  await supabase.from('feed_story_views').upsert(
    {
      story_id: storyId,
      user_id: user.id,
    },
    {
      onConflict: 'story_id,user_id',
      ignoreDuplicates: true,
    }
  )

  revalidatePath('/feed')
}

export async function toggleLikeStory(storyId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: story } = await supabase
    .from('feed_stories')
    .select('author_id')
    .eq('id', storyId)
    .single()

  if (!story) return

  if (story.author_id === user.id) {
    return
  }

  const { data: existingLike } = await supabase
    .from('feed_story_likes')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingLike) {
    await supabase
      .from('feed_story_likes')
      .delete()
      .eq('id', existingLike.id)
  } else {
    await supabase.from('feed_story_likes').insert({
      story_id: storyId,
      user_id: user.id,
    })
  }

  revalidatePath('/feed')
}