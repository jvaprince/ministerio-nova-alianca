'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function toggleBibleFavorite({
  book,
  chapter,
  verse,
}: {
  book: string
  chapter: number
  verse: number
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('bible_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('bible_favorites')
      .delete()
      .eq('id', existing.id)
  } else {
    await supabase
      .from('bible_favorites')
      .insert({
        user_id: user.id,
        book,
        chapter,
        verse,
      })
  }

  revalidatePath('/biblia')
  revalidatePath(`/biblia/${encodeURIComponent(book)}/${chapter}`)
}

export async function createBibleNote(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const book = String(formData.get('book') ?? '')
  const chapter = Number(formData.get('chapter'))
  const verse = Number(formData.get('verse'))
  const content = String(formData.get('content') ?? '').trim()
  const isPublic = formData.get('is_public') === 'on'

  if (!book || !chapter || !verse || !content) return

  await supabase
    .from('bible_notes')
    .insert({
      user_id: user.id,
      book,
      chapter,
      verse,
      content,
      is_public: isPublic,
    })

  revalidatePath('/biblia')
  revalidatePath(`/biblia/${encodeURIComponent(book)}/${chapter}`)
}

export async function deleteBibleNote(noteId: string, book: string, chapter: number) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('bible_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id)

  revalidatePath(`/biblia/${encodeURIComponent(book)}/${chapter}`)
}

export async function markBibleChapterAsRead(book: string, chapter: number) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('bible_reading_history')
    .upsert({
      user_id: user.id,
      book,
      chapter,
      last_read_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,book,chapter',
    })

  revalidatePath('/biblia')
  revalidatePath(`/biblia/${encodeURIComponent(book)}/${chapter}`)
}

export async function toggleBibleHighlight({
  book,
  chapter,
  verse,
  color = 'yellow',
}: {
  book: string
  chapter: number
  verse: number
  color?: string
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: existing, error: selectError } = await supabase
    .from('bible_highlights')
    .select('id, color')
    .eq('user_id', user.id)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .maybeSingle()

  if (selectError) {
    console.error('ERRO AO BUSCAR GRIFO:', selectError)
    throw new Error(`Erro ao buscar grifo: ${selectError.message}`)
  }

  if (existing) {
    if (existing.color === color) {
      const { error } = await supabase
        .from('bible_highlights')
        .delete()
        .eq('id', existing.id)

      if (error) {
        console.error('ERRO AO REMOVER GRIFO:', error)
        throw new Error(`Erro ao remover grifo: ${error.message}`)
      }
    } else {
      const { error } = await supabase
        .from('bible_highlights')
        .update({ color })
        .eq('id', existing.id)

      if (error) {
        console.error('ERRO AO ATUALIZAR GRIFO:', error)
        throw new Error(`Erro ao atualizar grifo: ${error.message}`)
      }
    }
  } else {
    const { error } = await supabase.from('bible_highlights').insert({
      user_id: user.id,
      book,
      chapter,
      verse,
      color,
    })

    if (error) {
      console.error('ERRO AO CRIAR GRIFO:', error)
      throw new Error(`Erro ao criar grifo: ${error.message}`)
    }
  }

  revalidatePath('/biblia')
  revalidatePath(`/biblia/${encodeURIComponent(book)}/${chapter}`)
}

export async function criarPostComVersiculo({
  book,
  chapter,
  verse,
  text,
}: {
  book: string
  chapter: number
  verse: number
  text: string
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('feed_posts').insert({
    author_id: user.id,
    post_type: 'reflexao',
    content: `"${text}"\n\n— ${book} ${chapter}:${verse}`,
  })

  if (error) {
    console.error('ERRO AO POSTAR VERSÍCULO NO FEED:', error)
    throw new Error(`Erro ao postar no feed: ${error.message}`)
  }

  revalidatePath('/feed')
  redirect('/feed')
}