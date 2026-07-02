'use client'

import { useState, useTransition } from 'react'
import {
  OLD_TESTAMENT,
  NEW_TESTAMENT,
  BOOK_CHAPTERS,
  fetchBibleChapter,
} from '@/lib/bible'
import {
  BookOpen,
  Hash,
  ChevronDown,
  Loader2,
  PenLine,
  CheckCircle2,
  X,
} from 'lucide-react'

interface Props {
  initialVerse?: string | null
  initialRef?: string | null
  verseName?: string
  refName?: string
  label?: string
}

const selectClass =
  'w-full h-11 bg-app-card border border-app rounded-2xl pl-10 pr-8 text-[13px] text-app focus:outline-none focus:border-brand-500/50 transition-all duration-300 appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'

const optionClass = 'bg-app text-app'

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}

      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
      />
    </div>
  )
}

export default function VersiculoSelector({
  initialVerse,
  initialRef,
  verseName = 'favorite_verse',
  refName = 'favorite_verse_ref',
  label = 'Versículo favorito',
}: Props) {
  const [mode, setMode] = useState<'selector' | 'manual'>('selector')

  const [book, setBook] = useState('')
  const [chapter, setChapter] = useState('')
  const [verse, setVerse] = useState('')

  const [verseList, setVerseList] = useState<{ verse: number; text: string }[]>([])
  const [isPending, startTransition] = useTransition()

  const [confirmedVerse, setConfirmedVerse] = useState(initialVerse ?? '')
  const [confirmedRef, setConfirmedRef] = useState(initialRef ?? '')
  const [confirmedBook, setConfirmedBook] = useState('')
  const [confirmedChapter, setConfirmedChapter] = useState('')
  const [confirmedNumber, setConfirmedNumber] = useState('')

  const [preview, setPreview] = useState<{ text: string; ref: string } | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  function handleBookChange(newBook: string) {
    setBook(newBook)
    setChapter('')
    setVerse('')
    setVerseList([])
    setPreview(null)
    setFetchError(null)
  }

  function handleChapterChange(newChapter: string) {
    setChapter(newChapter)
    setVerse('')
    setVerseList([])
    setPreview(null)
    setFetchError(null)

    if (!book || !newChapter) return

    startTransition(async () => {
      try {
        const data = await fetchBibleChapter(book, parseInt(newChapter))
        setVerseList(data.verses.map((v) => ({ verse: v.verse, text: v.text })))
      } catch {
        setVerseList([])
        setFetchError('Não foi possível carregar os versículos. Use o modo manual.')
      }
    })
  }

  function handleVerseChange(verseNum: string) {
    setVerse(verseNum)

    if (!verseNum) {
      setPreview(null)
      setConfirmedVerse('')
      setConfirmedRef('')
      return
    }

    const found = verseList.find((v) => String(v.verse) === verseNum)

    if (found) {
      const ref = `${book} ${chapter}:${verseNum}`
      const text = found.text.trim()

      setPreview({ text, ref })
      setConfirmedVerse(text)
      setConfirmedRef(ref)
      setConfirmedBook(book)
      setConfirmedChapter(chapter)
      setConfirmedNumber(verseNum)
    }
  }

  function handleConfirm() {
    if (!preview) return
    setPreview(null)
  }

  function handleClear() {
    setConfirmedVerse('')
    setConfirmedRef('')
    setConfirmedBook('')
    setConfirmedChapter('')
    setConfirmedNumber('')
    setBook('')
    setChapter('')
    setVerse('')
    setVerseList([])
    setPreview(null)
    setFetchError(null)
  }

  const chapters = book
    ? Array.from({ length: BOOK_CHAPTERS[book] ?? 0 }, (_, i) => i + 1)
    : []

  const hasConfirmed = confirmedVerse !== '' || confirmedRef !== ''

  return (
    <div className="space-y-3">
      <input type="hidden" name={verseName} value={confirmedVerse} />
      <input type="hidden" name={refName} value={confirmedRef} />
      <input type="hidden" name="verse_book" value={confirmedBook} />
      <input type="hidden" name="verse_chapter" value={confirmedChapter} />
      <input type="hidden" name="verse_number" value={confirmedNumber} />

      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-[12px] font-black text-app-muted uppercase tracking-wider">
          {label}
        </span>

        <button
          type="button"
          onClick={() => setMode((m) => (m === 'selector' ? 'manual' : 'selector'))}
          className="flex items-center gap-1 text-[11px] text-brand-400/80 hover:text-brand-400 transition-colors shrink-0"
        >
          <PenLine size={11} />
          {mode === 'selector' ? 'Editar manualmente' : 'Usar seletor bíblico'}
        </button>
      </div>

      {mode === 'selector' && (
        <div className="space-y-2.5">
          <SelectWrapper>
            <BookOpen
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
            />

            <select
              value={book}
              onChange={(e) => handleBookChange(e.target.value)}
              className={selectClass}
            >
              <option value="" className={optionClass}>
                Selecione o livro...
              </option>

              <optgroup label="Antigo Testamento" className={optionClass}>
                {OLD_TESTAMENT.map((b) => (
                  <option key={b} value={b} className={optionClass}>
                    {b}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Novo Testamento" className={optionClass}>
                {NEW_TESTAMENT.map((b) => (
                  <option key={b} value={b} className={optionClass}>
                    {b}
                  </option>
                ))}
              </optgroup>
            </select>
          </SelectWrapper>

          <div className="grid grid-cols-2 gap-2">
            <SelectWrapper>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-app-muted pointer-events-none font-mono">
                Cap
              </span>

              <select
                value={chapter}
                onChange={(e) => handleChapterChange(e.target.value)}
                disabled={!book}
                className={selectClass}
                style={{ paddingLeft: '2.75rem' }}
              >
                <option value="" className={optionClass}>
                  —
                </option>

                {chapters.map((c) => (
                  <option key={c} value={String(c)} className={optionClass}>
                    {c}
                  </option>
                ))}
              </select>
            </SelectWrapper>

            <SelectWrapper>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-app-muted pointer-events-none font-mono">
                Vers
              </span>

              {isPending ? (
                <div className="w-full h-11 bg-app-card border border-app rounded-2xl flex items-center justify-center">
                  <Loader2 size={14} className="animate-spin text-app-muted" />
                </div>
              ) : (
                <select
                  value={verse}
                  onChange={(e) => handleVerseChange(e.target.value)}
                  disabled={verseList.length === 0}
                  className={selectClass}
                  style={{ paddingLeft: '2.75rem' }}
                >
                  <option value="" className={optionClass}>
                    —
                  </option>

                  {verseList.map((v) => (
                    <option key={v.verse} value={String(v.verse)} className={optionClass}>
                      {v.verse}
                    </option>
                  ))}
                </select>
              )}
            </SelectWrapper>
          </div>

          {fetchError && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3">
              <p className="text-[12px] text-red-400">{fetchError}</p>
            </div>
          )}

          {preview && (
            <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3.5 space-y-2">
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-brand-400/70" />

              <p className="pl-3 text-[13px] text-app leading-relaxed italic">
                &quot;{preview.text}&quot;
              </p>

              <p className="pl-3 text-[11px] text-brand-400 font-medium">
                {preview.ref}
              </p>

              <button
                type="button"
                onClick={handleConfirm}
                className="ml-3 flex items-center gap-1.5 text-[12px] text-brand-400 font-semibold mt-1"
              >
                <CheckCircle2 size={13} />
                Usar este versículo
              </button>
            </div>
          )}

          {hasConfirmed && !preview && (
            <div className="relative overflow-hidden rounded-2xl border border-app bg-app-card p-3.5 space-y-1.5">
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-brand-400/60" />

              <div className="flex items-start justify-between gap-2">
                <p className="pl-3 text-[12px] text-app-muted leading-relaxed italic flex-1">
                  &quot;{confirmedVerse}&quot;
                </p>

                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-0.5 text-app-muted hover:text-red-400 transition-colors shrink-0"
                  aria-label="Remover versículo"
                >
                  <X size={13} />
                </button>
              </div>

              <p className="pl-3 text-[11px] text-brand-400/80">
                {confirmedRef}
              </p>
            </div>
          )}

          {!hasConfirmed && !preview && (
            <p className="text-[11px] text-app-muted px-1">
              Selecione livro → capítulo → versículo para confirmar.
            </p>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-2.5">
          <ManualFields
            initialVerse={confirmedVerse}
            initialRef={confirmedRef}
            onChange={(v, r) => {
              setConfirmedVerse(v)
              setConfirmedRef(r)
            }}
          />
        </div>
      )}
    </div>
  )
}

function ManualFields({
  initialVerse,
  initialRef,
  onChange,
}: {
  initialVerse: string
  initialRef: string
  onChange: (verse: string, ref: string) => void
}) {
  const [verse, setVerse] = useState(initialVerse)
  const [ref, setRef] = useState(initialRef)

  function handleVerseChange(v: string) {
    setVerse(v)
    onChange(v, ref)
  }

  function handleRefChange(r: string) {
    setRef(r)
    onChange(verse, r)
  }

  return (
    <>
      <div className="relative">
        <BookOpen
          size={14}
          className="absolute left-3.5 top-3.5 text-app-muted pointer-events-none"
        />

        <textarea
          value={verse}
          onChange={(e) => handleVerseChange(e.target.value)}
          placeholder="Digite o texto do versículo..."
          maxLength={300}
          rows={3}
          className="w-full bg-app-card border border-app rounded-2xl pl-10 pr-4 pt-3 pb-3 text-[14px] text-app placeholder:text-app-muted/60 focus:outline-none focus:border-brand-500/50 transition-colors resize-none leading-relaxed"
        />
      </div>

      <div className="relative">
        <Hash
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
        />

        <input
          type="text"
          value={ref}
          onChange={(e) => handleRefChange(e.target.value)}
          placeholder="Ex: João 3:16"
          maxLength={40}
          className="w-full h-12 bg-app-card border border-app rounded-2xl pl-10 pr-4 text-[14px] text-app placeholder:text-app-muted/60 focus:outline-none focus:border-brand-500/50 transition-colors"
        />
      </div>

      <p className="text-[11px] text-app-muted px-1">
        Editando manualmente. Use o seletor bíblico para buscar pelo texto.
      </p>
    </>
  )
}