'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'
import { BOOK_CHAPTERS } from '@/lib/biblia'

type Testament = 'old' | 'new'

type BibleBooksSearchProps = {
  oldTestament: string[]
  newTestament: string[]
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export default function BibleBooksSearch({
  oldTestament,
  newTestament,
}: BibleBooksSearchProps) {
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [selectedTestament, setSelectedTestament] =
    useState<Testament>('new')
  const [selectedBook, setSelectedBook] = useState<string | null>(null)

  const allBooks = useMemo(
    () => [...oldTestament, ...newTestament],
    [oldTestament, newTestament]
  )

  const parsedSearch = useMemo(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return {
        bookQuery: '',
        chapter: null as number | null,
      }
    }

    const match = trimmedQuery.match(/^(.*?)(?:\s+(\d+))?$/)

    const bookQuery = match?.[1]?.trim() ?? trimmedQuery
    const chapter = match?.[2] ? Number(match[2]) : null

    return {
      bookQuery,
      chapter,
    }
  }, [query])

  const searchResults = useMemo(() => {
    if (!parsedSearch.bookQuery) return []

    const normalizedBookQuery = normalizeText(parsedSearch.bookQuery)

    return allBooks
      .filter((book) =>
        normalizeText(book).includes(normalizedBookQuery)
      )
      .sort((a, b) => {
        const normalizedA = normalizeText(a)
        const normalizedB = normalizeText(b)

        const aStarts = normalizedA.startsWith(normalizedBookQuery)
        const bStarts = normalizedB.startsWith(normalizedBookQuery)

        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1

        return normalizedA.localeCompare(normalizedB)
      })
      .slice(0, 8)
  }, [allBooks, parsedSearch.bookQuery])

  const displayedBooks =
    selectedTestament === 'old' ? oldTestament : newTestament

  const selectedBookChapters = selectedBook
    ? BOOK_CHAPTERS[selectedBook] ?? 1
    : 0

  function openBook(book: string, chapter = 1) {
    const totalChapters = BOOK_CHAPTERS[book] ?? 1
    const safeChapter = Math.min(Math.max(chapter, 1), totalChapters)

    closeSelector()
    setQuery('')

    router.push(`/biblia/${book}/${safeChapter}`)
  }

  function handleSearchSubmit() {
    const firstResult = searchResults[0]

    if (!firstResult) return

    openBook(firstResult, parsedSearch.chapter ?? 1)
  }

  function openTestament(testament: Testament) {
    setSelectedTestament(testament)
    setSelectedBook(null)
    setIsSelectorOpen(true)
  }

  function closeSelector() {
    setIsSelectorOpen(false)
    setSelectedBook(null)
  }

  function selectBook(book: string) {
    setSelectedBook(book)
  }

  return (
    <>
      <div className="space-y-3">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSearchSubmit()
          }}
          className="relative"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar livro ou capítulo..."
            autoComplete="off"
            enterKeyHint="go"
            className="
              h-[54px] w-full rounded-[20px]
              border border-white/[0.09]
              bg-white/[0.045]
              pl-11 pr-11
              text-[15px] font-medium text-white
              outline-none
              placeholder:text-white/30
              focus:border-brand-400/40
              focus:bg-white/[0.06]
            "
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpar pesquisa"
              className="
                absolute right-3 top-1/2
                flex h-8 w-8 -translate-y-1/2
                items-center justify-center
                rounded-full bg-white/[0.06]
                text-white/40
                active:scale-95
              "
            >
              <X size={15} />
            </button>
          )}
        </form>

        {query.trim() && (
          <div
            className="
              overflow-hidden rounded-[22px]
              border border-white/[0.08]
              bg-[#0b1020]/95
              backdrop-blur-2xl
            "
          >
            {searchResults.length > 0 ? (
              searchResults.map((book, index) => {
                const requestedChapter = parsedSearch.chapter
                const totalChapters = BOOK_CHAPTERS[book] ?? 1

                const validRequestedChapter =
                  requestedChapter &&
                  requestedChapter >= 1 &&
                  requestedChapter <= totalChapters
                    ? requestedChapter
                    : null

                return (
                  <button
                    key={book}
                    type="button"
                    onClick={() =>
                      openBook(book, validRequestedChapter ?? 1)
                    }
                    className={`
                      flex w-full items-center gap-3
                      px-4 py-3.5 text-left
                      transition active:bg-white/[0.06]
                      ${
                        index !== searchResults.length - 1
                          ? 'border-b border-white/[0.06]'
                          : ''
                      }
                    `}
                  >
                    <div
                      className="
                        flex h-10 w-10 shrink-0
                        items-center justify-center
                        rounded-2xl bg-brand-500/10
                        text-brand-300
                      "
                    >
                      <BookOpen size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">
                        {book}
                        {validRequestedChapter
                          ? ` ${validRequestedChapter}`
                          : ''}
                      </p>

                      <p className="mt-0.5 text-[11px] text-white/35">
                        {validRequestedChapter
                          ? `Abrir diretamente o capítulo ${validRequestedChapter}`
                          : `${totalChapters} ${
                              totalChapters === 1
                                ? 'capítulo'
                                : 'capítulos'
                            }`}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-white/25"
                    />
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-5 text-center">
                <p className="text-sm font-semibold text-white/55">
                  Nenhum livro encontrado
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Tente pesquisar por João, Salmos 23 ou Romanos 8.
                </p>
              </div>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => openTestament('old')}
              className="
                flex min-h-[70px] items-center
                justify-between gap-3
                rounded-[20px]
                border border-white/[0.08]
                bg-white/[0.035]
                px-4 text-left
                transition
                active:scale-[0.98]
                active:bg-white/[0.06]
              "
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">
                  Antigo
                </p>

                <p className="mt-0.5 text-[11px] text-white/35">
                  {oldTestament.length} livros
                </p>
              </div>

              <ChevronRight
                size={17}
                className="shrink-0 text-white/25"
              />
            </button>

            <button
              type="button"
              onClick={() => openTestament('new')}
              className="
                flex min-h-[70px] items-center
                justify-between gap-3
                rounded-[20px]
                border border-white/[0.08]
                bg-white/[0.035]
                px-4 text-left
                transition
                active:scale-[0.98]
                active:bg-white/[0.06]
              "
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">
                  Novo
                </p>

                <p className="mt-0.5 text-[11px] text-white/35">
                  {newTestament.length} livros
                </p>
              </div>

              <ChevronRight
                size={17}
                className="shrink-0 text-white/25"
              />
            </button>
          </div>
        )}
      </div>

      {isSelectorOpen && (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Fechar seleção"
            onClick={closeSelector}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div
            className="
              absolute inset-x-0 bottom-0
              mx-auto flex max-h-[85dvh]
              w-full max-w-2xl flex-col
              overflow-hidden
              rounded-t-[30px]
              border-x border-t border-white/[0.1]
              bg-[#090d19]
              pb-[env(safe-area-inset-bottom)]
            "
          >
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <div className="h-1.5 w-10 rounded-full bg-white/15" />
            </div>

            <div
              className="
                flex shrink-0 items-center
                justify-between gap-3
                border-b border-white/[0.07]
                px-5 pb-4 pt-2
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                {selectedBook && (
                  <button
                    type="button"
                    onClick={() => setSelectedBook(null)}
                    aria-label="Voltar para os livros"
                    className="
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-full bg-white/[0.06]
                      text-white/65
                      active:scale-95
                    "
                  >
                    <ArrowLeft size={17} />
                  </button>
                )}

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-300/70">
                    {selectedBook
                      ? 'Escolha o capítulo'
                      : 'Escolha o livro'}
                  </p>

                  <h2 className="mt-1 truncate text-xl font-black text-white">
                    {selectedBook
                      ? selectedBook
                      : selectedTestament === 'old'
                        ? 'Antigo Testamento'
                        : 'Novo Testamento'}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSelector}
                aria-label="Fechar"
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full bg-white/[0.06]
                  text-white/50
                  active:scale-95
                "
              >
                <X size={17} />
              </button>
            </div>

            {!selectedBook ? (
              <>
                <div className="grid shrink-0 grid-cols-2 gap-2 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTestament('old')}
                    className={`
                      flex h-11 items-center justify-center gap-2
                      rounded-2xl border
                      text-sm font-bold transition
                      ${
                        selectedTestament === 'old'
                          ? 'border-brand-400/25 bg-brand-500/15 text-brand-200'
                          : 'border-white/[0.07] bg-white/[0.035] text-white/45'
                      }
                    `}
                  >
                    Antigo
                    {selectedTestament === 'old' && (
                      <Check size={14} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTestament('new')}
                    className={`
                      flex h-11 items-center justify-center gap-2
                      rounded-2xl border
                      text-sm font-bold transition
                      ${
                        selectedTestament === 'new'
                          ? 'border-brand-400/25 bg-brand-500/15 text-brand-200'
                          : 'border-white/[0.07] bg-white/[0.035] text-white/45'
                      }
                    `}
                  >
                    Novo
                    {selectedTestament === 'new' && (
                      <Check size={14} />
                    )}
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
                  <div
                    className="
                      overflow-hidden rounded-[22px]
                      border border-white/[0.07]
                      bg-white/[0.025]
                    "
                  >
                    {displayedBooks.map((book, index) => (
                      <button
                        key={book}
                        type="button"
                        onClick={() => selectBook(book)}
                        className={`
                          flex w-full items-center
                          justify-between gap-3
                          px-4 py-3.5 text-left
                          active:bg-white/[0.05]
                          ${
                            index !== displayedBooks.length - 1
                              ? 'border-b border-white/[0.055]'
                              : ''
                          }
                        `}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {book}
                          </p>

                          <p className="mt-0.5 text-[11px] text-white/30">
                            {BOOK_CHAPTERS[book]}{' '}
                            {BOOK_CHAPTERS[book] === 1
                              ? 'capítulo'
                              : 'capítulos'}
                          </p>
                        </div>

                        <ChevronRight
                          size={16}
                          className="shrink-0 text-white/25"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="grid grid-cols-5 gap-2.5">
                  {Array.from(
                    { length: selectedBookChapters },
                    (_, index) => index + 1
                  ).map((chapter) => (
                    <button
                      key={chapter}
                      type="button"
                      onClick={() => openBook(selectedBook, chapter)}
                      className="
                        flex aspect-square items-center
                        justify-center rounded-2xl
                        border border-white/[0.075]
                        bg-white/[0.035]
                        text-sm font-bold text-white/70
                        transition
                        active:scale-95
                        active:border-brand-400/30
                        active:bg-brand-500/15
                        active:text-brand-200
                      "
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}