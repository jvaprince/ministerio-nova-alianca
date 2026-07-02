'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Search, MoreHorizontal, X } from 'lucide-react'
import BibleChapterReader from '@/components/biblia/BibleChapterReader'

export default function BibleChapterExperience({
  currentUserId,
  backToJourney,
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const themeKey = `bible-theme-${currentUserId}`
  const fontSizeKey = `bible-font-size-${currentUserId}`
  const fontFamilyKey = `bible-font-family-${currentUserId}`

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    if (typeof window === 'undefined') return 'normal'
    const saved = localStorage.getItem(fontSizeKey)
    return saved === 'normal' || saved === 'large' || saved === 'xlarge'
      ? saved
      : 'normal'
  })

  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>(() => {
    if (typeof window === 'undefined') return 'serif'
    const saved = localStorage.getItem(fontFamilyKey)
    return saved === 'serif' || saved === 'sans' ? saved : 'serif'
  })

  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem(themeKey)
    return saved === 'dark' || saved === 'sepia' || saved === 'light'
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

      const backQuery = backToJourney
  ? `?backToJourney=${backToJourney}`
  : ''

  return (
    <div className={`min-h-screen pb-24 ${themeClass} bible-reading-page`}>
      <div className="sticky top-0 z-30 bg-inherit/95 backdrop-blur border-b border-white/[0.06]">
        <div className="px-4 pt-10 pb-3 flex items-center justify-between gap-3">
          <Link
  href={backToJourney ? `/biblia/jornada/${backToJourney}/plano` : '/biblia'}
            className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2">
            <div className="h-10 px-4 rounded-2xl bg-black/10 border border-white/[0.08] flex items-center font-bold">
              {book} {chapter}
            </div>

            <div className="h-10 px-4 rounded-2xl bg-black/10 border border-white/[0.08] flex items-center font-semibold opacity-70">
              ACF
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="px-4 pb-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar neste capítulo..."
              className="w-full h-11 rounded-2xl bg-black/15 border border-white/[0.10] px-4 text-sm outline-none"
            />
          </div>
        )}
      </div>

      <div className="px-5 pt-8">
        <h1 className="text-[30px] leading-tight font-serif font-bold mb-7">
          {book} {chapter}
        </h1>

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
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end">
          <div className="w-full rounded-t-[32px] bg-[#101622] border-t border-white/[0.08] p-5 space-y-4 max-h-[85vh] overflow-y-auto pb-32">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Aparência</h2>

              <button
                onClick={() => setSettingsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/[0.06] text-white/60 flex items-center justify-center"
              >
                <X size={17} />
              </button>
            </div>

            <div>
              <p className="text-xs text-white/40 font-bold mb-2">Tema</p>

              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'sepia', 'light'] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setTheme(item)}
                    className={`h-11 rounded-2xl text-sm ${
                      theme === item
                        ? 'bg-brand-500 text-white'
                        : 'bg-white/[0.06] text-white'
                    }`}
                  >
                    {item === 'dark'
                      ? 'Escuro'
                      : item === 'sepia'
                        ? 'Sépia'
                        : 'Claro'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 font-bold mb-2">Tamanho</p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`h-11 rounded-2xl text-sm ${
                    fontSize === 'normal'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/[0.06] text-white'
                  }`}
                >
                  Padrão
                </button>

                <button
                  onClick={() => setFontSize('large')}
                  className={`h-11 rounded-2xl text-sm ${
                    fontSize === 'large'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/[0.06] text-white'
                  }`}
                >
                  Média
                </button>

                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`h-11 rounded-2xl text-sm ${
                    fontSize === 'xlarge'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/[0.06] text-white'
                  }`}
                >
                  Grande
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 font-bold mb-2">Fonte</p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFontFamily('serif')}
                  className={`h-11 rounded-2xl text-sm ${
                    fontFamily === 'serif'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/[0.06] text-white'
                  }`}
                >
                  Clássica
                </button>

                <button
                  onClick={() => setFontFamily('sans')}
                  className={`h-11 rounded-2xl text-sm ${
                    fontFamily === 'sans'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/[0.06] text-white'
                  }`}
                >
                  Moderna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed left-0 right-0 bottom-0 z-40 px-6 pb-7 pt-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center justify-between">
          {previousChapter ? (
            <Link
              href={`/biblia/${book}/${previousChapter}${backQuery}`}
              className="pointer-events-auto w-14 h-14 rounded-full bg-white/[0.10] border border-white/[0.10] flex items-center justify-center text-white text-3xl backdrop-blur"
            >
              ‹
            </Link>
          ) : (
            <div className="w-14" />
          )}

          {nextChapter ? (
            <Link
              href={`/biblia/${book}/${nextChapter}${backQuery}`}
              className="pointer-events-auto w-14 h-14 rounded-full bg-white/[0.10] border border-white/[0.10] flex items-center justify-center text-white text-3xl backdrop-blur"
            >
              ›
            </Link>
          ) : (
            <div className="w-14" />
          )}
        </div>
      </div>
    </div>
  )
}