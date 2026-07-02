'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { BOOK_CHAPTERS } from '@/lib/biblia'

export default function BibleBooksSearch({
  oldTestament,
  newTestament,
}: {
  oldTestament: string[]
  newTestament: string[]
}) {
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()

  const filteredOld = useMemo(
    () =>
      oldTestament.filter((book) =>
        book.toLowerCase().includes(normalizedQuery)
      ),
    [oldTestament, normalizedQuery]
  )

  const filteredNew = useMemo(
    () =>
      newTestament.filter((book) =>
        book.toLowerCase().includes(normalizedQuery)
      ),
    [newTestament, normalizedQuery]
  )

  function Section({ title, books }: { title: string; books: string[] }) {
    if (books.length === 0) return null

    return (
      <section className="mb-8">
        <h2 className="text-[17px] font-bold text-white mb-3">
          {title}
        </h2>

        <div className="rounded-[28px] bg-white/[0.035] border border-white/[0.07] overflow-hidden">
          {books.map((book) => (
            <Link
              key={book}
              href={`/biblia/${book}/1`}
              className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] last:border-b-0"
            >
              <div>
                <p className="text-[14px] font-semibold text-white">
                  {book}
                </p>

                <p className="text-[11px] text-white/30 mt-0.5">
                  {BOOK_CHAPTERS[book]} capítulos
                </p>
              </div>

              <ChevronRight size={16} className="text-white/25" />
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="mt-8">
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar livro..."
          className="w-full h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 text-white placeholder:text-white/30 outline-none focus:border-brand-500/50"
        />
      </div>

      <Section title="Antigo Testamento" books={filteredOld} />
      <Section title="Novo Testamento" books={filteredNew} />

      {filteredOld.length === 0 && filteredNew.length === 0 && (
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4 text-center">
          <p className="text-sm text-white/45">
            Nenhum livro encontrado.
          </p>
        </div>
      )}
    </div>
  )
}