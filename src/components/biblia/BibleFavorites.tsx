'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ChevronRight,
  Heart,
  Search,
} from 'lucide-react'
import { fetchBibleChapter } from '@/lib/biblia'
import { toggleBibleFavorite } from '@/lib/biblia/actions'

type Favorite = {
  id: string
  book: string
  chapter: number
  verse: number
  created_at: string
}

type FavoriteWithText = Favorite & {
  text: string
}

export default function BibleFavorites({
  favorites,
}: {
  favorites: Favorite[]
}) {
  const [items, setItems] = useState<FavoriteWithText[]>([])
  const [search, setSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState('Todos')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function load() {
      const verses = await Promise.all(
        favorites.map(async (fav) => {
          const chapter = await fetchBibleChapter(
            fav.book,
            fav.chapter
          )

          const verse = chapter.verses.find(
            (v) => v.verse === fav.verse
          )

          return {
            ...fav,
            text: verse?.text ?? '',
          }
        })
      )

      setItems(verses)
    }

    load()
  }, [favorites])

  async function removeFavorite(
    item: FavoriteWithText
  ) {
    setItems((prev) =>
      prev.filter((f) => f.id !== item.id)
    )

    startTransition(async () => {
      await toggleBibleFavorite({
        book: item.book,
        chapter: item.chapter,
        verse: item.verse,
      })
    })
  }

  const books = useMemo(() => {
    return [
      'Todos',
      ...Array.from(
        new Set(items.map((item) => item.book))
      ),
    ]
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesBook =
        selectedBook === 'Todos' ||
        item.book === selectedBook

      const query = search.toLowerCase()

      const matchesSearch =
        item.book.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query) ||
        `${item.chapter}:${item.verse}`.includes(query)

      return matchesBook && matchesSearch
    })
  }, [items, selectedBook, search])

  const groupedItems = useMemo(() => {
    const groups: Record<
      string,
      FavoriteWithText[]
    > = {}

    filteredItems.forEach((item) => {
      if (!groups[item.book]) {
        groups[item.book] = []
      }

      groups[item.book].push(item)
    })

    return groups
  }, [filteredItems])

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-10 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
          <Heart
            size={24}
            className="fill-current"
          />
        </div>

        <h2 className="mt-5 text-xl font-black text-white">
          Nenhum favorito ainda
        </h2>

        <p className="mt-3 text-sm leading-7 text-white/40">
          Durante a leitura, toque no coração de um
          versículo para montar sua coleção.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Pesquisar versículo..."
            className="h-12 w-full rounded-2xl border border-white/[0.08] bg-white/[0.045] pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-brand-500/30"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {books.map((book) => (
            <button
              key={book}
              onClick={() =>
                setSelectedBook(book)
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                selectedBook === book
                  ? 'bg-brand-500 text-white'
                  : 'border border-white/[0.08] bg-white/[0.045] text-white/60'
              }`}
            >
              {book}
            </button>
          ))}
        </div>
      </div>

            {Object.entries(groupedItems).map(
        ([book, verses]) => (
          <section
            key={book}
            className="mb-8"
          >
            <div className="mb-3 flex items-center gap-2">
              <BookOpen
                size={15}
                className="text-brand-300"
              />

              <h3 className="text-[17px] font-black tracking-tight text-white">
                {book}
              </h3>

              <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-bold text-white/35">
                {verses.length}
              </span>
            </div>

            <div className="space-y-3">
              {verses.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.045] backdrop-blur-xl transition duration-300 hover:border-brand-500/20"
                >
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <button
                    disabled={isPending}
                    onClick={() =>
                      removeFavorite(item)
                    }
                    className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 transition hover:scale-105"
                  >
                    <Heart
                      size={18}
                      className="fill-current"
                    />
                  </button>

                  <Link
                    href={`/biblia/${encodeURIComponent(
                      item.book
                    )}/${item.chapter}?verse=${item.verse}`}
                    className="block p-5 pr-20"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-300/75">
                      {item.book}{' '}
                      {item.chapter}:{item.verse}
                    </p>

                    <p className="mt-3 line-clamp-4 text-[16px] leading-8 text-white/85">
                      {item.text}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-[11px] text-white/30">
                        Salvo em{' '}
                        {new Date(
                          item.created_at
                        ).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>

                      <ChevronRight
                        size={17}
                        className="text-white/25 transition group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )
      )}

      {filteredItems.length === 0 && (
        <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.045] p-8 text-center backdrop-blur-xl">
          <Search
            size={24}
            className="mx-auto text-white/25"
          />

          <h3 className="mt-4 text-lg font-black text-white">
            Nada encontrado
          </h3>

          <p className="mt-2 text-sm leading-7 text-white/40">
            Tente pesquisar outro livro ou outro
            trecho do versículo.
          </p>
        </div>
      )}
    </>
  )
}