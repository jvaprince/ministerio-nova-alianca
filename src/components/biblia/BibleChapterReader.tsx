'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  MessageCircle,
  Highlighter,
  X,
  Trash2,
  Sparkles,
  Send,
} from 'lucide-react'
import { fetchBibleChapter, type BibleChapter } from '@/lib/biblia'
import {
  toggleBibleFavorite,
  createBibleNote,
  deleteBibleNote,
  markBibleChapterAsRead,
  toggleBibleHighlight,
} from '@/lib/biblia/actions'

const HIGHLIGHT_COLORS = [
  {
    key: 'yellow',
    label: 'Amarelo',
    activeClass: 'bg-yellow-400/25',
    buttonClass: 'bg-yellow-400',
  },
  {
    key: 'green',
    label: 'Verde',
    activeClass: 'bg-emerald-400/20',
    buttonClass: 'bg-emerald-400',
  },
  {
    key: 'blue',
    label: 'Azul',
    activeClass: 'bg-sky-400/20',
    buttonClass: 'bg-sky-400',
  },
  {
    key: 'purple',
    label: 'Roxo',
    activeClass: 'bg-purple-400/20',
    buttonClass: 'bg-purple-400',
  },
]

function getHighlightColor(color?: string | null) {
  return HIGHLIGHT_COLORS.find((item) => item.key === color) ?? HIGHLIGHT_COLORS[0]
}

export default function BibleChapterReader({
  currentUserId,
  book,
  chapter,
  initialVerse = null,
  favorites,
  notes,
  highlights,
  communityFavorites,
  communityHighlights,
  palavraRefs,
searchQuery = '',
readerTextClass = 'text-white/90',
fontSize = 'normal',
fontFamily = 'serif',
}: {
  currentUserId: string
  book: string
  chapter: number
  initialVerse?: number | null
  favorites: any[]
  notes: any[]
  highlights: any[]
  communityFavorites: any[]
  communityHighlights: any[]
  palavraRefs: any[]
  searchQuery?: string
  readerTextClass?: string
fontSize?: 'normal' | 'large' | 'xlarge'
fontFamily?: 'serif' | 'sans'
}) {
  const [data, setData] = useState<BibleChapter | null>(null)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [showNotes, setShowNotes] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  const [localHighlights, setLocalHighlights] = useState(highlights)
  const [localFavorites, setLocalFavorites] = useState(favorites)

  useEffect(() => {
  fetchBibleChapter(book, chapter).then((chapterData) => {
    setData(chapterData)

    if (initialVerse) {
      setSelectedVerse(initialVerse)
    } else {
      setSelectedVerse(null)
    }
  })

  markBibleChapterAsRead(book, chapter)
}, [book, chapter, initialVerse])

  if (!data) {
    return <p className="text-white/40 text-sm">Carregando capítulo...</p>
  }

  const selectedText = data.verses.find((v) => v.verse === selectedVerse)
  const selectedNotes = notes.filter((n) => n.verse === selectedVerse)

  const selectedFavorite = localFavorites.find((f) => f.verse === selectedVerse)
  const selectedHighlight = localHighlights.find((h) => h.verse === selectedVerse)
  const selectedHighlightColor = getHighlightColor(selectedHighlight?.color)

  const selectedPalavra = palavraRefs.find((p) => p.verse_number === selectedVerse)

  const selectedFavoriteCount = communityFavorites.filter((f) => f.verse === selectedVerse).length
  const selectedHighlightCount = communityHighlights.filter((h) => h.verse === selectedVerse).length

  function openVerse(verse: number) {
    setSelectedVerse(verse)
    setShowNotes(false)
  }

  async function handleFavorite() {
    if (!selectedVerse) return

    const alreadyFavorite = localFavorites.some((f) => f.verse === selectedVerse)

    setLocalFavorites(
      alreadyFavorite
        ? localFavorites.filter((f) => f.verse !== selectedVerse)
        : [...localFavorites, { verse: selectedVerse }]
    )

    await toggleBibleFavorite({ book, chapter, verse: selectedVerse })
  }

  async function handleHighlight(color: string) {
    if (!selectedVerse) return

    const existing = localHighlights.find((h) => h.verse === selectedVerse)

    if (existing?.color === color) {
      setLocalHighlights(localHighlights.filter((h) => h.verse !== selectedVerse))
    } else if (existing) {
      setLocalHighlights(
        localHighlights.map((h) =>
          h.verse === selectedVerse ? { ...h, color } : h
        )
      )
    } else {
      setLocalHighlights([...localHighlights, { verse: selectedVerse, color }])
    }

    await toggleBibleHighlight({ book, chapter, verse: selectedVerse, color })
  }

  const readerFontSize =
  fontSize === 'xlarge'
    ? 'text-[30px]'
    : fontSize === 'large'
      ? 'text-[27px]'
      : 'text-[24px]'

const readerFontFamily =
  fontFamily === 'sans' ? 'font-sans' : 'font-serif'

  return (
    <>
      <article className={`${readerFontFamily} ${readerTextClass} ${readerFontSize} leading-[2.05] pb-28`}>
        {data.verses.map((verse) => {
          const favorite = localFavorites.find(
  (f) => f.verse === verse.verse
)
          const highlight = localHighlights.find((h) => h.verse === verse.verse)
const highlightColor = getHighlightColor(highlight?.color)
const verseNotes = notes.filter((n) => n.verse === verse.verse)
const versePalavra = palavraRefs.find(
  (p) => p.verse_number === verse.verse
)
const isSelected = selectedVerse === verse.verse
const matchesSearch =
  searchQuery.trim().length > 0 &&
  verse.text.toLowerCase().includes(searchQuery.toLowerCase())

          return (
            <button
              key={verse.verse}
              type="button"
              onClick={() => openVerse(verse.verse)}
                className={`inline text-left rounded-lg transition text-inherit ${
  matchesSearch
    ? 'bg-brand-500/25 text-white'
    : isSelected
      ? 'bg-brand-500/20'
      : highlight
        ? highlightColor.activeClass
        : favorite
          ? 'bg-red-500/10'
          : ''
}`}
            >
              <sup className="text-[12px] text-brand-400 font-sans font-bold mr-1">
                {verse.verse}
              </sup>

              <span className="text-inherit">
  {verse.text.trim()}{' '}
</span>

              {verseNotes.length > 0 && (
  <span className="inline-flex items-center gap-1 ml-1 align-middle rounded-full bg-brand-500/15 border border-brand-500/20 px-1.5 py-0.5">
    <MessageCircle size={12} className="text-brand-400" />
    <span className="font-sans text-[10px] leading-none text-brand-400 font-bold">
      {verseNotes.length}
    </span>
  </span>
)}

{versePalavra && (
  <span
    title="Já foi Palavra do Dia"
    className="inline-flex items-center ml-1 align-middle"
  >
    <Sparkles
  size={13}
  className="text-yellow-400"
/>
  </span>
)}
            </button>
          )
        })}
      </article>

      {selectedVerse && selectedText && (
        <div className="fixed inset-0 z-50 bg-black/10 flex items-end">
          <div className="w-full rounded-t-[32px] bg-[#101622] border-t border-white/[0.08] max-h-[86vh] flex flex-col">
            <div className="p-5 border-b border-white/[0.06] shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-brand-400 text-xs font-bold uppercase tracking-widest">
                    {book} {chapter}:{selectedVerse}
                  </p>

                  <p className="font-serif text-white/90 text-xl leading-relaxed mt-2">
                    {selectedText.text}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVerse(null)}
                  className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/60 shrink-0"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-5 pb-28">
              {selectedPalavra && (
                <Link
                  href={`/palavra/${selectedPalavra.id}`}
                  className="mb-4 flex items-center gap-3 rounded-2xl bg-brand-500/12 border border-brand-500/20 p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Este versículo já foi Palavra do Dia
                    </p>

                    <p className="text-xs text-white/45 mt-0.5">
                      {new Date(`${selectedPalavra.scheduled_date}T12:00:00`).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2 mb-5">
                <form action={handleFavorite}>
                  <button
                    type="submit"
                    className={`w-full h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 text-xs font-bold ${
                      selectedFavorite
                        ? 'bg-red-500/15 border-red-500/25 text-red-400'
                        : 'bg-white/[0.04] border-white/[0.07] text-white/60'
                    }`}
                  >
                    <Heart size={19} fill={selectedFavorite ? 'currentColor' : 'none'} />
                    {selectedFavoriteCount > 0 ? `${selectedFavoriteCount} fav.` : 'Favoritar'}
                  </button>
                </form>

                <form
                  action={async () => {
                    await handleHighlight(selectedHighlight?.color ?? 'yellow')
                  }}
                >
                  <button
                    type="submit"
                    className={`w-full h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 text-xs font-bold ${
                      selectedHighlight
                        ? `${selectedHighlightColor.activeClass} border-white/20`
                        : 'bg-white/[0.04] border-white/[0.07] text-white/60'
                    }`}
                  >
                    <Highlighter size={19} />
                    {selectedHighlight ? 'Desgrifar' : 'Grifar'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setShowNotes((value) => !value)}
                  className={`h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 text-xs font-bold ${
                    showNotes
                      ? 'bg-brand-500/15 border-brand-500/25 text-brand-400'
                      : 'bg-white/[0.04] border-white/[0.07] text-white/60'
                  }`}
                >
                  <MessageCircle size={19} />
                  Anotações ({selectedNotes.length})
                </button>

                <Link
                  href={`/feed/criar?content=${encodeURIComponent(
                    `"${selectedText.text}"\n\n— ${book} ${chapter}:${selectedVerse}`
                  )}&post_type=reflexao`}
                  className="w-full h-20 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex flex-col items-center justify-center gap-1 text-xs font-bold text-brand-400"
                >
                  <Send size={19} />
                  Postar no feed
                </Link>
              </div>

              {selectedHighlight && (
  <div id="highlight-colors" className="mb-5">
    <p className="text-xs font-bold text-white/45 uppercase tracking-wider mb-2">
      Cor do grifo
    </p>

    <div className="grid grid-cols-4 gap-2">
      {HIGHLIGHT_COLORS.map((color) => {
        const active = selectedHighlight?.color === color.key

        return (
          <form
            key={color.key}
            action={async () => {
              await handleHighlight(color.key)
            }}
          >
            <button
              type="submit"
              className={`w-full h-11 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold ${
                active
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'bg-white/[0.04] border-white/[0.07] text-white/45'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${color.buttonClass}`} />
              {color.label}
            </button>
          </form>
        )
      })}
    </div>
  </div>
)}

              {showNotes && (
                <div className="space-y-4">
                  <form
                    ref={formRef}
                    action={async (formData) => {
                      await createBibleNote(formData)
                      formRef.current?.reset()
                    }}
                    className="space-y-2"
                  >
                    <input type="hidden" name="book" value={book} />
                    <input type="hidden" name="chapter" value={chapter} />
                    <input type="hidden" name="verse" value={selectedVerse} />
                    <input type="hidden" name="is_public" value="on" />

                    <textarea
                      name="content"
                      placeholder="Escreva sua anotação pública..."
                      rows={3}
                      required
                      className="w-full rounded-2xl bg-black/25 border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
                    />

                    <button
                      type="submit"
                      className="w-full h-11 rounded-2xl bg-brand-gradient text-white text-sm font-bold"
                    >
                      Publicar anotação
                    </button>
                  </form>

                  <div>
                    <h3 className="text-white font-bold text-sm mb-3">
                      Anotações da comunidade
                    </h3>

                    {selectedNotes.length === 0 ? (
                      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4">
                        <p className="text-sm text-white/45">
                          Nenhuma anotação neste versículo ainda.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedNotes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                               <Link
  href={`/perfil/${note.profile?.username}`}
  className="flex items-center gap-3 mb-2"
>
  <img
    src={
      note.profile?.avatar_url ||
      '/images/avatar-placeholder.png'
    }
    alt={note.profile?.name}
    className="w-8 h-8 rounded-full object-cover border border-white/10"
  />

  <div>
    <p className="text-sm text-white font-semibold leading-none">
      {note.profile?.name ?? 'Membro'}
    </p>

    {note.profile?.username && (
      <p className="text-[11px] text-white/40 mt-1">
        @{note.profile.username}
      </p>
    )}
  </div>
</Link>

                                <p className="text-sm text-white/70 mt-1 leading-relaxed">
                                  {note.content}
                                </p>
                              </div>

                              {note.user_id === currentUserId && (
  <form
    action={async () => {
      await deleteBibleNote(note.id, book, chapter)
    }}
  >
    <button
      type="submit"
      className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400/70"
    >
      <Trash2 size={14} />
    </button>
  </form>
)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}