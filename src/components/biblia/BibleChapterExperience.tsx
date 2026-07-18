'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  X,
} from 'lucide-react'
import {
  BOOK_CHAPTERS,
  NEW_TESTAMENT,
  OLD_TESTAMENT,
} from '@/lib/biblia'
import BibleChapterReader from '@/components/biblia/BibleChapterReader'

type PickerType = 'book' | 'chapter' | null
type TestamentType = 'old' | 'new'

export default function BibleChapterExperience({
  currentUserId,
  backToJourney,
  journeyContext,
  book,
  chapter,
  previousChapter,
  nextChapter,
  favorites,
  notes,
  highlights,
  communityFavorites,
  communityHighlights,
  palavraRefs,
}: any) {
  const router = useRouter()

  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState<PickerType>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookSearch, setBookSearch] = useState('')

  const [selectedTestament, setSelectedTestament] =
    useState<TestamentType>(() =>
      OLD_TESTAMENT.includes(book) ? 'old' : 'new'
    )

  const themeKey = `bible-theme-${currentUserId}`
  const fontSizeKey = `bible-font-size-${currentUserId}`
  const fontFamilyKey = `bible-font-family-${currentUserId}`

  const [fontSize, setFontSize] = useState<
    'normal' | 'large' | 'xlarge'
  >(() => {
    if (typeof window === 'undefined') return 'normal'

    const saved = localStorage.getItem(fontSizeKey)

    return saved === 'normal' ||
      saved === 'large' ||
      saved === 'xlarge'
      ? saved
      : 'normal'
  })

  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>(() => {
    if (typeof window === 'undefined') return 'serif'

    const saved = localStorage.getItem(fontFamilyKey)

    return saved === 'serif' || saved === 'sans'
      ? saved
      : 'serif'
  })

  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'

    const saved = localStorage.getItem(themeKey)

    return saved === 'dark' ||
      saved === 'sepia' ||
      saved === 'light'
      ? saved
      : 'dark'
  })

  useEffect(() => {
    localStorage.setItem(themeKey, theme)
  }, [theme, themeKey])

  useEffect(() => {
    localStorage.setItem(fontSizeKey, fontSize)
  }, [fontSize, fontSizeKey])

  useEffect(() => {
    localStorage.setItem(fontFamilyKey, fontFamily)
  }, [fontFamily, fontFamilyKey])

  useEffect(() => {
    if (!pickerOpen && !settingsOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [pickerOpen, settingsOpen])

  useEffect(() => {
    setSelectedTestament(
      OLD_TESTAMENT.includes(book) ? 'old' : 'new'
    )
  }, [book])

  const themeClass =
    theme === 'light'
      ? 'bg-[#f7f2e8] text-zinc-950'
      : theme === 'sepia'
        ? 'bg-[#17120c] text-[#f4e6c8]'
        : 'bg-[#080b12] text-white'

  const readerTextClass =
    theme === 'light'
      ? 'text-zinc-950'
      : theme === 'sepia'
        ? 'text-[#f4e6c8]'
        : 'text-white/90'

  const subtleBackgroundClass =
    theme === 'light'
      ? 'bg-black/[0.05]'
      : 'bg-white/[0.06]'

  const subtleBorderClass =
    theme === 'light'
      ? 'border-black/[0.08]'
      : 'border-white/[0.08]'

  const mutedTextClass =
    theme === 'light'
      ? 'text-black/45'
      : 'text-white/45'

  const headerBorderClass =
    theme === 'light'
      ? 'border-black/[0.07]'
      : 'border-white/[0.06]'

  const sheetBackgroundClass =
    theme === 'light'
      ? 'bg-[#f8f3e9] text-zinc-950'
      : theme === 'sepia'
        ? 'bg-[#1d160e] text-[#f4e6c8]'
        : 'bg-[#101622] text-white'

  const currentBookList =
    selectedTestament === 'old'
      ? OLD_TESTAMENT
      : NEW_TESTAMENT

  const normalizedBookSearch = bookSearch
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const filteredBooks = useMemo(() => {
    if (!normalizedBookSearch) return currentBookList

    return currentBookList.filter((item) => {
      const normalizedItem = item
        .toLocaleLowerCase('pt-BR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      return normalizedItem.includes(normalizedBookSearch)
    })
  }, [currentBookList, normalizedBookSearch])

  const chapterCount = BOOK_CHAPTERS[book] ?? 1

  function buildBibleHref(targetBook: string, targetChapter: number) {
    const query = new URLSearchParams()

    if (backToJourney) {
      query.set('backToJourney', backToJourney)
    }

    if (journeyContext?.slug) {
      query.set('journey', journeyContext.slug)
    }

    if (journeyContext?.day) {
      query.set('day', String(journeyContext.day))
    }

    const queryString = query.toString()

    return `/biblia/${encodeURIComponent(
      targetBook
    )}/${targetChapter}${queryString ? `?${queryString}` : ''}`
  }

  function navigateToChapter(
    targetBook: string,
    targetChapter: number
  ) {
    setPickerOpen(null)
    setBookSearch('')

    router.push(buildBibleHref(targetBook, targetChapter))
  }

  function openBookPicker() {
    setBookSearch('')
    setSelectedTestament(
      OLD_TESTAMENT.includes(book) ? 'old' : 'new'
    )
    setPickerOpen('book')
  }

  function openChapterPicker() {
    setPickerOpen('chapter')
  }

  const backHref = backToJourney
    ? `/biblia/jornada/${backToJourney}/plano`
    : '/biblia'

  return (
    <div
      className={`bible-reading-page min-h-screen pb-28 ${themeClass}`}
    >
      <header
        className={`
          sticky top-0 z-30 border-b bg-inherit/95
          backdrop-blur-xl ${headerBorderClass}
        `}
      >
        <div className="flex items-center gap-2 px-4 pb-3 pt-10">
          <Link
            href={backHref}
            aria-label="Voltar"
            className={`
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-full border transition active:scale-95
              ${subtleBackgroundClass} ${subtleBorderClass}
            `}
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
  {previousChapter ? (
    <Link
      href={buildBibleHref(book, previousChapter)}
      aria-label={`Ir para o capítulo ${previousChapter}`}
      className={`
        flex h-10 w-9 shrink-0 items-center justify-center
        rounded-full transition active:scale-90
        ${mutedTextClass}
      `}
    >
      <ChevronLeft size={19} />
    </Link>
  ) : (
    <div className="h-10 w-9 shrink-0" />
  )}

  <button
    type="button"
    onClick={openBookPicker}
    className={`
      flex h-10 min-w-0 max-w-[120px]
      items-center gap-1.5 rounded-2xl border px-3
      text-sm font-black transition active:scale-[0.97]
      ${subtleBackgroundClass} ${subtleBorderClass}
    `}
  >
    <span className="truncate">{book}</span>

    <ChevronDown
      size={13}
      className={`shrink-0 ${mutedTextClass}`}
    />
  </button>

  <button
    type="button"
    onClick={openChapterPicker}
    className={`
      flex h-10 shrink-0 items-center gap-1.5
      rounded-2xl border px-3 text-sm font-black
      transition active:scale-[0.97]
      ${subtleBackgroundClass} ${subtleBorderClass}
    `}
  >
    <span>{chapter}</span>

    <ChevronDown
      size={13}
      className={`shrink-0 ${mutedTextClass}`}
    />
  </button>

  {nextChapter ? (
    <Link
      href={buildBibleHref(book, nextChapter)}
      aria-label={`Ir para o capítulo ${nextChapter}`}
      className={`
        flex h-10 w-9 shrink-0 items-center justify-center
        rounded-full transition active:scale-90
        ${mutedTextClass}
      `}
    >
      <ChevronRight size={19} />
    </Link>
  ) : (
    <div className="h-10 w-9 shrink-0" />
  )}
</div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((current) => !current)}
              aria-label={
                searchOpen
                  ? 'Fechar pesquisa'
                  : 'Pesquisar no capítulo'
              }
              className={`
                flex h-10 w-10 items-center justify-center
                rounded-full border transition active:scale-95
                ${subtleBackgroundClass} ${subtleBorderClass}
              `}
            >
              {searchOpen ? (
                <X size={18} />
              ) : (
                <Search size={18} />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Configurações de leitura"
              className={`
                flex h-10 w-10 items-center justify-center
                rounded-full border transition active:scale-95
                ${subtleBackgroundClass} ${subtleBorderClass}
              `}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search
                size={16}
                className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${mutedTextClass}`}
              />

              <input
                autoFocus
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Pesquisar neste capítulo..."
                className={`
                  h-11 w-full rounded-2xl border
                  bg-black/[0.08] pl-11 pr-11 text-sm
                  outline-none transition
                  focus:border-brand-400/40
                  ${subtleBorderClass}
                `}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`
                    absolute right-2 top-1/2 flex h-8 w-8
                    -translate-y-1/2 items-center justify-center
                    rounded-full ${subtleBackgroundClass}
                  `}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="px-5 pb-6 pt-7">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-[0.22em] ${mutedTextClass}`}
            >
              {book}
            </p>

            <h1 className="mt-1 font-serif text-[28px] font-bold leading-none">
              Capítulo {chapter}
            </h1>
          </div>

          <p className={`text-xs font-semibold ${mutedTextClass}`}>
            ACF
          </p>
        </div>

        <BibleChapterReader
          currentUserId={currentUserId}
          book={book}
          chapter={chapter}
          favorites={favorites}
          notes={notes}
          highlights={highlights}
          communityFavorites={communityFavorites}
          communityHighlights={communityHighlights}
          palavraRefs={palavraRefs}
          searchQuery={searchQuery}
          readerTextClass={readerTextClass}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      </main>

      {pickerOpen === 'book' && (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm"
          onClick={() => setPickerOpen(null)}
        >
          <section
            onClick={(event) => event.stopPropagation()}
            className={`
              max-h-[88vh] w-full overflow-hidden
              rounded-t-[32px] border-t
              shadow-[0_-24px_80px_rgba(0,0,0,0.35)]
              ${sheetBackgroundClass} ${subtleBorderClass}
            `}
          >
            <div className="flex justify-center pt-3">
              <div
                className={`h-1 w-10 rounded-full ${subtleBackgroundClass}`}
              />
            </div>

            <div className="flex items-center justify-between px-5 pb-4 pt-4">
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.22em] ${mutedTextClass}`}
                >
                  Bíblia
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Escolha o livro
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPickerOpen(null)}
                className={`
                  flex h-9 w-9 items-center justify-center
                  rounded-full ${subtleBackgroundClass}
                `}
              >
                <X size={17} />
              </button>
            </div>

            <div className="px-5">
              <div
                className={`
                  grid grid-cols-2 rounded-2xl border p-1
                  ${subtleBackgroundClass} ${subtleBorderClass}
                `}
              >
                <button
                  type="button"
                  onClick={() => setSelectedTestament('old')}
                  className={`
                    h-10 rounded-xl text-xs font-black
                    transition
                    ${
                      selectedTestament === 'old'
                        ? 'bg-brand-500 text-white shadow-sm'
                        : mutedTextClass
                    }
                  `}
                >
                  Antigo Testamento
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTestament('new')}
                  className={`
                    h-10 rounded-xl text-xs font-black
                    transition
                    ${
                      selectedTestament === 'new'
                        ? 'bg-brand-500 text-white shadow-sm'
                        : mutedTextClass
                    }
                  `}
                >
                  Novo Testamento
                </button>
              </div>

              <div className="relative mt-4">
                <Search
                  size={16}
                  className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${mutedTextClass}`}
                />

                <input
                  value={bookSearch}
                  onChange={(event) =>
                    setBookSearch(event.target.value)
                  }
                  placeholder="Buscar livro..."
                  className={`
                    h-11 w-full rounded-2xl border
                    bg-black/[0.06] pl-11 pr-4 text-sm
                    outline-none transition
                    focus:border-brand-400/40
                    ${subtleBorderClass}
                  `}
                />
              </div>
            </div>

            <div className="mt-4 max-h-[58vh] overflow-y-auto px-3 pb-32">
              {filteredBooks.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-bold">
                    Nenhum livro encontrado
                  </p>

                  <p
                    className={`mt-1 text-xs ${mutedTextClass}`}
                  >
                    Tente pesquisar por outro nome.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredBooks.map((item) => {
                    const isCurrentBook = item === book

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          navigateToChapter(item, 1)
                        }
                        className={`
                          flex w-full items-center justify-between
                          rounded-2xl px-4 py-3.5 text-left
                          transition active:scale-[0.99]
                          ${
                            isCurrentBook
                              ? 'bg-brand-500/15 text-brand-300'
                              : 'hover:bg-black/[0.04]'
                          }
                        `}
                      >
                        <div>
                          <p className="text-sm font-black">
                            {item}
                          </p>

                          <p
                            className={`mt-0.5 text-[10px] ${mutedTextClass}`}
                          >
                            {BOOK_CHAPTERS[item]}{' '}
                            {BOOK_CHAPTERS[item] === 1
                              ? 'capítulo'
                              : 'capítulos'}
                          </p>
                        </div>

                        {isCurrentBook && (
                          <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-brand-300">
                            Atual
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {pickerOpen === 'chapter' && (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm"
          onClick={() => setPickerOpen(null)}
        >
          <section
            onClick={(event) => event.stopPropagation()}
            className={`
              max-h-[84vh] w-full overflow-hidden
              rounded-t-[32px] border-t
              shadow-[0_-24px_80px_rgba(0,0,0,0.35)]
              ${sheetBackgroundClass} ${subtleBorderClass}
            `}
          >
            <div className="flex justify-center pt-3">
              <div
                className={`h-1 w-10 rounded-full ${subtleBackgroundClass}`}
              />
            </div>

            <div className="flex items-center justify-between px-5 pb-4 pt-4">
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.22em] ${mutedTextClass}`}
                >
                  {book}
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Escolha o capítulo
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPickerOpen(null)}
                className={`
                  flex h-9 w-9 items-center justify-center
                  rounded-full ${subtleBackgroundClass}
                `}
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[67vh] overflow-y-auto px-5 pb-32">
              <div className="grid grid-cols-5 gap-2.5">
                {Array.from(
                  { length: chapterCount },
                  (_, index) => index + 1
                ).map((chapterNumber) => {
                  const isCurrentChapter =
                    chapterNumber === chapter

                  return (
                    <button
                      key={chapterNumber}
                      type="button"
                      onClick={() =>
                        navigateToChapter(book, chapterNumber)
                      }
                      className={`
                        aspect-square rounded-2xl border
                        text-sm font-black transition
                        active:scale-95
                        ${
                          isCurrentChapter
                            ? 'border-brand-400 bg-brand-500 text-white shadow-[0_8px_24px_rgba(59,130,246,0.25)]'
                            : `${subtleBackgroundClass} ${subtleBorderClass}`
                        }
                      `}
                    >
                      {chapterNumber}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      {settingsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <section
            onClick={(event) => event.stopPropagation()}
            className={`
              max-h-[85vh] w-full overflow-y-auto
              rounded-t-[32px] border-t p-5 pb-32
              shadow-[0_-24px_80px_rgba(0,0,0,0.35)]
              ${sheetBackgroundClass} ${subtleBorderClass}
            `}
          >
            <div className="mb-4 flex justify-center">
              <div
                className={`h-1 w-10 rounded-full ${subtleBackgroundClass}`}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.22em] ${mutedTextClass}`}
                >
                  Leitura
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Aparência
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className={`
                  flex h-9 w-9 items-center justify-center
                  rounded-full ${subtleBackgroundClass}
                `}
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6">
              <p
                className={`mb-2 text-xs font-bold ${mutedTextClass}`}
              >
                Tema
              </p>

              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'sepia', 'light'] as const).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTheme(item)}
                      className={`
                        h-11 rounded-2xl text-sm font-bold
                        transition active:scale-[0.98]
                        ${
                          theme === item
                            ? 'bg-brand-500 text-white'
                            : subtleBackgroundClass
                        }
                      `}
                    >
                      {item === 'dark'
                        ? 'Escuro'
                        : item === 'sepia'
                          ? 'Sépia'
                          : 'Claro'}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-6">
              <p
                className={`mb-2 text-xs font-bold ${mutedTextClass}`}
              >
                Tamanho
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`
                    h-11 rounded-2xl text-sm font-bold
                    transition active:scale-[0.98]
                    ${
                      fontSize === 'normal'
                        ? 'bg-brand-500 text-white'
                        : subtleBackgroundClass
                    }
                  `}
                >
                  Padrão
                </button>

                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`
                    h-11 rounded-2xl text-sm font-bold
                    transition active:scale-[0.98]
                    ${
                      fontSize === 'large'
                        ? 'bg-brand-500 text-white'
                        : subtleBackgroundClass
                    }
                  `}
                >
                  Média
                </button>

                <button
                  type="button"
                  onClick={() => setFontSize('xlarge')}
                  className={`
                    h-11 rounded-2xl text-sm font-bold
                    transition active:scale-[0.98]
                    ${
                      fontSize === 'xlarge'
                        ? 'bg-brand-500 text-white'
                        : subtleBackgroundClass
                    }
                  `}
                >
                  Grande
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p
                className={`mb-2 text-xs font-bold ${mutedTextClass}`}
              >
                Fonte
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFontFamily('serif')}
                  className={`
                    h-11 rounded-2xl font-serif text-sm
                    font-bold transition active:scale-[0.98]
                    ${
                      fontFamily === 'serif'
                        ? 'bg-brand-500 text-white'
                        : subtleBackgroundClass
                    }
                  `}
                >
                  Clássica
                </button>

                <button
                  type="button"
                  onClick={() => setFontFamily('sans')}
                  className={`
                    h-11 rounded-2xl text-sm font-bold
                    transition active:scale-[0.98]
                    ${
                      fontFamily === 'sans'
                        ? 'bg-brand-500 text-white'
                        : subtleBackgroundClass
                    }
                  `}
                >
                  Moderna
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pb-7 pt-10">
        <div className="flex items-center justify-between gap-4">
          {previousChapter ? (
            <Link
              href={buildBibleHref(book, previousChapter)}
              className="
                pointer-events-auto flex h-12 min-w-[110px]
                items-center gap-2 rounded-full border
                border-white/[0.10] bg-black/35 px-4
                text-white backdrop-blur-xl
                transition active:scale-95
              "
            >
              <ChevronLeft size={17} />

              <div className="text-left">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                  Anterior
                </p>

                <p className="text-xs font-black">
                  Cap. {previousChapter}
                </p>
              </div>
            </Link>
          ) : (
            <div className="min-w-[110px]" />
          )}

          {nextChapter ? (
            <Link
              href={buildBibleHref(book, nextChapter)}
              className="
                pointer-events-auto flex h-12 min-w-[110px]
                items-center justify-end gap-2 rounded-full
                border border-white/[0.10] bg-black/35 px-4
                text-white backdrop-blur-xl
                transition active:scale-95
              "
            >
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                  Próximo
                </p>

                <p className="text-xs font-black">
                  Cap. {nextChapter}
                </p>
              </div>

              <ChevronRight size={17} />
            </Link>
          ) : (
            <div className="min-w-[110px]" />
          )}
        </div>
      </nav>
    </div>
  )
}