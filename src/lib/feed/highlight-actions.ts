'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function criarDestaqueStory(formData: FormData) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('username')
  .eq('id', user.id)
  .single()

  const title = String(formData.get('title') ?? '').trim()
  const storyIds = formData.getAll('story_ids').map(String)

  if (!title || storyIds.length === 0) {
    redirect('/feed/stories/criar/arquivo?erro=destaque')
  }

  const { data: storiesData, error: storiesError } = await supabase
    .from('feed_stories')
    .select('id, author_id')
    .in('id', storyIds)

  const stories = (storiesData ?? []) as any[]

  if (storiesError || stories.length !== storyIds.length) {
    redirect('/feed/stories/criar/arquivo?erro=stories')
  }

  const allBelongToUser = stories.every(
    (story) => story.author_id === user.id
  )

  if (!allBelongToUser) {
    redirect('/feed/stories/criar/arquivo?erro=permissao')
  }

  const { data: highlightData, error: highlightError } = await supabase
    .from('story_highlights')
    .insert({
      user_id: user.id,
      title,
      cover_story_id: storyIds[0],
    })
    .select('id')
    .single()

  const highlight = highlightData as any

  if (highlightError || !highlight) {
    redirect('/feed/stories/criar/arquivo?erro=criar')
  }

  const { error: itemsError } = await supabase
    .from('story_highlight_items')
    .insert(
      storyIds.map((storyId) => ({
        highlight_id: highlight.id,
        story_id: storyId,
      }))
    )

  if (itemsError) {
    redirect('/feed/stories/criar/arquivo?erro=itens')
  }

  revalidatePath('/feed/stories/criar/arquivo')
  revalidatePath(`/perfil/${profile.username}`)
  redirect(`/perfil/${profile.username}`)
}

export async function excluirDestaqueStory(highlightId: string) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('username')
  .eq('id', user.id)
  .single()

  const { data: highlightData } = await supabase
    .from('story_highlights')
    .select('id, user_id')
    .eq('id', highlightId)
    .single()

  const highlight = highlightData as any

  if (!highlight) {
    throw new Error('Destaque não encontrado.')
  }

  if (highlight.user_id !== user.id) {
    throw new Error('Você não tem permissão para excluir este destaque.')
  }

  const { error } = await supabase
    .from('story_highlights')
    .delete()
    .eq('id', highlightId)

  if (error) {
    throw new Error('Erro ao excluir destaque.')
  }

  revalidatePath(`/perfil/${profile.username}`)
  revalidatePath('/feed/stories/criar/arquivo')
}

export async function atualizarTituloDestaque(
  highlightId: string,
  title: string
) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('username')
  .eq('id', user.id)
  .single()

  const newTitle = title.trim()

  if (!newTitle) {
    throw new Error('O título não pode ficar vazio.')
  }

  const { data: highlightData } = await supabase
    .from('story_highlights')
    .select('id, user_id')
    .eq('id', highlightId)
    .single()

  const highlight = highlightData as any

  if (!highlight || highlight.user_id !== user.id) {
    throw new Error('Você não tem permissão para editar este destaque.')
  }

  await supabase
    .from('story_highlights')
    .update({ title: newTitle })
    .eq('id', highlightId)

revalidatePath(`/perfil/${profile.username}`)
}

export async function adicionarStoryAoDestaque(
  highlightId: string,
  storyId: string
) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('username')
  .eq('id', user.id)
  .single()

  const { data: highlightData } = await supabase
    .from('story_highlights')
    .select('id, user_id')
    .eq('id', highlightId)
    .single()

  const highlight = highlightData as any

  if (!highlight || highlight.user_id !== user.id) {
    throw new Error('Você não tem permissão para editar este destaque.')
  }

  const { data: storyData } = await supabase
    .from('feed_stories')
    .select('id, author_id')
    .eq('id', storyId)
    .single()

  const story = storyData as any

  if (!story || story.author_id !== user.id) {
    throw new Error('Story inválido.')
  }

  await supabase.from('story_highlight_items').upsert({
    highlight_id: highlightId,
    story_id: storyId,
  })

revalidatePath(`/perfil/${profile.username}`)
}

export async function removerStoryDoDestaque(
  highlightId: string,
  storyId: string
) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('username')
  .eq('id', user.id)
  .single()

  const { data: highlightData } = await supabase
    .from('story_highlights')
    .select('id, user_id, cover_story_id')
    .eq('id', highlightId)
    .single()

  const highlight = highlightData as any

  if (!highlight || highlight.user_id !== user.id) {
    throw new Error('Você não tem permissão para editar este destaque.')
  }

  await supabase
    .from('story_highlight_items')
    .delete()
    .eq('highlight_id', highlightId)
    .eq('story_id', storyId)

  if (highlight.cover_story_id === storyId) {
    const { data: nextItemData } = await supabase
      .from('story_highlight_items')
      .select('story_id')
      .eq('highlight_id', highlightId)
      .limit(1)
      .maybeSingle()

    const nextItem = nextItemData as any

    await supabase
      .from('story_highlights')
      .update({
        cover_story_id: nextItem?.story_id ?? null,
      })
      .eq('id', highlightId)
  }

revalidatePath(`/perfil/${profile.username}`)
}