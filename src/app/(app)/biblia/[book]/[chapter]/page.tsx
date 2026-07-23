import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ALL_BOOKS, BOOK_CHAPTERS } from '@/lib/biblia'
import BibleChapterExperience from '@/components/biblia/BibleChapterExperience'

export default async function BibleChapterPage({
  params,
  searchParams,
}: {
  params: { book: string; chapter: string }
  searchParams?: {
  backToJourney?: string
  journey?: string
  day?: string
  verse?: string
}
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const book = decodeURIComponent(params.book)
  const chapter = Number(params.chapter)

  if (!ALL_BOOKS.includes(book)) notFound()
  if (!chapter || chapter < 1 || chapter > BOOK_CHAPTERS[book]) notFound()

  const { data: favorites } = await supabase
    .from('bible_favorites')
    .select('*')
    .eq('user_id', user.id)
    .eq('book', book)
    .eq('chapter', chapter)

  const { data: notes } = await supabase
    .from('bible_notes')
    .select(`
      id,
      user_id,
      book,
      chapter,
      verse,
      content,
      created_at,
      profile:profiles (
        id,
        name,
        username,
        avatar_url
      )
    `)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('is_public', true)
    .order('created_at', { ascending: true })

  const { data: highlights } = await supabase
    .from('bible_highlights')
    .select('*')
    .eq('user_id', user.id)
    .eq('book', book)
    .eq('chapter', chapter)

  const { data: communityFavorites } = await supabase
    .from('bible_favorites')
    .select('verse, user_id')
    .eq('book', book)
    .eq('chapter', chapter)

  const { data: communityHighlights } = await supabase
    .from('bible_highlights')
    .select('verse, user_id, color')
    .eq('book', book)
    .eq('chapter', chapter)

  const { data: palavraRefs } = await supabase
    .from('palavra_do_dia')
    .select('id, scheduled_date, verse_ref, verse_book, verse_chapter, verse_number')
    .eq('is_published', true)
    .eq('verse_book', book)
    .eq('verse_chapter', chapter)

  const previousChapter = chapter > 1 ? chapter - 1 : null
  const nextChapter = chapter < BOOK_CHAPTERS[book] ? chapter + 1 : null

  const journeySlug = searchParams?.journey ?? null
  const journeyDay = searchParams?.day ? Number(searchParams.day) : null
  const initialVerse = searchParams?.verse
  ? Number(searchParams.verse)
  : null

  let journeyContext = null

  if (journeySlug && journeyDay) {
    const { data: journey } = await supabase
      .from('journeys')
      .select('id, title, slug')
      .eq('slug', journeySlug)
      .maybeSingle()

    const jornada = journey as any

    if (jornada) {
      journeyContext = {
        id: jornada.id,
        title: jornada.title,
        slug: jornada.slug,
        day: journeyDay,
        book,
        chapter,
      }
    }
  }

  return (
    <BibleChapterExperience
      currentUserId={user.id}
      journeyContext={journeyContext}
      book={book}
      chapter={chapter}
      initialVerse={initialVerse}
      previousChapter={previousChapter}
      nextChapter={nextChapter}
      favorites={(favorites ?? []) as any[]}
      notes={(notes ?? []) as any[]}
      highlights={(highlights ?? []) as any[]}
      communityFavorites={(communityFavorites ?? []) as any[]}
      communityHighlights={(communityHighlights ?? []) as any[]}
      palavraRefs={(palavraRefs ?? []) as any[]}
      backToJourney={searchParams?.backToJourney ?? null}
    />
  )
}